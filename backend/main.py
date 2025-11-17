"""
FAANG-Level NBA Shot Predictor API
A professional-grade FastAPI application for predicting NBA shot success with streetball aesthetics.
"""

import time
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn

from config import settings
from logging_config import setup_logging, get_logger
from exceptions import (
    ShotPredictorException,
    ValidationError,
    ModelError,
    PlayerNotFoundError,
    RateLimitError,
    ServiceUnavailableError
)
from models.schemas import (
    ShotDataRequest,
    ShotPredictionResponse,
    PlayersResponse,
    HealthCheckResponse,
    ErrorResponse,
    PredictionMetrics
)
from services.prediction_service import prediction_service
from services.player_service import player_service

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Application state
app_state = {
    "start_time": time.time(),
    "total_requests": 0,
    "successful_requests": 0,
    "failed_requests": 0
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Basketball Starting NBA Shot Predictor API...")
    logger.info(f"Environment: {'Development' if settings.debug else 'Production'}")
    logger.info(f"Version: {settings.api_version}")
    
    # Initialize services
    try:
        # Warm up the model
        await prediction_service.predict_shot(ShotDataRequest(
            LOC_X=0.0,
            LOC_Y=10.0,
            SHOT_DISTANCE=10.0,
            SHOT_TYPE=2,
            SHOT_ZONE_BASIC="Mid-Range",
            PLAYER_NAME="LeBron James"
        ))
        logger.info("SUCCESS Model warmed up successfully")
    except Exception as e:
        logger.error(f"ERROR Failed to warm up model: {e}")
    
    logger.info("READY NBA Shot Predictor API is ready!")
    
    yield
    
    # Shutdown
    logger.info("SHUTDOWN Shutting down NBA Shot Predictor API...")


# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins + [settings.frontend_url],
    allow_credentials=settings.allow_credentials,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)

if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
    )


# Middleware for request tracking and logging
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    """Middleware for request tracking and logging."""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Add request ID to headers
    request.state.request_id = request_id
    
    app_state["total_requests"] += 1
    
    try:
        response = await call_next(request)
        
        # Calculate response time
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        
        app_state["successful_requests"] += 1
        
        logger.info(
            f"Request completed: {request.method} {request.url.path} "
            f"Status: {response.status_code} Time: {process_time:.3f}s"
        )
        
        return response
        
    except Exception as e:
        app_state["failed_requests"] += 1
        logger.error(f"Request failed: {request.method} {request.url.path} Error: {str(e)}")
        raise


# Exception handlers
@app.exception_handler(ShotPredictorException)
async def shot_predictor_exception_handler(request: Request, exc: ShotPredictorException):
    """Handle custom shot predictor exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.__class__.__name__,
            message=exc.message,
            status_code=exc.status_code,
            details=exc.details,
            request_id=getattr(request.state, "request_id", None)
        ).dict()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    # Convert validation errors to serializable format
    validation_errors = []
    for error in exc.errors():
        validation_errors.append({
            "loc": list(error.get("loc", [])),
            "msg": str(error.get("msg", "")),
            "type": str(error.get("type", ""))
        })
    
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error="ValidationError",
            message="Request validation failed",
            status_code=422,
            details={"validation_errors": validation_errors},
            request_id=getattr(request.state, "request_id", None)
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="InternalServerError",
            message="An unexpected error occurred",
            status_code=500,
            request_id=getattr(request.state, "request_id", None)
        ).dict()
    )


# API Routes
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "🏀 NBA Shot Predictor API - Streetball Edition",
        "version": settings.api_version,
        "docs_url": "/docs" if settings.debug else "Documentation not available in production",
        "status": "ready"
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Comprehensive health check endpoint."""
    try:
        # Check model availability
        model_loaded = True
        try:
            prediction_service._get_model()
        except Exception:
            model_loaded = False
        
        uptime = time.time() - app_state["start_time"]
        
        return HealthCheckResponse(
            status="healthy" if model_loaded else "degraded",
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            version=settings.api_version,
            model_loaded=model_loaded,
            uptime_seconds=uptime,
            dependencies={
                "scikit-learn": "✅ Available",
                "pandas": "✅ Available",
                "fastapi": "✅ Available"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise ServiceUnavailableError("Health check failed")


@app.post("/predict", response_model=ShotPredictionResponse, tags=["Predictions"])
async def predict_shot(shot_data: ShotDataRequest):
    """
    Predict the probability of making a shot based on location, player, and shot type.
    
    This endpoint uses machine learning to predict whether an NBA player will make
    a shot from a specific location on the court, with enhanced analytics and caching.
    """
    try:
        logger.info(f"Prediction request for {shot_data.PLAYER_NAME} at ({shot_data.LOC_X}, {shot_data.LOC_Y})")
        
        # Validate player exists
        try:
            player_service.get_player_by_name(shot_data.PLAYER_NAME)
        except PlayerNotFoundError:
            logger.warning(f"Player not found: {shot_data.PLAYER_NAME}")
            # Allow prediction to continue with unknown player
        
        result = await prediction_service.predict_shot(shot_data)
        
        logger.info(f"Prediction successful: {result.probability:.3f} probability")
        return result
        
    except ModelError as e:
        logger.error(f"Model error during prediction: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during prediction: {e}")
        raise ModelError(f"Prediction failed: {str(e)}")


@app.get("/players", response_model=PlayersResponse, tags=["Players"])
async def get_players(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search players by name")
):
    """
    Get list of NBA players with pagination and search functionality.
    """
    try:
        if search:
            players = player_service.search_players(search)
            total = len(players)
            # Apply pagination to search results
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            players = players[start_idx:end_idx]
        else:
            players = player_service.get_all_players(page, per_page)
            total = player_service.get_total_players()
        
        return PlayersResponse(
            players=players,
            total=total,
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Error fetching players: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch players")


@app.get("/analytics", response_model=dict, tags=["Analytics"])
async def get_analytics():
    """Get prediction analytics and system metrics."""
    try:
        prediction_analytics = prediction_service.get_analytics()
        cache_stats = prediction_service.get_cache_stats()
        
        return {
            "system": {
                "uptime_seconds": time.time() - app_state["start_time"],
                "total_requests": app_state["total_requests"],
                "successful_requests": app_state["successful_requests"],
                "failed_requests": app_state["failed_requests"],
                "success_rate": app_state["successful_requests"] / max(app_state["total_requests"], 1)
            },
            "predictions": prediction_analytics,
            "cache": cache_stats
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")


@app.post("/cache/clear", tags=["Admin"])
async def clear_cache():
    """Clear prediction cache (admin endpoint)."""
    try:
        prediction_service.clear_cache()
        return {"message": "Cache cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear cache")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
