import joblib
import pandas as pd
import sys
import os

# Add the project root to Python path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Load the pipeline
    pipeline = joblib.load("backend/models/full_pipeline.pkl")

    # Create test data
    test_data = pd.DataFrame([{
        'LOC_X': 100.0, 
        'LOC_Y': 200.0, 
        'SHOT_DISTANCE': 15.0, 
        'SHOT_TYPE': 2, 
        'SHOT_ZONE_BASIC': 'Mid', 
        'PLAYER_NAME': 'LeBron James'
    }])

    print("✅ Pipeline loaded successfully")

    # Test predict
    pred = pipeline.predict(test_data)[0]
    print(f"✅ Prediction: {pred}")

    # Test predict_proba
    prob_array = pipeline.predict_proba(test_data)
    print(f"✅ Probability array shape: {prob_array.shape}")
    print(f"✅ Probability array: {prob_array}")

    # Test the specific access pattern used in FastAPI
    prob = prob_array[0][1]
    print(f"✅ Probability of shot made (prob[0][1]): {prob}")

    print("\n🎉 SUCCESS! The backend should work now.")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
