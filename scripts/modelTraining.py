import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from models.logisticRegressionModel import LogisticRegressionModel

df = pd.read_csv("data/new_cleaned_shots.csv")
Y = df['label'].values
X = df.drop(columns=['label']).values

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, Y_train, Y_test = train_test_split(X_scaled, Y, test_size=0.2, random_state=42, stratify=Y)

model = LogisticRegressionModel()
model.fit(X_train, Y_train)

with open('models/shot_model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('models/shot_scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("Model trained and saved.")