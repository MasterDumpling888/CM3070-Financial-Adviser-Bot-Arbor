from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    user_message: str
    conversation_id: Optional[str] = None
    is_new_chat: bool = False

class ChatResponse(BaseModel):
    bot_message: str
    conversation_id: str
    is_advice: bool = False

class RenameRequest(BaseModel):
    new_title: str
