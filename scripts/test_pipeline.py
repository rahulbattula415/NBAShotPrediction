import joblib
import pandas as pd

# Load the pipeline
pipeline = joblib.load("backend/models/full_pipeline.pkl")

# Create test data
test_data = pd.DataFrame([{
    'LOC_X': 100, 
    'LOC_Y': 200, 
    'SHOT_DISTANCE': 15, 
    'SHOT_TYPE': 2, 
    'SHOT_ZONE_BASIC': 'Mid', 
    'PLAYER_NAME': 'LeBron James'
}])

# Test predict_proba
prob = pipeline.predict_proba(test_data)
print('Prob shape:', prob.shape if hasattr(prob, 'shape') else 'No shape')
print('Prob value:', prob)
print('Prob type:', type(prob))

try:
    print('Accessing [0][1]...')
    result = prob[0][1]
    print('Success:', result)
except Exception as e:
    print('Error:', str(e))
    print('This is the issue!')
