"""Custom exceptions for the NBA Shot Predictor API."""

from typing import Any, Dict, Optional


class ShotPredictorException(Exception):
    """Base exception for all shot predictor errors."""
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(ShotPredictorException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=422, details=details)


class ModelError(ShotPredictorException):
    """Raised when model prediction fails."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=503, details=details)


class PlayerNotFoundError(ShotPredictorException):
    """Raised when a requested player is not found."""
    
    def __init__(self, player_name: str):
        super().__init__(
            f"Player '{player_name}' not found",
            status_code=404,
            details={"player_name": player_name}
        )


class RateLimitError(ShotPredictorException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, retry_after: int):
        super().__init__(
            "Rate limit exceeded. Please try again later.",
            status_code=429,
            details={"retry_after": retry_after}
        )


class ServiceUnavailableError(ShotPredictorException):
    """Raised when service is temporarily unavailable."""
    
    def __init__(self, message: str = "Service temporarily unavailable"):
        super().__init__(message, status_code=503)