
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_routes import router as api_router

app = FastAPI(
    title="Financial Advisor Bot Backend (Prototype)",
    description="A prototype backend demonstrating LLM intelligence (Gemma via Ollama) "
                "with conceptual FinRL integration for financial advice.",
    version="0.0.1"
)

# CORS Middleware Configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080", 
    "http://127.0.0.1:5500",
    "null"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(api_router)
