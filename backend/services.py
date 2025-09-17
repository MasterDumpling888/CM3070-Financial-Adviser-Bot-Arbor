import asyncio
import json
import uuid
from fastapi import HTTPException
from firebase_admin import firestore
from firebase_config import db
from finrl_engine import get_batch_dynamic_finrl_predictions, TICKER_LIST_FROM_DATA
from llm import (
    add_tooltips,
    get_generic_llm_summary,
    get_ollama_llm_response,
    get_summarized_title,
    process_natural_language_prompt,
    extract_time_window_from_llm,
    should_analyze_watchlist,
    get_watchlist_analysis_summary,
)
from data_utils import get_yfinance_quote, get_yfinance_profile, get_historical_data
from schemas import ChatRequest, ChatResponse, RenameRequest

async def handle_chat(request: ChatRequest):
    user_id = request.user_id
    user_message = request.user_message
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
    is_new_chat = request.is_new_chat

    if user_id:
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            is_new_chat = True

        if is_new_chat and conversation_id:
            try:
                summarized_title = await get_summarized_title(user_message)
                await asyncio.to_thread(lambda: db.collection('users').document(user_id).collection('conversations').document(conversation_id).set({
                    'title': summarized_title,
                    'timestamp': firestore.SERVER_TIMESTAMP
                }))
            except Exception as e:
                print(f"Error creating new conversation in Firestore: {e}")

    if await should_analyze_watchlist(user_message):
        analysis_response = await analyze_watchlist(user_id)
        if "error" in analysis_response:
            return ChatResponse(bot_message=json.dumps({"chat_messages": [analysis_response["error"]], "cards": []}), conversation_id=conversation_id, is_advice=True)
        else:
            chat_message = analysis_response.get("summary_text", "")
            watchlist_cards = analysis_response.get("watchlist_cards", [])
            return ChatResponse(bot_message=json.dumps({"chat_messages": [add_tooltips(chat_message)], "cards": watchlist_cards}), conversation_id=conversation_id, is_advice=True)

    card_responses = []
    chat_responses = []

    if user_id:
        try:
            await asyncio.to_thread(lambda: db.collection('users').document(user_id).collection('conversations').document(conversation_id).collection('messages').add({
                'timestamp': firestore.SERVER_TIMESTAMP,
                'sender': 'user',
                'message': user_message
            }))
        except Exception as e:
            print(f"Error saving user message to Firestore: {e}")

    identified_tickers = await process_natural_language_prompt(user_message)
    supported_tickers = [t for t in identified_tickers if t in TICKER_LIST_FROM_DATA]
    unsupported_tickers = [t for t in identified_tickers if t not in TICKER_LIST_FROM_DATA]

    days = await extract_time_window_from_llm(user_message)

    is_advice_response = bool(supported_tickers)

    if supported_tickers:
        if days != 90:
            for ticker in supported_tickers:
                hist_data = get_historical_data(ticker, days)
                if not hist_data.empty:
                    trend_prompt = f"The following is the historical price data for {ticker} for the last {days} days, from oldest to newest:\n\n{hist_data[['date', 'close']].to_string(index=False)}\n\nBased *only* on this data, briefly summarize the price trend over this period."
                    trend_summary = await get_generic_llm_summary(trend_prompt)
                    chat_responses.append(add_tooltips(f"Regarding the {days}-day trend for {ticker}: {trend_summary}"))

        predictions = await get_batch_dynamic_finrl_predictions(supported_tickers, days=days)

        if "error" in predictions:
            chat_responses.append(f"I couldn't retrieve FinRL predictions at this time.")
        else:
            for ticker in supported_tickers:
                finrl_data = predictions.get(ticker)
                if not finrl_data or "error" in finrl_data:
                    chat_responses.append(f"I couldn't retrieve a FinRL prediction for {ticker} at this time.")
                    continue

                quote = get_yfinance_quote(ticker)
                if quote and 'error' not in quote:
                    finrl_data.setdefault("key_metrics", {})
                    finrl_data["key_metrics"]["current_price"] = quote.get("current_price")
                    finrl_data["key_metrics"]["percent_change"] = quote.get("percent_change")
                else:
                    finrl_data.setdefault("key_metrics", {})
                    finrl_data["key_metrics"]["current_price"] = "N/A"
                    finrl_data["key_metrics"]["percent_change"] = "N/A"
                    error_message = quote.get("error") if quote else f"Could not fetch real-time price for {ticker} from Finnhub. The displayed price may be from the last trading day."
                    chat_responses.append(error_message)

                llm_response = await get_ollama_llm_response(finrl_data)

                if "error" in llm_response:
                    chat_responses.append(f"The AI model failed to generate a detailed analysis for {ticker}.")
                    continue

                card = {
                    "ticker": finrl_data.get("ticker"),
                    "prediction_date": finrl_data.get("prediction_date"),
                    "recommendation": {
                        "action": finrl_data.get("recommended_action"),
                        "summary": add_tooltips(llm_response.get("summary_text")),
                        "action_tags": llm_response.get("action_tags")
                    },
                    "analysis": {
                        "pros": [add_tooltips(pro) for pro in llm_response.get("pros", [])],
                        "cons": [add_tooltips(con) for con in llm_response.get("cons", [])]
                    },
                    "data": {
                        "close_price": finrl_data.get("key_metrics", {}).get("close_price"),
                        "volume": finrl_data.get("key_metrics", {}).get("volume"),
                        "technical_indicators": {
                            "macd": finrl_data.get("key_metrics", {}).get("macd"),
                            "rsi_30": finrl_data.get("key_metrics", {}).get("rsi_30"),
                            "cci_30": finrl_data.get("key_metrics", {}).get("cci_30"),
                            "boll_ub": finrl_data.get("key_metrics", {}).get("boll_ub"),
                            "boll_lb": finrl_data.get("key_metrics", {}).get("boll_lb"),
                            "dx_30": finrl_data.get("key_metrics", {}).get("dx_30"),
                            "close_30_sma": finrl_data.get("key_metrics", {}).get("close_30_sma"),
                            "close_60_sma": finrl_data.get("key_metrics", {}).get("close_60_sma")
                        },
                        "current_price": finrl_data.get("key_metrics", {}).get("current_price"),
                        "percent_change": finrl_data.get("key_metrics", {}).get("percent_change"),
                    },
                    "is_finrl_advice": True
                }
                card_responses.append(card)

    if unsupported_tickers:
        for ticker in unsupported_tickers:
            general_llm_prompt = f"Please provide a brief, general overview of the company with the stock ticker {ticker}. I cannot provide a detailed FinRL analysis for it. Keep the summary concise and conversational."
            summary = await get_generic_llm_summary(general_llm_prompt)
            chat_responses.append(add_tooltips(summary))

    if not identified_tickers and not unsupported_tickers and not supported_tickers:
        is_advice_response = False
        summary = await get_generic_llm_summary(user_message)
        chat_responses.append(add_tooltips(summary))

    if card_responses:
        ticker_names = [card['ticker'] for card in card_responses]
        if len(ticker_names) > 1:
            summary_for_cards = f"I have prepared a detailed analysis for {', '.join(ticker_names)}. You can find the cards below."
        else:
            summary_for_cards = f"Here is the analysis for {ticker_names[0]}."
        chat_responses.insert(0, add_tooltips(summary_for_cards))

    final_response_payload = {
        "cards": card_responses,
        "chat_messages": chat_responses
    }
    final_bot_message = json.dumps(final_response_payload)
    
    if user_id:
        try:
            await asyncio.to_thread(lambda: db.collection('users').document(user_id).collection('conversations').document(conversation_id).collection('messages').add({
                'timestamp': firestore.SERVER_TIMESTAMP,
                'sender': 'bot',
                'message': final_bot_message
            }))
        except Exception as e:
            print(f"Error saving bot message to Firestore: {e}")

    return ChatResponse(bot_message=final_bot_message, conversation_id=conversation_id, is_advice=is_advice_response)

async def add_to_watchlist(user_id: str, ticker: str):
    try:
        await asyncio.to_thread(lambda: db.collection('users').document(user_id).collection('watchlist').document(ticker).set({
            'ticker': ticker,
            'added_at': firestore.SERVER_TIMESTAMP
        }))
        return {"message": f"Added {ticker} to {user_id}'s watchlist."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to watchlist: {e}")

async def remove_from_watchlist(user_id: str, ticker: str):
    try:
        await asyncio.to_thread(lambda: db.collection('users').document(user_id).collection('watchlist').document(ticker).delete())
        return {"message": f"Removed {ticker} from {user_id}'s watchlist."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing from watchlist: {e}")

async def get_watchlist(user_id: str):
    try:
        loop = asyncio.get_event_loop()
        watchlist_ref = db.collection('users').document(user_id).collection('watchlist')
        docs = await asyncio.to_thread(watchlist_ref.get)
        
        watchlist_with_data = []
        for doc in docs:
            ticker_data = doc.to_dict()
            ticker = ticker_data.get('ticker')
            if ticker:
                quote = await loop.run_in_executor(None, get_yfinance_quote, ticker)
                profile = await loop.run_in_executor(None, get_yfinance_profile, ticker)
                if quote and 'error' not in quote:
                    ticker_data.update(quote)
                    ticker_data['price'] = ticker_data.get('current_price')
                    ticker_data['change'] = ticker_data.get('percent_change')
                    ticker_data['name'] = profile.get('name', ticker)
                else:
                    ticker_data['current_price'] = 'N/A'
                    ticker_data['change'] = 'N/A'
                    ticker_data['percent_change'] = 'N/A'
                    ticker_data['high_price_of_the_day'] = 'N/A'
                    ticker_data['low_price_of_the_day'] = 'N/A'
                    ticker_data['open_price_of_the_day'] = 'N/A'
                    ticker_data['previous_close_price'] = 'N/A'
                    ticker_data['error'] = quote.get('error') if quote else 'Could not fetch real-time price from yfinance.'
                watchlist_with_data.append(ticker_data)

        return {"watchlist": watchlist_with_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting watchlist: {e}")

async def get_stocks(limit: int = None):
    if limit:
        return {"stocks": TICKER_LIST_FROM_DATA[:limit]}
    return {"stocks": TICKER_LIST_FROM_DATA}

async def get_single_stock_data(ticker: str):
    loop = asyncio.get_event_loop()
    quote_data = await loop.run_in_executor(None, get_yfinance_quote, ticker)
    profile_data = await loop.run_in_executor(None, get_yfinance_profile, ticker)
    
    combined_data = {"ticker": ticker}
    if "error" in quote_data:
        raise HTTPException(status_code=404, detail=quote_data["error"])
    else:
        combined_data.update(quote_data)
        combined_data["name"] = profile_data.get("name", ticker)
    return combined_data

async def get_stock_data(tickers: str):
    loop = asyncio.get_event_loop()
    ticker_list = tickers.split(',')
    results = []
    for ticker in ticker_list:
        quote_data = await loop.run_in_executor(None, get_yfinance_quote, ticker)
        profile_data = await loop.run_in_executor(None, get_yfinance_profile, ticker)
        
        combined_data = {"ticker": ticker}
        if "error" in quote_data:
            combined_data["error"] = quote_data["error"]
        else:
            combined_data.update(quote_data)
            combined_data["name"] = profile_data.get("name", ticker)

        results.append(combined_data)
    return results

async def get_conversations(user_id: str):
    try:
        conversations_ref = db.collection('users').document(user_id).collection('conversations').order_by('timestamp', direction=firestore.Query.DESCENDING)
        docs = await asyncio.to_thread(conversations_ref.stream)
        conversations = []
        for doc in docs:
            conv_data = doc.to_dict()
            conversations.append({
                "id": doc.id,
                "title": conv_data.get("title", "Untitled Conversation"),
                "timestamp": conv_data.get("timestamp").isoformat() if conv_data.get("timestamp") else None
            })
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting conversations: {e}")

async def delete_conversation(user_id: str, conversation_id: str):
    try:
        loop = asyncio.get_event_loop()
        messages_ref = db.collection('users').document(user_id).collection('conversations').document(conversation_id).collection('messages')
        docs = await loop.run_in_executor(None, messages_ref.stream)
        for doc in docs:
            await loop.run_in_executor(None, doc.reference.delete)

        await loop.run_in_executor(None, lambda: db.collection('users').document(user_id).collection('conversations').document(conversation_id).delete())
        return {"message": f"Conversation {conversation_id} deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {e}")

async def rename_conversation(user_id: str, conversation_id: str, request: RenameRequest):
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: db.collection('users').document(user_id).collection('conversations').document(conversation_id).update({
            'title': request.new_title
        }))
        return {"message": f"Conversation {conversation_id} renamed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error renaming conversation: {e}")

async def get_chat_history(user_id: str, conversation_id: str):
    try:
        loop = asyncio.get_event_loop()
        messages_ref = db.collection('users').document(user_id).collection('conversations').document(conversation_id).collection('messages').order_by('timestamp')
        docs = await loop.run_in_executor(None, messages_ref.stream)
        chat_history = []
        for doc in docs:
            message_data = doc.to_dict()
            chat_history.append({
                "sender": message_data.get("sender"),
                "message": message_data.get("message")
            })
        return {"chat_history": chat_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat history: {e}")