from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict

import joblib
import pandas as pd


# Mappings mirrored from training script to ensure consistent categories
_ZONE_MAP = {
    "Mid-Range": "Mid",
    "Left Corner 3": "Corner",
    "Right Corner 3": "Corner",
    "Above the Break 3": "Arc",
    "Restricted Area": "Paint",
    "In The Paint (Non-RA)": "Paint",
}

_TYPE_MAP = {
    "2PT Field Goal": 2,
    "3PT Field Goal": 3,
}


class ShotInput(TypedDict):
    LOC_X: float
    LOC_Y: float
    SHOT_DISTANCE: float
    SHOT_TYPE: int | str
    SHOT_ZONE_BASIC: str
    PLAYER_NAME: str


def _project_input(record: ShotInput) -> Dict[str, Any]:
    """Project inbound payload to the schema expected by the pipeline.

    - Normalizes SHOT_ZONE_BASIC using the same grouping as training
    - Ensures SHOT_TYPE is an int (2 or 3) using the same mapping as training
    """
    zoned = _ZONE_MAP.get(record["SHOT_ZONE_BASIC"], record["SHOT_ZONE_BASIC"])

    shot_type_val: int
    if isinstance(record["SHOT_TYPE"], str):
        shot_type_val = _TYPE_MAP.get(record["SHOT_TYPE"], 2)
    else:
        shot_type_val = int(record["SHOT_TYPE"])

    return {
        "LOC_X": float(record["LOC_X"]),
        "LOC_Y": float(record["LOC_Y"]),
        "SHOT_DISTANCE": float(record["SHOT_DISTANCE"]),
        "SHOT_TYPE": shot_type_val,
        "SHOT_ZONE_BASIC": zoned,
        "PLAYER_NAME": record["PLAYER_NAME"],
    }


class PipelineModel:
    """Wrapper around the pre-trained sklearn Pipeline for clean loading and inference."""

    def __init__(self, pipeline_path: Optional[Path] = None) -> None:
        self._pipeline_path = pipeline_path or self._default_pipeline_path()
        self._pipeline = self._load_pipeline(self._pipeline_path)

    @staticmethod
    def _default_pipeline_path() -> Path:
        # Resolve relative to this file: backend/models/full_pipeline.pkl
        here = Path(__file__).resolve().parent
        return here / "full_pipeline.pkl"

    @staticmethod
    def _load_pipeline(path: Path):
        if not path.exists():
            raise FileNotFoundError(f"Pre-trained pipeline not found at: {path}")
        return joblib.load(str(path))

    def predict(self, inputs: List[ShotInput]) -> List[bool]:
        df = self._to_dataframe(inputs)
        preds = self._pipeline.predict(df)
        return [bool(p) for p in preds]

    def predict_proba(self, inputs: List[ShotInput]) -> List[float]:
        df = self._to_dataframe(inputs)
        probs = self._pipeline.predict_proba(df)
        # Return probability of class 1 (made shot)
        return [float(p[1]) for p in probs]

    @staticmethod
    def _to_dataframe(inputs: List[ShotInput]) -> pd.DataFrame:
        projected = [_project_input(i) for i in inputs]
        return pd.DataFrame(projected)


# Singleton-style accessor for reuse across requests
_MODEL_SINGLETON: Optional[PipelineModel] = None


def get_model() -> PipelineModel:
    global _MODEL_SINGLETON
    if _MODEL_SINGLETON is None:
        _MODEL_SINGLETON = PipelineModel()
    return _MODEL_SINGLETON



