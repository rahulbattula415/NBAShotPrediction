import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib
import os

# === Load Raw Data ===
df = pd.read_csv("data/all_players_shots.csv")

# === Keep Only Relevant Columns ===
columns_to_keep = [
    "LOC_X", "LOC_Y", "SHOT_DISTANCE",
    "SHOT_TYPE", "SHOT_ZONE_BASIC", "PLAYER_NAME", "SHOT_MADE_FLAG"
]
df = df[columns_to_keep]

# === Drop Rows with Nulls ===
df.dropna(subset=["LOC_X", "LOC_Y", "SHOT_DISTANCE", "SHOT_MADE_FLAG"], inplace=True)

# === Filter Outliers (Half-Court Heaves, etc.) ===
df = df[df["SHOT_DISTANCE"] <= 35]
df = df[(df["LOC_X"].between(-250, 250)) & (df["LOC_Y"].between(-50, 500))]

# === Simplify SHOT_TYPE ===
df["SHOT_TYPE"] = df["SHOT_TYPE"].map({
    "2PT Field Goal": 2,
    "3PT Field Goal": 3
})

# === Simplify SHOT_ZONE_BASIC ===
zone_map = {
    "Mid-Range": "Mid",
    "Left Corner 3": "Corner",
    "Right Corner 3": "Corner",
    "Above the Break 3": "Arc",
    "Restricted Area": "Paint",
    "In The Paint (Non-RA)": "Paint"
}
df["SHOT_ZONE_BASIC"] = df["SHOT_ZONE_BASIC"].replace(zone_map)

# === Rename Target Column ===
df.rename(columns={"SHOT_MADE_FLAG": "label"}, inplace=True)

# === Normalize Numerical Features ===
features_to_scale = ["LOC_X", "LOC_Y", "SHOT_DISTANCE"]
scaler = StandardScaler()
df[features_to_scale] = scaler.fit_transform(df[features_to_scale])

# Save the scaler to disk for use during inference
os.makedirs("models", exist_ok=True)
joblib.dump(scaler, "models/shot_scaler.pkl")

# === One-Hot Encode Categorical Features ===
df = pd.get_dummies(df, columns=["SHOT_ZONE_BASIC", "PLAYER_NAME", "SHOT_TYPE"])

# === Save Cleaned Data ===
os.makedirs("data", exist_ok=True)
df.to_csv("data/new_cleaned_shots.csv", index=False)

print("Data cleaned and saved to 'data/new_cleaned_shots.csv'")
