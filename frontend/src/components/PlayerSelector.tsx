import React, { useState } from "react";
import { Search, User, Users } from 'lucide-react';
import './PlayerSelector.css';

// NBA player ID mapping for headshots
const playerIdMap: Record<string, string> = {
  'LeBron James': '2544',
  'Stephen Curry': '201939',
  'Kevin Durant': '201142',
  'Giannis Antetokounmpo': '203507',
  'Luka Doncic': '1629029',
  'Jayson Tatum': '1628369',
  'Joel Embiid': '203954',
  'Nikola Jokic': '203999',
  'Damian Lillard': '203081',
  'Anthony Davis': '203076',
  'Kawhi Leonard': '202695',
  'Paul George': '202331',
  'Jimmy Butler': '202710',
  'Donovan Mitchell': '1628378',
  'Trae Young': '1629027',
  'Zion Williamson': '1629627',
  'Ja Morant': '1629630',
  'Devin Booker': '1626164',
  'Klay Thompson': '202691',
  'Draymond Green': '203110'
};

// Function to get NBA headshot URL
const getNBAHeadshotUrl = (playerName: string): string => {
  const playerId = playerIdMap[playerName];
  if (playerId) {
    return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
  }
  return '';
};

interface PlayerSelectorProps {
    players: string[];
    onPlayerSelect: (player: string) => void;
    selectedPlayer: string | null;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
    players,
    onPlayerSelect,
    selectedPlayer
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const filteredPlayers = players.filter(player =>
        player.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPlayerInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    };

    const getPlayerTeamColor = (player: string) => {
        // Assign colors based on player names for visual variety
        const colors = [
            '#ff6b35', '#f7931e', '#32cd32', '#4169e1', 
            '#ff1493', '#00ced1', '#ffd700', '#ff4500'
        ];
        const index = players.indexOf(player) % colors.length;
        return colors[index];
    };

    return (
        <div className="player-selector">
            <div className="player-selector-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="header-left">
                    <Users className="header-icon" />
                    <h2 className="selector-title">CHOOSE YOUR PLAYER</h2>
                </div>
                <div className="expand-toggle">
                    {isExpanded ? '▼' : '▶'}
                </div>
            </div>

            {isExpanded && (
                <>
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search players..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="players-grid">
                        {filteredPlayers.map((player) => {
                            const headshotUrl = getNBAHeadshotUrl(player);
                            const initials = getPlayerInitials(player);
                            
                            return (
                                <div
                                    key={player}
                                    className={`player-card ${selectedPlayer === player ? 'selected' : ''}`}
                                    onClick={() => onPlayerSelect(player)}
                                    style={{
                                        borderColor: selectedPlayer === player ? getPlayerTeamColor(player) : 'transparent'
                                    }}
                                >
                                    <div className="player-avatar">
                                        {headshotUrl ? (
                                            <img 
                                                src={headshotUrl}
                                                alt={player}
                                                className="player-headshot"
                                                onError={(e) => {
                                                    // Fallback to initials if image fails to load
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const fallback = target.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="player-initials-fallback"
                                            style={{ 
                                                backgroundColor: getPlayerTeamColor(player),
                                                display: headshotUrl ? 'none' : 'flex'
                                            }}
                                        >
                                            <span className="player-initials">
                                                {initials}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="player-info">
                                        <div className="player-name">{player}</div>
                                        {selectedPlayer === player && (
                                            <div className="selected-indicator">
                                                <User size={16} />
                                                <span>SELECTED</span>
                                            </div>
                                        )}
                                    </div>
                                    {selectedPlayer === player && (
                                        <div className="selection-glow"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filteredPlayers.length === 0 && (
                        <div className="no-players">
                            <User className="no-players-icon" />
                            <p>No players found matching "{searchTerm}"</p>
                        </div>
                    )}

                    <div className="selector-footer">
                        <div className="player-count">
                            {filteredPlayers.length} of {players.length} players
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayerSelector;
