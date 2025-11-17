import { motion } from 'framer-motion';
import { X, Target, Trophy, TrendingUp, User, MapPin, Calendar } from 'lucide-react';
import './StatsPanel.css';

interface SessionStats {
  totalShots: number;
  madeShots: number;
  bestStreak: number;
  currentStreak: number;
  favoritePlayer: string;
  favoriteZone: string;
}

interface StatsPanelProps {
  stats: SessionStats;
  onClose: () => void;
}

const StatsPanel = ({ stats, onClose }: StatsPanelProps) => {
  const shootingPercentage = stats.totalShots > 0 
    ? Math.round((stats.madeShots / stats.totalShots) * 100)
    : 0;

  const missedShots = stats.totalShots - stats.madeShots;

  const getPerformanceGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: 'A+', color: '#00ff00', text: 'LEGENDARY' };
    if (percentage >= 70) return { grade: 'A', color: '#32cd32', text: 'ELITE' };
    if (percentage >= 60) return { grade: 'B+', color: '#ffd700', text: 'GREAT' };
    if (percentage >= 50) return { grade: 'B', color: '#ff8c00', text: 'SOLID' };
    if (percentage >= 40) return { grade: 'C', color: '#ff6b35', text: 'DECENT' };
    return { grade: 'D', color: '#ff4444', text: 'NEEDS WORK' };
  };

  const performance = getPerformanceGrade(shootingPercentage);

  return (
    <motion.div
      className="stats-panel-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="stats-panel"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="stats-header">
          <h2 className="stats-title">SESSION STATS</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="performance-section">
          <div className="performance-badge" style={{ borderColor: performance.color }}>
            <div className="performance-grade" style={{ color: performance.color }}>
              {performance.grade}
            </div>
            <div className="performance-text" style={{ color: performance.color }}>
              {performance.text}
            </div>
          </div>
          <div className="performance-percentage">
            <div className="percentage-circle">
              <svg className="percentage-svg" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={performance.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={339.292}
                  initial={{ strokeDashoffset: 339.292 }}
                  animate={{ strokeDashoffset: 339.292 - (339.292 * shootingPercentage) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="percentage-text">
                <span className="percentage-number">{shootingPercentage}</span>
                <span className="percentage-symbol">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <motion.div 
            className="stat-card makes"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon-container">
              <Target className="stat-card-icon" />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{stats.madeShots}</div>
              <div className="stat-card-label">Makes</div>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card misses"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon-container">
              <X className="stat-card-icon" />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{missedShots}</div>
              <div className="stat-card-label">Misses</div>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card attempts"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon-container">
              <Calendar className="stat-card-icon" />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{stats.totalShots}</div>
              <div className="stat-card-label">Total</div>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card streak"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon-container">
              <Trophy className="stat-card-icon" />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{stats.bestStreak}</div>
              <div className="stat-card-label">Best Streak</div>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card current-streak"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="stat-icon-container">
              <TrendingUp className="stat-card-icon" />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{stats.currentStreak}</div>
              <div className="stat-card-label">Current</div>
            </div>
          </motion.div>
        </div>

        {stats.favoritePlayer && (
          <motion.div 
            className="favorites-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="favorites-title">Session Favorites</h3>
            <div className="favorites-grid">
              <div className="favorite-item">
                <User className="favorite-icon" />
                <div className="favorite-content">
                  <div className="favorite-label">Player</div>
                  <div className="favorite-value">{stats.favoritePlayer}</div>
                </div>
              </div>
              {stats.favoriteZone && (
                <div className="favorite-item">
                  <MapPin className="favorite-icon" />
                  <div className="favorite-content">
                    <div className="favorite-label">Zone</div>
                    <div className="favorite-value">{stats.favoriteZone}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div 
          className="stats-footer"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="motivational-text">
            {shootingPercentage >= 70 ? "🔥 ON FIRE!" : 
             shootingPercentage >= 50 ? "💪 KEEP GRINDING!" : 
             "📈 ROOM TO IMPROVE!"}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StatsPanel;