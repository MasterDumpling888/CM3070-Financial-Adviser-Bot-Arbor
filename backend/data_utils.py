# backend/data_utils.py
import pandas as pd
from stockstats import StockDataFrame as Sdf
import yfinance as yf
from datetime import datetime, timedelta

def preprocess_for_finrl(df):
    """
    Preprocesses the fetched data to match the FinRL model's input format.
    """
    if df.empty:
        return df

    df_copy = df.copy().set_index('date')
    stock = Sdf(df_copy)

    # Add technical indicators
    stock['macd']
    stock['rsi_30']
    stock['cci_30']
    stock['boll_ub'] # Upper Bollinger Band
    stock['boll_lb'] # Lower Bollinger Band
    stock['dx_30'] # Directional Movement Index
    stock['close_30_sma']
    stock['close_60_sma']
    
    stock.reset_index(inplace=True)
    
    if 'date' not in stock.columns and 'index' in stock.columns:
        stock.rename(columns={'index': 'date'}, inplace=True)
    
    required_columns = ['date', 'open', 'high', 'low', 'close', 'volume', 'tic', 'macd', 'rsi_30', 'cci_30', 'boll_ub', 'boll_lb', 'dx_30','close_30_sma', 'close_60_sma']
    
    # Create a new dataframe with only the required columns
    processed_df = pd.DataFrame()
    for col in required_columns:
        if col in stock.columns:
            processed_df[col] = stock[col]

    # Some indicators might have NaN values for the first few rows, let's fill them
    processed_df = processed_df.bfill()

    return processed_df

def get_yfinance_quote(ticker: str):
    """
    Fetches the latest quote for a given ticker using yfinance.
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info or 'regularMarketPrice' not in info:
            return {"error": f"Could not fetch data for {ticker}. Ticker might be invalid or data not available."}

        current_price = info.get('regularMarketPrice')
        previous_close = info.get('previousClose')
        
        change = current_price - previous_close if current_price and previous_close else 0
        percent_change = (change / previous_close) * 100 if previous_close else 0

        return {
            "current_price": current_price,
            "change": change,
            "percent_change": percent_change,
            "high_price_of_the_day": info.get('dayHigh'),
            "low_price_of_the_day": info.get('dayLow'),
            "open_price_of_the_day": info.get('open'),
            "previous_close_price": previous_close
        }
    except Exception as e:
        print(f"Error fetching data from yfinance for {ticker}: {e}")
        return {"error": f"An unexpected error occurred while fetching data from yfinance for {ticker}."}

def get_yfinance_profile(ticker: str):
    """
    Fetches company profile data (specifically, the company name) using yfinance.
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {"name": info.get('longName') or info.get('shortName') or ticker}
    except Exception as e:
        print(f"Error fetching profile from yfinance for {ticker}: {e}")
        return {"name": ticker, "error": "Could not fetch profile data."}

def get_historical_data(ticker: str, days: int = 90):
    """
    Fetch historical OHLCV data for a ticker using yfinance.
    Returns a DataFrame with columns: date, open, high, low, close, volume, tic.
    """
    try:
        end_date = datetime.today()
        start_date = end_date - timedelta(days=days)

        df = yf.download(
            ticker,
            start=start_date.strftime("%Y-%m-%d"),
            end=end_date.strftime("%Y-%m-%d"),
            interval="1d",
            progress=False,
            auto_adjust=False
        )

        if df is None or df.empty:
            print(f"YFinance returned empty data for {ticker} from {start_date} to {end_date}")
            return pd.DataFrame()

        df = df.reset_index()

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = ["_".join([str(c) for c in col if c]).strip().lower() for col in df.columns]
        else:
            df.columns = [str(c).lower() for c in df.columns]

        df.columns = [c.replace(f"_{ticker.lower()}", "") for c in df.columns]

        rename_map = {
            "date": "date",
            "open": "open",
            "high": "high",
            "low": "low",
            "close": "close",
            "adj close": "adj_close",
            "volume": "volume",
        }
        df = df.rename(columns=rename_map)

        keep_cols = ["date", "open", "high", "low", "close", "volume"]
        if not all(col in df.columns for col in keep_cols):
            print(f"Missing expected columns after cleaning for {ticker}: {df.columns}")
            return pd.DataFrame()

        df = df[keep_cols]
        df["tic"] = ticker
        return df

    except Exception as e:
        print(f"Error fetching yfinance data for {ticker}: {e}")
        return pd.DataFrame()