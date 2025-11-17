import { useMemo, useState, useEffect } from 'react';
import PlayerSelector from './components/PlayerSelector';
import ShotPredictor from './ShotPredictor';
import { apiClient, type Player } from './api/client';
import './App.css';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalShots: 0,
    madeShots: 0,
    bestStreak: 0,
    currentStreak: 0,
    favoritePlayer: '',
    favoriteZone: ''
  });

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getPlayers();
        setPlayers(response.players);
        if (response.players.length > 0) {
          setSelectedPlayer(response.players[0].name);
        }
      } catch (err) {
        setError('Failed to fetch players - using offline data');
        console.error('Error fetching players:', err);
        // Fallback to enhanced mock data
        setPlayers([
          { id: 1, name: 'LeBron James', team: 'Los Angeles Lakers', position: 'SF' },
          { id: 2, name: 'Stephen Curry', team: 'Golden State Warriors', position: 'PG' },
          { id: 3, name: 'Kevin Durant', team: 'Phoenix Suns', position: 'SF' },
          { id: 4, name: 'Jayson Tatum', team: 'Boston Celtics', position: 'SF' },
          { id: 5, name: 'Luka Doncic', team: 'Dallas Mavericks', position: 'PG' },
          { id: 6, name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', position: 'PF' },
          { id: 7, name: 'Ja Morant', team: 'Memphis Grizzlies', position: 'PG' },
          { id: 8, name: 'Jimmy Butler', team: 'Miami Heat', position: 'SF' }
        ]);
        setSelectedPlayer('LeBron James');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const playerNames = useMemo(() => players.map(p => p.name), [players]);

  const updateSessionStats = (shotMade: boolean, player: string, zone: string) => {
    setSessionStats(prev => {
      const newStats = {
        ...prev,
        totalShots: prev.totalShots + 1,
        madeShots: prev.madeShots + (shotMade ? 1 : 0),
        currentStreak: shotMade ? prev.currentStreak + 1 : 0,
        bestStreak: shotMade ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak,
        favoritePlayer: player,
        favoriteZone: zone
      };
      return newStats;
    });
  };

  const shootingPercentage = sessionStats.totalShots > 0 
    ? Math.round((sessionStats.madeShots / sessionStats.totalShots) * 100)
    : 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="basketball-loader">🏀</div>
          <h1 className="loading-title">STREETBALL PREDICTOR</h1>
          <p className="loading-subtitle">Loading the court...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app streetball-theme">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <span className="basketball-emoji">🏀</span>
              <h1 className="app-title">
                <span className="title-main">STREETBALL</span>
                <span className="title-sub">PREDICTOR</span>
              </h1>
            </div>
          </div>

          <div className="quick-stats">
            <div className="stat-item">
              <div className="stat-content">
                <span className="stat-value">{shootingPercentage}%</span>
                <span className="stat-label">FG%</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-content">
                <span className="stat-value">{sessionStats.bestStreak}</span>
                <span className="stat-label">Best</span>
              </div>
            </div>
            <div className="stat-item streak">
              <div className="stat-content">
                <span className="stat-value">{sessionStats.currentStreak}</span>
                <span className="stat-label">Streak</span>
              </div>
            </div>
          </div>

          <button
            className="stats-toggle-btn"
            onClick={() => setShowStats(!showStats)}
          >
            📊 STATS
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="error-close"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="game-container">
          <div className="player-selector-panel">
            <PlayerSelector
              players={playerNames}
              selectedPlayer={selectedPlayer}
              onPlayerSelect={setSelectedPlayer}
            />
          </div>

          <div className="court-panel">
            <ShotPredictor
              selectedPlayer={selectedPlayer}
            />
          </div>

          {showStats && (
            <div className="stats-panel-overlay" onClick={() => setShowStats(false)}>
              <div className="stats-panel-content" onClick={(e) => e.stopPropagation()}>
                <div className="stats-header">
                  <h2 className="stats-title">SESSION STATS</h2>
                  <button className="close-btn" onClick={() => setShowStats(false)}>
                    ✕
                  </button>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-value">{sessionStats.madeShots}</div>
                    <div className="stat-card-label">Makes</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{sessionStats.totalShots - sessionStats.madeShots}</div>
                    <div className="stat-card-label">Misses</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{sessionStats.totalShots}</div>
                    <div className="stat-card-label">Total</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{sessionStats.bestStreak}</div>
                    <div className="stat-card-label">Best Streak</div>
                  </div>
                </div>
                
                <div className="performance-section">
                  <div className="performance-text">
                    {shootingPercentage >= 70 ? "🔥 ON FIRE!" : 
                     shootingPercentage >= 50 ? "💪 KEEP GRINDING!" : 
                     "📈 ROOM TO IMPROVE!"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Background elements for streetball aesthetic */}
      <div className="background-elements">
        <div className="chain-link-pattern"></div>
        <div className="graffiti-element graffiti-1">🏀</div>
        <div className="graffiti-element graffiti-2">STREETBALL</div>
        <div className="graffiti-element graffiti-3">HOOPS</div>
      </div>
    </div>
  );
}

export default App;