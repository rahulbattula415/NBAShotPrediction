"""Enhanced prediction service with caching and analytics."""

import asyncio
import time
from typing import Dict, Any, List, Optional
from functools import lru_cache
import hashlib
import json

from models.logisticRegressionModel import get_model, ShotInput
from models.schemas import ShotDataRequest, ShotPredictionResponse
from services.player_service import player_service
from exceptions import ModelError, ValidationError
from logging_config import get_logger

logger = get_logger(__name__)


class PredictionService:
    """Enhanced service for shot predictions with caching and analytics."""
    
    def __init__(self):
        self._model = None
        self._prediction_cache: Dict[str, Dict[str, Any]] = {}
        self._analytics: Dict[str, Any] = {
            "total_predictions": 0,
            "successful_predictions": 0,
            "average_response_time": 0.0,
            "cache_hits": 0,
            "cache_misses": 0,
            "predictions_by_player": {},
            "predictions_by_zone": {},
            "accuracy_by_distance": {}
        }
    
    def _get_model(self):
        """Get the ML model with lazy loading."""
        if self._model is None:
            try:
                self._model = get_model()
                logger.info("Model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise ModelError(f"Failed to load prediction model: {str(e)}")
        return self._model
    
    def _generate_cache_key(self, shot_data: ShotDataRequest) -> str:
        """Generate a cache key for the prediction."""
        # Create a deterministic hash of the shot data
        data_str = json.dumps({
            "LOC_X": round(shot_data.LOC_X, 2),
            "LOC_Y": round(shot_data.LOC_Y, 2),
            "SHOT_DISTANCE": round(shot_data.SHOT_DISTANCE, 2),
            "SHOT_TYPE": str(shot_data.SHOT_TYPE),
            "SHOT_ZONE_BASIC": str(shot_data.SHOT_ZONE_BASIC),
            "PLAYER_NAME": shot_data.PLAYER_NAME
        }, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def _get_confidence_level(self, probability: float) -> str:
        """Determine confidence level based on probability."""
        if probability >= 0.7 or probability <= 0.3:
            return "High"
        elif probability >= 0.6 or probability <= 0.4:
            return "Medium"
        else:
            return "Low"
    
    def _get_shot_info(self, shot_data: ShotDataRequest, probability: float) -> Dict[str, Any]:
        """Get additional shot information."""
        return {
            "distance": round(shot_data.SHOT_DISTANCE, 1),
            "shot_type": "3-Pointer" if str(shot_data.SHOT_TYPE) in ["3", "3PT Field Goal"] else "2-Pointer",
            "zone": str(shot_data.SHOT_ZONE_BASIC),
            "difficulty": self._get_shot_difficulty(shot_data.SHOT_DISTANCE, str(shot_data.SHOT_ZONE_BASIC)),
            "comparable_shots": self._get_comparable_shots_stats(shot_data),
            "league_average": self._get_league_average(shot_data)
        }
    
    def _get_shot_difficulty(self, distance: float, zone: str) -> str:
        """Determine shot difficulty."""
        if distance <= 3:
            return "Easy"
        elif distance <= 10 and zone in ["Restricted Area", "In The Paint (Non-RA)"]:
            return "Moderate"
        elif distance <= 16:
            return "Moderate"
        elif distance <= 23:
            return "Difficult"
        else:
            return "Very Difficult"
    
    def _get_comparable_shots_stats(self, shot_data: ShotDataRequest) -> Dict[str, float]:
        """Get statistics for comparable shots (mock data for now)."""
        # In a real implementation, this would query a database
        base_percentage = 0.45
        
        # Adjust based on distance
        if shot_data.SHOT_DISTANCE <= 3:
            base_percentage = 0.68
        elif shot_data.SHOT_DISTANCE <= 10:
            base_percentage = 0.52
        elif shot_data.SHOT_DISTANCE <= 16:
            base_percentage = 0.42
        elif shot_data.SHOT_DISTANCE <= 23:
            base_percentage = 0.38
        else:
            base_percentage = 0.35
        
        return {
            "league_avg": base_percentage,
            "attempts": 1500,
            "makes": int(1500 * base_percentage)
        }
    
    def _get_league_average(self, shot_data: ShotDataRequest) -> float:
        """Get league average for similar shots."""
        # Simplified league averages by shot type
        if str(shot_data.SHOT_TYPE) in ["3", "3PT Field Goal"]:
            return 0.357  # NBA 3P%
        else:
            return 0.545  # NBA 2P%
    
    def _get_player_stats(self, player_name: str) -> Optional[Dict[str, Any]]:
        """Get player shooting statistics (mock data for now)."""
        try:
            player = player_service.get_player_by_name(player_name)
            # Mock shooting stats - in real implementation, would fetch from database
            return {
                "fg_percentage": 0.475,
                "three_point_percentage": 0.367,
                "free_throw_percentage": 0.832,
                "effective_fg_percentage": 0.545,
                "true_shooting_percentage": 0.588,
                "games_played": 65,
                "minutes_per_game": 35.2,
                "field_goals_made": 8.5,
                "field_goals_attempted": 17.8
            }
        except Exception:
            return None
    
    def _update_analytics(self, shot_data: ShotDataRequest, response_time: float, cache_hit: bool):
        """Update prediction analytics."""
        self._analytics["total_predictions"] += 1
        self._analytics["successful_predictions"] += 1
        
        # Update average response time
        total = self._analytics["total_predictions"]
        current_avg = self._analytics["average_response_time"]
        self._analytics["average_response_time"] = ((current_avg * (total - 1)) + response_time) / total
        
        # Update cache stats
        if cache_hit:
            self._analytics["cache_hits"] += 1
        else:
            self._analytics["cache_misses"] += 1
        
        # Update predictions by player
        player = shot_data.PLAYER_NAME
        if player not in self._analytics["predictions_by_player"]:
            self._analytics["predictions_by_player"][player] = 0
        self._analytics["predictions_by_player"][player] += 1
        
        # Update predictions by zone
        zone = str(shot_data.SHOT_ZONE_BASIC)
        if zone not in self._analytics["predictions_by_zone"]:
            self._analytics["predictions_by_zone"][zone] = 0
        self._analytics["predictions_by_zone"][zone] += 1
    
    async def predict_shot(self, shot_data: ShotDataRequest) -> ShotPredictionResponse:
        """Make a shot prediction with enhanced features."""
        start_time = time.time()
        cache_key = self._generate_cache_key(shot_data)
        
        # Check cache first
        if cache_key in self._prediction_cache:
            cached_result = self._prediction_cache[cache_key]
            response_time = time.time() - start_time
            self._update_analytics(shot_data, response_time, cache_hit=True)
            logger.info(f"Cache hit for prediction: {cache_key}")
            return ShotPredictionResponse(**cached_result)
        
        try:
            # Get model and make prediction
            model = self._get_model()
            
            # Convert to model input format
            shot_input: ShotInput = {
                "LOC_X": shot_data.LOC_X,
                "LOC_Y": shot_data.LOC_Y,
                "SHOT_DISTANCE": shot_data.SHOT_DISTANCE,
                "SHOT_TYPE": shot_data.SHOT_TYPE,
                "SHOT_ZONE_BASIC": str(shot_data.SHOT_ZONE_BASIC),
                "PLAYER_NAME": shot_data.PLAYER_NAME
            }
            
            # Make prediction with timeout
            prediction_task = asyncio.create_task(
                asyncio.to_thread(model.predict, [shot_input])
            )
            probability_task = asyncio.create_task(
                asyncio.to_thread(model.predict_proba, [shot_input])
            )
            
            try:
                shot_made_result = await asyncio.wait_for(prediction_task, timeout=5.0)
                probability_result = await asyncio.wait_for(probability_task, timeout=5.0)
            except asyncio.TimeoutError:
                raise ModelError("Prediction timeout exceeded")
            
            shot_made = bool(shot_made_result[0])
            probability = float(probability_result[0])  # Probability of making the shot
            
            # Create response
            response_data = {
                "shot_made": shot_made,
                "probability": probability,
                "confidence": self._get_confidence_level(probability),
                "shot_info": self._get_shot_info(shot_data, probability),
                "player_stats": self._get_player_stats(shot_data.PLAYER_NAME)
            }
            
            # Cache the result
            self._prediction_cache[cache_key] = response_data
            
            # Clean cache if too large (simple LRU)
            if len(self._prediction_cache) > 1000:
                oldest_key = next(iter(self._prediction_cache))
                del self._prediction_cache[oldest_key]
            
            response_time = time.time() - start_time
            self._update_analytics(shot_data, response_time, cache_hit=False)
            
            logger.info(
                f"Prediction completed for {shot_data.PLAYER_NAME}: "
                f"probability={probability:.3f}, response_time={response_time:.3f}s"
            )
            
            return ShotPredictionResponse(**response_data)
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            if isinstance(e, ModelError):
                raise
            raise ModelError(f"Prediction failed: {str(e)}")
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get prediction analytics."""
        return self._analytics.copy()
    
    def clear_cache(self) -> None:
        """Clear prediction cache."""
        self._prediction_cache.clear()
        logger.info("Prediction cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_requests = self._analytics["cache_hits"] + self._analytics["cache_misses"]
        hit_rate = self._analytics["cache_hits"] / total_requests if total_requests > 0 else 0
        
        return {
            "cache_size": len(self._prediction_cache),
            "cache_hits": self._analytics["cache_hits"],
            "cache_misses": self._analytics["cache_misses"],
            "hit_rate": hit_rate,
            "total_requests": total_requests
        }


# Global service instance
prediction_service = PredictionService()