import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from backend.models.logisticRegressionModel import LogisticRegressionModel  # your custom model

# Load saved scaler
scaler = joblib.load("backend/models/shot_scaler.pkl")

# Load data
df = pd.read_csv("data/all_players_shots.csv")

zone_map = {
    "Mid-Range": "Mid",
    "Left Corner 3": "Corner",
    "Right Corner 3": "Corner",
    "Above the Break 3": "Arc",
    "Restricted Area": "Paint",
    "In The Paint (Non-RA)": "Paint"
}
df["SHOT_ZONE_BASIC"] = df["SHOT_ZONE_BASIC"].replace(zone_map)

type_map = {
    "2PT Field Goal": 2,
    "3PT Field Goal": 3
}
df["SHOT_TYPE"] = df["SHOT_TYPE"].replace(type_map)

# Define columns
numerical_features = ["LOC_X", "LOC_Y", "SHOT_DISTANCE"]
categorical_features = ["SHOT_ZONE_BASIC", "PLAYER_NAME", "SHOT_TYPE"]
target = "SHOT_MADE_FLAG"

X = df[numerical_features + categorical_features]
y = df[target]

# One-hot encoder (fresh instance)
categorical_transformer = OneHotEncoder(handle_unknown='ignore')

# Preprocessing pipeline (reuse scaler)
preprocessor = ColumnTransformer(
    transformers=[
        ("num", scaler, numerical_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)

# Full pipeline: preprocessor + model
pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("classifier", LogisticRegressionModel())
])

# Fit and save the full pipeline
pipeline.fit(X, y)
joblib.dump(pipeline, "backend/models/full_pipeline.pkl")

print("✅ Full pipeline saved using the pre-trained scaler.")
