from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, backend_path)

# Import your existing FastAPI app
try:
    from main import app
except ImportError:
    # Fallback if import fails
    app = FastAPI(title="NBA Shot Predictor API", version="2.0.0")

# Ensure CORS is configured
if not any(isinstance(middleware, CORSMiddleware) for middleware in getattr(app, 'user_middleware', [])):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# This is the handler that Vercel will use
def handler(request):
    return app