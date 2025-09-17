
import pandas as pd
import numpy as np
import torch
from stable_baselines3 import PPO
from finrl.config import INDICATORS
from data_utils import preprocess_for_finrl, get_historical_data

# --- FinRL Model and Data Loading ---
try:
    print("Backend: Loading FinRL PPO model...")
    PPO_MODEL_PATH = "inference_engine/agent_ppo_v1"
    model_ppo = PPO.load(PPO_MODEL_PATH)
    print("Backend: FinRL PPO model loaded successfully.")

    print("Backend: Loading trading data...")
    trade_df = pd.read_csv("inference_engine/trade_data_sp500.csv", index_col=0)
    trade_df['date'] = pd.to_datetime(trade_df['date'])
    print("Backend: Trading data loaded successfully.")
    
    TICKER_LIST_FROM_DATA = trade_df.tic.unique().tolist()
    
    finrl_concept_available = True

except Exception as e:
    print(f"CRITICAL ERROR: Failed to load FinRL model or data: {e}")
    finrl_concept_available = False

# Environment setup based on the training notebook
stock_dimension = len(TICKER_LIST_FROM_DATA) if 'TICKER_LIST_FROM_DATA' in locals() else 0
state_space = 1 + 2 * stock_dimension + len(INDICATORS) * stock_dimension
buy_cost_list = sell_cost_list = [0.001] * stock_dimension
num_stock_shares = [0] * stock_dimension

env_kwargs = {
    "hmax": 100,
    "initial_amount": 1000000,
    "num_stock_shares": num_stock_shares,
    "buy_cost_pct": buy_cost_list,
    "sell_cost_pct": sell_cost_list,
    "state_space": state_space,
    "stock_dim": stock_dimension,
    "tech_indicator_list": INDICATORS,
    "action_space": stock_dimension,
    "reward_scaling": 1e-4
}

async def get_batch_dynamic_finrl_predictions(tickers: list[str], days: int = 90):
    """
    Uses the loaded FinRL PPO model to get predictions for the given tickers.
    Accepts a custom number of days for historical data.
    """
    if not finrl_concept_available:
        return {"error": "FinRL model or data not available."}

    try:
        latest_trade_date = trade_df['date'].max()
        latest_df = trade_df[trade_df['date'] == latest_trade_date].sort_values(by='tic').reset_index(drop=True)

        for t in tickers:
            hist_df = get_historical_data(t, days=days)
            if not hist_df.empty:
                processed_df = preprocess_for_finrl(hist_df)
                latest_processed_df = processed_df[processed_df['date'] == processed_df['date'].max()]
                
                ticker_index = latest_df.index[latest_df['tic'] == t].tolist()
                if ticker_index:
                    for col in latest_processed_df.columns:
                        if col in latest_df.columns:
                            latest_df.loc[ticker_index[0], col] = latest_processed_df[col].values[0]

        stock_dimension = len(TICKER_LIST_FROM_DATA)
        
        initial_amount = env_kwargs['initial_amount']
        close_prices = latest_df['close'].values
        shares_owned = np.zeros(stock_dimension)

        indicator_values = []
        for indicator in INDICATORS:
            indicator_values.extend(latest_df[indicator].values)

        obs = np.hstack([
            np.array([initial_amount]), 
            shares_owned, 
            close_prices, 
            np.array(indicator_values)
        ]).astype(np.float32).reshape(1, -1)

        obs_tensor = torch.as_tensor(obs).to(model_ppo.policy.device)

        distribution = model_ppo.policy.get_distribution(obs_tensor)
        actions = distribution.get_actions(deterministic=True).clamp(-1, 1)
        actions = actions.detach().cpu().numpy()[0]

        predictions = {}
        for i, ticker in enumerate(tickers):
            try:
                ticker_idx_in_full_list = TICKER_LIST_FROM_DATA.index(ticker)
                ticker_action_value = actions[ticker_idx_in_full_list]
                
                if ticker_action_value > 0.05:
                    recommended_action = "BUY"
                elif ticker_action_value < -0.05:
                    recommended_action = "SELL"
                else:
                    recommended_action = "HOLD"

                ticker_data = latest_df[latest_df['tic'] == ticker].iloc[0]

                predictions[ticker] = {
                    "ticker": ticker,
                    "prediction_date": latest_df['date'].max().strftime('%Y-%m-%d'),
                    "recommended_action": recommended_action,
                    "action_value": float(ticker_action_value),
                    "key_metrics": {
                        "close_price": ticker_data['close'],
                        "volume": ticker_data['volume'],
                        "macd": ticker_data['macd'],
                        "rsi_30": ticker_data['rsi_30'],
                        "cci_30": ticker_data['cci_30'],
                        "boll_ub": ticker_data['boll_ub'],
                        "boll_lb": ticker_data['boll_lb'],
                        "dx_30": ticker_data['dx_30'],
                        "close_30_sma": ticker_data['close_30_sma'],
                        "close_60_sma": ticker_data['close_60_sma']
                    },
                    "reasoning_prompt": f"Inference engine analysis for {ticker} on {latest_df['date'].max().strftime('%Y-%m-%d')}."
                }
            except Exception as e:
                print(f"Backend: Error building prediction for ticker {ticker}: {e}")
                predictions[ticker] = {"error": f"Could not get prediction for {ticker}."}
        return predictions

    except Exception as e:
        print(f"Backend: Error during batch dynamic FinRL prediction: {e}")
        return {"error": "Could not get batch dynamic FinRL predictions."}
