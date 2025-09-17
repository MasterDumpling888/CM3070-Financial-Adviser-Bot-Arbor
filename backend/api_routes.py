
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from schemas import ChatRequest, ChatResponse, RenameRequest
import services

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    return await services.handle_chat(request)

@router.post("/watchlist/{user_id}")
async def add_to_watchlist(user_id: str, ticker: str):
    return await services.add_to_watchlist(user_id, ticker)

@router.delete("/watchlist/{user_id}/{ticker}")
async def remove_from_watchlist(user_id: str, ticker: str):
    return await services.remove_from_watchlist(user_id, ticker)

@router.get("/watchlist/{user_id}")
async def get_watchlist(user_id: str):
    return await services.get_watchlist(user_id)

@router.get("/stocks")
async def get_stocks(limit: Optional[int] = None):
    return await services.get_stocks(limit)

@router.get("/stock/{ticker}")
async def get_single_stock_data(ticker: str):
    return await services.get_single_stock_data(ticker)

@router.get("/stock_data")
async def get_stock_data(tickers: str):
    return await services.get_stock_data(tickers)

@router.get("/conversations/{user_id}")
async def get_conversations(user_id: str):
    return await services.get_conversations(user_id)

@router.delete("/conversations/{user_id}/{conversation_id}")
async def delete_conversation(user_id: str, conversation_id: str):
    return await services.delete_conversation(user_id, conversation_id)

@router.put("/conversations/{user_id}/{conversation_id}/rename")
async def rename_conversation(user_id: str, conversation_id: str, request: RenameRequest):
    return await services.rename_conversation(user_id, conversation_id, request)

@router.get("/chat_history/{user_id}/{conversation_id}")
async def get_chat_history(user_id: str, conversation_id: str):
    return await services.get_chat_history(user_id, conversation_id)

@router.get("/historical-data/{ticker}")
async def get_historical_data_endpoint(ticker: str, days: int = 90):
    df = services.get_historical_data(ticker, days)
    if not df.empty:
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    return JSONResponse(content=df.to_dict(orient="records"))
