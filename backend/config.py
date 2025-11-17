"""Application configuration management."""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    model_config = {
        'protected_namespaces': (),
        'env_file': '.env',
        'case_sensitive': False
    }
    
    # API Configuration
    api_title: str = "NBA Shot Predictor API"
    api_description: str = "FAANG-level NBA shot prediction service with streetball aesthetics"
    api_version: str = "2.0.0"
    debug: bool = False
    
    # CORS Configuration
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://nba-shot-predictor.vercel.app"
    ]
    allowed_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: List[str] = ["*"]
    allow_credentials: bool = True
    
    # Model Configuration
    model_path: str = "models/full_pipeline.pkl"
    model_cache_ttl: int = 3600  # 1 hour
    prediction_timeout: float = 5.0  # 5 seconds
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # 1 minute
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Health Check
    health_check_timeout: float = 30.0
    
    # Cache Configuration
    redis_url: str = "redis://localhost:6379"
    cache_default_ttl: int = 300  # 5 minutes


# Global settings instance
settings = Settings()