import firebase_admin
from firebase_admin import credentials, firestore
import os

# Path to your service account key file
# Make sure this file is NOT committed to your Git repository!
SERVICE_ACCOUNT_KEY_PATH = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully.")
else:
    print("Firebase Admin SDK already initialized.")

db = firestore.client()
