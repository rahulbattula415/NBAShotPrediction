import React from 'react';
import { Target, TrendingUp, Info, Zap } from 'lucide-react';
import { type ShotPrediction } from './api/client';
import './PredictionDisplay.css';

interface PredictionDisplayProps {
  prediction: ShotPrediction | null;
  loading: boolean;
  error: string | null;
  shotLocation?: {
    x: number;
    y: number;
    distance: number;
  };
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  prediction,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="prediction-display loading">
        <div className="prediction-content">
          <div className="loading-spinner">
            <div className="spinner-ball">🏀</div>
          </div>
          <h3 className="loading-title">CALCULATING...</h3>
          <p className="loading-subtitle">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prediction-display error">
        <div className="prediction-content">
          <div className="error-icon">💥</div>
          <h3 className="error-title">PREDICTION FAILED</h3>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="prediction-display placeholder">
        <div className="prediction-content">
          <div className="placeholder-icon">🎯</div>
          <h3 className="placeholder-title">READY TO SHOOT</h3>
          <p className="placeholder-text">
            Click anywhere on the court to predict a shot!
          </p>
          <div className="court-hint">
            <span className="hint-emoji">👆</span>
            <span>Tap the court above</span>
          </div>
        </div>
      </div>
    );
  }

  const makeProbability = prediction.probability * 100;
  const missProbability = (1 - prediction.probability) * 100;
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high': return '#32cd32';
      case 'medium': return '#ffd700';
      case 'low': return '#ff6b35';
      default: return '#ff6b35';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '🎯';
      case 'moderate': return '🏀';
      case 'difficult': return '💪';
      case 'very difficult': return '🔥';
      default: return '🏀';
    }
  };

  return (
    <div className={`prediction-display result ${prediction.shot_made ? 'made' : 'missed'}`}>
      <div className="prediction-content">
        <div className="result-header">
          <div className="result-icon">
            {prediction.shot_made ? '✅' : '❌'}
          </div>
          <div className="result-text">
            <h3 className="result-title">
              {prediction.shot_made ? 'SHOT MADE!' : 'SHOT MISSED'}
            </h3>
            <div className="confidence-badge" style={{ color: getConfidenceColor(prediction.confidence) }}>
              {prediction.confidence} CONFIDENCE
            </div>
          </div>
        </div>

        <div className="probability-section">
          <div className="prob-circle">
            <svg className="prob-svg" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={prediction.shot_made ? '#32cd32' : '#ff6b35'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={314.159}
                strokeDashoffset={314.159 - (314.159 * makeProbability) / 100}
                className="prob-circle-fill"
              />
            </svg>
            <div className="prob-text">
              <span className="prob-number">{makeProbability.toFixed(0)}</span>
              <span className="prob-percent">%</span>
            </div>
          </div>
          
          <div className="prob-breakdown">
            <div className="prob-item make">
              <span className="prob-dot"></span>
              <span className="prob-label">Make</span>
              <span className="prob-value">{makeProbability.toFixed(1)}%</span>
            </div>
            <div className="prob-item miss">
              <span className="prob-dot"></span>
              <span className="prob-label">Miss</span>
              <span className="prob-value">{missProbability.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="shot-info-grid">
          <div className="info-item">
            <Target className="info-icon" />
            <div className="info-content">
              <span className="info-label">Distance</span>
              <span className="info-value">{prediction.shot_info.distance} ft</span>
            </div>
          </div>
          
          <div className="info-item">
            <TrendingUp className="info-icon" />
            <div className="info-content">
              <span className="info-label">Type</span>
              <span className="info-value">{prediction.shot_info.shot_type}</span>
            </div>
          </div>
          
          <div className="info-item">
            <Info className="info-icon" />
            <div className="info-content">
              <span className="info-label">Zone</span>
              <span className="info-value">{prediction.shot_info.zone}</span>
            </div>
          </div>
          
          <div className="info-item">
            <Zap className="info-icon" />
            <div className="info-content">
              <span className="info-label">Difficulty</span>
              <span className="info-value">
                {getDifficultyEmoji(prediction.shot_info.difficulty)} {prediction.shot_info.difficulty}
              </span>
            </div>
          </div>
        </div>

        {prediction.shot_info.comparable_shots && (
          <div className="league-comparison">
            <h4 className="comparison-title">League Comparison</h4>
            <div className="comparison-stats">
              <div className="comparison-item">
                <span className="comparison-label">League Avg</span>
                <span className="comparison-value">
                  {(prediction.shot_info.league_average * 100).toFixed(1)}%
                </span>
              </div>
              <div className="comparison-item">
                <span className="comparison-label">Similar Shots</span>
                <span className="comparison-value">
                  {prediction.shot_info.comparable_shots.makes}/{prediction.shot_info.comparable_shots.attempts}
                </span>
              </div>
            </div>
          </div>
        )}

        {prediction.player_stats && (
          <div className="player-stats">
            <h4 className="stats-title">Player Stats</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">FG%</span>
                <span className="stat-value">{(prediction.player_stats.fg_percentage * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">3P%</span>
                <span className="stat-value">{(prediction.player_stats.three_point_percentage * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">TS%</span>
                <span className="stat-value">{(prediction.player_stats.true_shooting_percentage * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">PPG</span>
                <span className="stat-value">{prediction.player_stats.field_goals_made.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionDisplay;
