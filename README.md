# NBA Shot Predictor

A machine learning-powered web application that predicts NBA shot outcomes and visualizes player shooting patterns through interactive heatmaps.

## Features

- **Interactive Shot Prediction**: Click anywhere on the basketball court to predict shot outcomes
- **Player-Specific Heatmaps**: Visualize shooting patterns for different NBA players
- **Real-time Predictions**: FastAPI backend with machine learning model integration
- **Modern UI**: React frontend with D3.js visualizations

## Architecture

### Backend (FastAPI + Python)
- **Machine Learning Model**: Logistic Regression trained on NBA shot data
- **API Endpoints**: 
  - `/predict` - Predict shot outcomes
  - `/players` - Get available players
- **Data Processing**: Shot zone mapping and feature engineering

### Frontend (React + TypeScript + D3.js)
- **Interactive Court**: SVG-based basketball court with click-to-predict
- **Heatmap Visualization**: D3.js canvas-based heatmaps showing shooting patterns
- **Player Selection**: Dynamic player switching with real-time data updates

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Installation

1. **Install Backend Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

#### Option 1: Use Batch Scripts (Windows)
- Run `start_backend.bat` to start the backend server
- Run `start_frontend.bat` to start the frontend development server

#### Option 2: Manual Start
1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   python -m uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Usage

1. **Select a Player**: Choose from the dropdown menu (LeBron James, Stephen Curry, etc.)
2. **View Heatmap**: See the player's shooting pattern overlaid on the court
3. **Predict Shots**: Click anywhere on the court to get a shot prediction
4. **Analyze Results**: View probability percentages and shot details

## Project Structure

```
NBAShotPredictor/
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── models/             # ML models and pipelines
│   └── __pycache__/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api/           # API client
│   │   └── ...
│   └── package.json
├── data/                   # NBA shot data
├── scripts/                # Data processing scripts
├── requirements.txt        # Python dependencies
└── README.md
```

## API Endpoints

### POST /predict
Predict shot outcome based on court position and player.

**Request Body**:
```json
{
  "LOC_X": 15.5,
  "LOC_Y": 25.0,
  "SHOT_DISTANCE": 18.2,
  "SHOT_TYPE": 2,
  "SHOT_ZONE_BASIC": "Mid",
  "PLAYER_NAME": "Stephen Curry"
}
```

**Response**:
```json
{
  "shot_made": true,
  "probability": [0.3, 0.7]
}
```

### GET /players
Get list of available players.

**Response**:
```json
{
  "players": [
    {"id": 1, "name": "LeBron James"},
    {"id": 2, "name": "Stephen Curry"},
    ...
  ]
}
```

## Development

### Adding New Players
1. Update the player list in `backend/main.py`
2. Add corresponding heatmap data in `frontend/src/ShotPredictor.tsx`

### Modifying the ML Model
1. Update training scripts in `scripts/`
2. Retrain and save new model files in `backend/models/`
3. Update model loading logic if needed

### Customizing the UI
- Modify CSS in `frontend/src/App.css`
- Update components in `frontend/src/components/`
- Adjust court dimensions in `frontend/src/components/BasketballCourt.tsx`

## Technologies Used

- **Backend**: FastAPI, scikit-learn, pandas, numpy
- **Frontend**: React, TypeScript, D3.js, Vite
- **ML**: Logistic Regression, StandardScaler
- **Data**: NBA shot tracking data

## License

This project is for educational and demonstration purposes.
