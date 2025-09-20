<img width="1584" height="396" alt="Slide 16_9 - 17" src="https://github.com/user-attachments/assets/44917f54-2c74-404d-891d-bad9a59bbca0" />

# Financial Advisor Bot

## Setup Tutorial

https://youtu.be/PBPzo0C7idY

## Overview

This project is an undergraduate thesis project that implements a financial advisor bot. The bot is designed to aid financial literacy amongst the elderly, youths, and financial novices by providing quick access to financial advice and direction. The project integrates a Gemma LLM as the chatbot and a FinRL-trained model for handling stock market-specific prompts from the user. The chatbot's response is designed to be an insightful financial card and a summary.

## Features

- **Conversational AI:** A chatbot powered by Google's Gemma LLM for natural language conversations.
- **FinRL Integration:** Utilizes a FinRL-trained model for stock market analysis and predictions.
- **Financial Insights:** Provides financial advice in the form of easy-to-understand cards and summaries.
- **User-Specific Watchlist:** Users can create and manage their own stock watchlists.
- **Financial Terminology Definitions:** Provides definitions for financial terms.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, FinRL, Stable Baselines3, PyTorch, Gemma (via Ollama)
- **Database:** Firebase Firestore

## Project Structure

```
/
├── backend/            # Contains the Python FastAPI backend
│   ├── api_routes.py     # FastAPI routes
│   ├── data_utils.py     # Data fetching and preprocessing
│   ├── finrl_engine.py   # FinRL model loading and prediction
│   ├── llm.py            # Gemma LLM interaction
│   ├── services.py       # Business logic
│   ├── main.py           # FastAPI app entry point
│   ├── requirements.txt  # Python dependencies
│   └── ...
└── frontend/           # Contains the Next.js frontend
    ├── app/              # Next.js app directory
    ├── components/       # React components
    ├── public/           # Static assets
    ├── package.json      # Node.js dependencies
    └── ...
```

## Getting Started

To run this project locally, you will need to have Python, Node.js, and Ollama installed on your machine.

### Setting Up Your Environment

#### 1. Ollama

The backend uses Ollama to run the Gemma LLM locally.

1.  **Install Ollama:** Follow the instructions on the [Ollama website](https://ollama.ai/) to download and install it on your machine.
2.  **Pull the Gemma model:** Once Ollama is running, open your terminal and run the following command to download the `gemma3` model:
    ```bash
    ollama pull gemma3
    ```

#### 2. Firebase

The backend uses Firebase Firestore for data persistence. You will need to download the admin SDK API key to make it work. **You must download this for the project to work.**

Ideally, the `serviceAccountKey.json` cannot be shared, but for the sake of testing this prototype,the key will be provided separately through a Google drive link, so please ensure that you destroy this key after having test this prototype. Thank you!

https://drive.google.com/file/d/1jVj40zvPQjR5hkSxsCbrKoRCmTwd3qKx/view?usp=sharing

1.  **Download the `serviceAccountKey.json`:** from the Google Drive link.
2.  Put it in the `backend/` directory.

### Running the Application

#### Trade Data

Like the downloading process for the Firebase Admin SDK, please download the trade data environment for the inference engine in work.

Since the trade data is too large to be uploaded to the GitHub repository, and to reduce the complexity of downloading through GitHub LFS, please download the file through a Google Drive link. **You must download this data for the engine to work.**

https://drive.google.com/file/d/1mGm5O4fFhHW7OwodeU5abVmHN7uvqUxT/view?usp=sharing

1. Download the file from the Google Drive link.
2. Put in in the `backend/inference_engine` directory

#### Backend

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install Node.js dependencies (for Firebase):**

    ```bash
    npm install
    ```

3.  **Install Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the FastAPI server:**
    ```bash
    uvicorn main:app --reload
    ```

#### Frontend

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```

Once both the backend and frontend servers are running, access the application in your browser at `http://localhost:3000`.

**If you need help in setting up this project in your locally machine, please contact me through this email: drachel.lim@gmail.com**
