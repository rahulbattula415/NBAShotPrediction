import { motion } from 'framer-motion';
import { BarChart3, Trophy, Target, TrendingUp } from 'lucide-react';
import './Header.css';

interface SessionStats {
  totalShots: number;
  madeShots: number;
  bestStreak: number;
  currentStreak: number;
  favoritePlayer: string;
  favoriteZone: string;
}

interface HeaderProps {
  onStatsToggle: () => void;
  sessionStats: SessionStats;
}

const Header = ({ onStatsToggle, sessionStats }: HeaderProps) => {
  const shootingPercentage = sessionStats.totalShots > 0 
    ? Math.round((sessionStats.madeShots / sessionStats.totalShots) * 100)
    : 0;

  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="header-content">
        <motion.div 
          className="logo-section"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="logo">
            <span className="basketball-emoji">🏀</span>
            <h1 className="app-title">
              <span className="title-main">STREETBALL</span>
              <span className="title-sub">PREDICTOR</span>
            </h1>
          </div>
        </motion.div>

        <div className="quick-stats">
          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Target className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{shootingPercentage}%</span>
              <span className="stat-label">FG%</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Trophy className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{sessionStats.bestStreak}</span>
              <span className="stat-label">Best</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-item streak"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
            animate={{
              scale: sessionStats.currentStreak > 0 ? [1, 1.1, 1] : 1
            }}
          >
            <TrendingUp className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{sessionStats.currentStreak}</span>
              <span className="stat-label">Streak</span>
            </div>
          </motion.div>
        </div>

        <motion.button
          className="stats-toggle-btn"
          onClick={onStatsToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <BarChart3 size={20} />
          <span>STATS</span>
        </motion.button>
      </div>

      <div className="header-glow"></div>
    </motion.header>
  );
};

export default Header;