# Create this file: backend/api/index.py
# This is the entry point for Vercel

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import your existing FastAPI app
from main import app

# Configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export the app for Vercel
handler = app