from fastapi import FastAPI
from pydantic import BaseModel
import joblib 
import pandas as pd

pipeline = joblib.load("models/full_pipeline.pkl")

app = FastAPI()

class ShotData(BaseModel):
    LOC_X: float
    LOC_Y: float
    SHOT_DISTANCE: float
    SHOT_TYPE: int
    SHOT_ZONE_BASIC: str
    PLAYER_NAME: str

@app.post("/predict")
def predict_shot(data: ShotData):
    # Convert input to DataFrame
    input_df = pd.DataFrame([data.model_dump()])

    # Predict using pipeline
    pred = pipeline.predict(input_df)
    prob = pipeline.predict_proba(input_df)
    return {
        "shot_made": bool(pred[0]),
        "probability": prob[0][1]
    }
