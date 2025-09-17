
import requests
import json
import re

# Configuration for Ollama
OLLAMA_API_URL = "http://localhost:11434/api/chat" 
OLLAMA_MODEL_NAME = "gemma3"

# Load financial terms dictionary
try:
    with open('../frontend/lib/financial-terms.json', 'r') as f:
        financial_terms_db = json.load(f)
except FileNotFoundError:
    financial_terms_db = {}
except json.JSONDecodeError:
    financial_terms_db = {}

async def extract_tickers_from_llm(user_message: str) -> list[str]:
    """
    Uses the Ollama LLM to extract a list of stock tickers from the user message.
    """
    system_prompt = '''You are a financial expert AI. Your task is to identify all company names and stock tickers mentioned in the user's message and convert them to their official stock ticker symbol. Return a JSON object with a single key "tickers" which contains a list of the ticker symbols. For example, for the message "show me apple and msft", you should return {"tickers": ["AAPL", "MSFT"]}. If no tickers or company names are found, return an empty list in the JSON object: {"tickers": []}.'''
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": messages,
        "stream": False,
        "format": "json" # Request JSON output
    }
    try:
        print("Backend: Calling Ollama for ticker extraction...") # DEBUG
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=20)
        response.raise_for_status()
        response_json = response.json()
        content = response_json.get("message", {}).get("content", "{}").strip()
        
        print(f"Backend: Ollama response content: '{content}'") # DEBUG

        tickers_data = json.loads(content)
        print(f"Backend: Parsed tickers: {tickers_data}") # DEBUG
        
        ticker_list = []
        if isinstance(tickers_data, list):
            ticker_list = tickers_data
        elif isinstance(tickers_data, dict):
            ticker_list = tickers_data.get("tickers", [])
        
        if ticker_list:
            return [str(t).upper() for t in ticker_list if isinstance(t, str)]
            
        return []
    except Exception as e:
        print(f"Error extracting tickers from LLM: {e}")
        return []

async def process_natural_language_prompt(user_message: str) -> list[str]:
    """
    Processes the user's message to extract tickers using the new utility function.
    """
    return await extract_tickers_from_llm(user_message)

async def extract_time_window_from_llm(user_message: str) -> int:
    """
    Uses the Ollama LLM to extract the timeframe (in days) from the user message.
    Returns an integer number of days, defaulting to 90 if not found or error.
    """
    system_prompt = (
        "You are a financial assistant AI. Your task is to determine the time window in days that the user is referring to in their message. "
        "If the user asks for a prediction for the next N days, N weeks, N months, N years, or a timeframe (e.g., 'next week', 'next 3 months', '6 months outlook'), "
        "extract the number of days as an integer. If the user does not specify a timeframe, reply with 90. "
        "Your response should be a single integer (number of days) only, with no other text."
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": messages,
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=20)
        response.raise_for_status()
        response_json = response.json()
        content = response_json.get("message", {}).get("content", "").strip()
        match = re.search(r"\d+", content)
        if match:
            days = int(match.group(0))
            if days > 0:
                return days
        return 90
    except Exception as e:
        print(f"Error extracting time window from LLM: {e}")
        return 90

async def get_ollama_llm_response(finrl_data: dict) -> dict:
    """
    Gets a detailed, structured response from the Ollama LLM based on FinRL data.
    """
    system_prompt = '''
You are an expert financial analyst AI. Your task is to interpret the provided FinRL model data and generate a comprehensive, structured financial analysis.

The user will provide a JSON object containing the FinRL model's predictions and key metrics for a specific stock. This includes:
- `recommended_action`: The action suggested by the model (BUY, SELL, HOLD).
- `action_value`: A raw numerical value from the model. Positive values lean towards buying, negative towards selling.
- `key_metrics`: Technical indicators like MACD, RSI, CCI, etc.

Your response MUST be a single, clean JSON object with the following structure:
{
  "summary_text": "A concise, easy-to-understand summary of the recommendation.",
  "action_tags": ["BULLISH" | "BEARISH" | "NEUTRAL", "SHORT-TERM" | "LONG-TERM", "HIGH-RISK" | "MODERATE-RISK" | "LOW-RISK"],
  "pros": [
    "A list of bullet points outlining the positive aspects or reasons supporting the recommendation.",
    "Each point should be a string."
  ],
  "cons": [
    "A list of bullet points outlining the negative aspects or potential risks.",
    "Each point should be a string."
  ]
}

Analyze all the provided data. Use the technical indicators to build the `pros` and `cons` lists. The reasoning should be sound and directly related to the data provided.
'''

    user_prompt = f"""
Here is the FinRL model data for analysis:
{json.dumps(finrl_data, indent=2)}

Please generate the structured financial analysis in the specified JSON format.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": messages,
        "stream": False,
        "format": "json"
    }

    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        response_json = response.json()
        
        bot_content_str = response_json.get("message", {}).get("content", "{}")
        bot_content_dict = json.loads(bot_content_str)

        required_keys = ["summary_text", "action_tags", "pros", "cons"]
        if not all(key in bot_content_dict for key in required_keys):
            return {"error": "Invalid response format from LLM."}

        return bot_content_dict

    except requests.exceptions.RequestException as e:
        return {"error": f"Could not connect to Ollama: {e}"}
    except json.JSONDecodeError:
        return {"error": "Failed to parse LLM response."}
    except Exception as e:
        return {"error": "An unexpected error occurred."}

async def get_summarized_title(user_message: str) -> str:
    """
    Uses the Ollama LLM to generate a concise title for a new chat conversation.
    """
    system_prompt = "You are a title generation AI. Your task is to create a short, concis but descriptive title (up to 5 words) for a new chat conversation based on the user's first message. The title should capture the main topic of the conversation. No need for bold text output"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": messages,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=30)
        response.raise_for_status()
        response_json = response.json()
        
        title = response_json.get("message", {}).get("content", "").strip()
        
        if not title:
            return user_message[:50]
            
        return title

    except requests.exceptions.RequestException as e:
        return user_message[:50]
    except Exception as e:
        return user_message[:50]


async def get_generic_llm_summary(prompt: str) -> str:
    """
    Uses the Ollama LLM to generate a generic summary based on a prompt.
    """
    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a helpful financial bot. Summarize the provided information concisely and conversationally in one or two sentences."},
            {"role": "user", "content": prompt}
        ],
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        response_json = response.json()
        summary = response_json.get("message", {}).get("content", "I couldn't retrieve a summary at this time.")
        return summary
    except Exception as e:
        return "I had trouble generating a summary."


def add_tooltips(text: str) -> list:
    if not financial_terms_db or not text:
        return [{"text": text, "isTerm": False}]

    sorted_terms = sorted(financial_terms_db.keys(), key=len, reverse=True)
    pattern = re.compile(r'(\b' + '|\b'.join(re.escape(term) for term in sorted_terms) + r'\b)', re.IGNORECASE)
    
    parts = []
    last_idx = 0

    for match in pattern.finditer(text):
        start, end = match.span()
        if start > last_idx:
            parts.append({"text": text[last_idx:start], "isTerm": False})
        
        term = match.group(0)
        definition = financial_terms_db.get(term.lower(), {}).get("definition", "")
        parts.append({"text": term, "isTerm": True, "definition": definition})
        
        last_idx = end

    if last_idx < len(text):
        parts.append({"text": text[last_idx:], "isTerm": False})

    return parts

async def get_watchlist_analysis_summary(buy_tickers: list, sell_tickers: list, hold_tickers: list) -> dict:
    """
    Uses the LLM to generate a summary and confidence score for the watchlist analysis.
    """
    if not buy_tickers and not sell_tickers and not hold_tickers:
        return {"summary_text": "There are no new recommendations for your watchlist at this time."}

    system_prompt = '''
You are an expert financial analyst AI. Your task is to provide a summary for a watchlist analysis.

Your response MUST be a single, clean JSON object with the following structure, and ONLY this JSON object:
{
  "summary_text": "A concise, easy-to-understand summary of the recommendations for the entire watchlist."
}

Analyze the provided ticker lists to formulate your analysis. The reasoning should be sound and directly related to the data.
'''

    user_prompt = f"""
Here are the watchlist analysis results:
- Buy: {buy_tickers}
- Sell: {sell_tickers}
- Hold: {hold_tickers}

Please generate the structured financial analysis in the specified JSON format.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": messages,
        "stream": False,
        "format": "json"
    }

    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        response_json = response.json()
        
        bot_content_str = response_json.get("message", {}).get("content", "{}")
        bot_content_dict = json.loads(bot_content_str)

        summary_text = bot_content_dict.get("summary_text", "Could not generate a summary for your watchlist.")

        return {"summary_text": summary_text}

    except json.JSONDecodeError:
        return {"error": "Failed to parse LLM response.", "summary_text": ""}
    except Exception as e:
        return {"error": "An unexpected error occurred.", "summary_text": ""}

async def should_analyze_watchlist(user_message: str) -> bool:
    """
    Uses the LLM to determine if the user wants to analyze their watchlist.
    """
    system_prompt = "You are a financial assistant AI. Your task is to determine if the user wants to analyze their stock watchlist. Respond with 'true' if they do, and 'false' if they don't. For example, if the user says 'analyze my watchlist', 'give me info on my watchlist', or 'should I buy or sell the stocks in my watchlist?', you should respond with 'true'. If the user asks about a specific stock, even if it's on their watchlist, you should respond with 'false'."
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": messages,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=30)
        response.raise_for_status()
        response_json = response.json()
        
        content = response_json.get("message", {}).get("content", "").strip().lower()
        return content == "true"

    except Exception as e:
        return False
