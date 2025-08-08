from scripts.modelTraining import X_test, Y_test
import pickle
from sklearn.metrics import accuracy_score, classification_report
import numpy as np

with open('models/shot_model.pkl', 'rb') as f:  # Update with your actual file name
    model = pickle.load(f)
with open('models/shot_scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

y_pred = model.predict(X_test)

accuracy = accuracy_score(Y_test, y_pred)
report = classification_report(Y_test, y_pred)

print("Model Evaluation:")
print(f"Model Accuracy: {accuracy:.2f}")
print("Classification Report:")
print(report)