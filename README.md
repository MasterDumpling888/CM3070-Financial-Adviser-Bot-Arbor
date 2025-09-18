
<img width="1584" height="396" alt="Slide 16_9 - 17" src="https://github.com/user-attachments/assets/44917f54-2c74-404d-891d-bad9a59bbca0" />

# Financial Advisor Bot
## Setup Tutorial
https://youtu.be/VGD1pPXQCmI

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

The backend uses Firebase Firestore for data persistence. You will need to create your own Firebase project to get the necessary credentials.

1.  **Create a Firebase project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Firestore:** In your new project, go to the "Firestore Database" section and create a new database in production mode.
3.  **Generate a private key:**
    - In your Firebase project, go to **Project settings** (the gear icon next to "Project Overview").
    - Go to the **Service accounts** tab.
    - Click on **Generate new private key**. This will download a JSON file with your service account credentials.
4.  **Add the key to the project:**
    - Rename the downloaded JSON file to `serviceAccountKey.json`.
    - Place this file in the `backend/` directory.

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory and add the following content. You will get these values from your Firebase project settings.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
```

### Running the Application

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
