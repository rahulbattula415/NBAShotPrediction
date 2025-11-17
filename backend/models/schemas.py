"""Pydantic models for request/response validation."""

from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum


class ShotType(str, Enum):
    """Shot type enumeration."""
    TWO_POINT = "2PT Field Goal"
    THREE_POINT = "3PT Field Goal"


class ShotZone(str, Enum):
    """Shot zone enumeration."""
    RESTRICTED_AREA = "Restricted Area"
    IN_THE_PAINT = "In The Paint (Non-RA)"
    MID_RANGE = "Mid-Range"
    LEFT_CORNER_3 = "Left Corner 3"
    RIGHT_CORNER_3 = "Right Corner 3"
    ABOVE_THE_BREAK_3 = "Above the Break 3"


class Player(BaseModel):
    """Player model."""
    id: int
    name: str
    team: Optional[str] = None
    position: Optional[str] = None
    jersey_number: Optional[int] = None
    height: Optional[str] = None
    weight: Optional[int] = None
    years_pro: Optional[int] = None


class ShotDataRequest(BaseModel):
    """Shot prediction request model."""
    LOC_X: float = Field(..., description="Shot location X coordinate (NBA scale: negative=left, positive=right)")
    LOC_Y: float = Field(..., description="Shot location Y coordinate (NBA scale: distance from baseline)")
    SHOT_DISTANCE: float = Field(..., ge=0, le=50, description="Distance from the basket in feet")
    SHOT_TYPE: Union[int, str, ShotType] = Field(..., description="Shot type (2 or 3 point)")
    SHOT_ZONE_BASIC: Union[str, ShotZone] = Field(..., description="Shot zone on the court")
    PLAYER_NAME: str = Field(..., min_length=1, max_length=100, description="Name of the player")

    @validator('SHOT_TYPE')
    def validate_shot_type(cls, v):
        """Validate shot type."""
        if isinstance(v, int):
            if v not in [2, 3]:
                raise ValueError("Shot type must be 2 or 3")
            return v
        elif isinstance(v, str):
            if v not in ["2PT Field Goal", "3PT Field Goal"]:
                raise ValueError("Shot type must be '2PT Field Goal' or '3PT Field Goal'")
            return v
        return v

    @validator('LOC_X')
    def validate_loc_x(cls, v):
        """Validate X coordinate."""
        if not -300 <= v <= 300:  # NBA coordinate system scale
            raise ValueError("LOC_X must be between -300 and 300")
        return v

    @validator('LOC_Y')
    def validate_loc_y(cls, v):
        """Validate Y coordinate."""
        if not 0 <= v <= 500:  # NBA coordinate system scale
            raise ValueError("LOC_Y must be between 0 and 500")
        return v


class ShotPredictionResponse(BaseModel):
    """Shot prediction response model."""
    shot_made: bool = Field(..., description="Whether the shot is predicted to be made")
    probability: float = Field(..., ge=0, le=1, description="Probability of making the shot (0-1)")
    confidence: str = Field(..., description="Confidence level (Low/Medium/High)")
    shot_info: Dict[str, Any] = Field(..., description="Additional shot information")
    player_stats: Optional[Dict[str, Any]] = Field(None, description="Player shooting statistics")


class PlayersResponse(BaseModel):
    """Players list response model."""
    players: List[Player]
    total: int
    page: int = 1
    per_page: int = 50


class HealthCheckResponse(BaseModel):
    """Health check response model."""
    model_config = {"protected_namespaces": ()}
    
    status: str
    timestamp: str
    version: str
    model_loaded: bool
    uptime_seconds: float
    dependencies: Dict[str, str]


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    message: str
    status_code: int
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None


class PredictionMetrics(BaseModel):
    """Prediction metrics model."""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_score: float
    total_predictions: int
    successful_predictions: int