"""Enhanced NBA player service with comprehensive player data."""

import json
from typing import List, Dict, Optional
from pathlib import Path

from models.schemas import Player
from exceptions import PlayerNotFoundError
from logging_config import get_logger

logger = get_logger(__name__)


class PlayerService:
    """Service for managing NBA player data."""
    
    def __init__(self):
        self._players_cache: Optional[List[Player]] = None
        self._players_by_name: Optional[Dict[str, Player]] = None
        self._load_players()
    
    def _load_players(self) -> None:
        """Load player data from JSON file or use fallback data."""
        try:
            # Try to load from JSON file first
            players_file = Path(__file__).parent.parent / "data" / "players.json"
            if players_file.exists():
                with open(players_file, 'r') as f:
                    players_data = json.load(f)
                    self._players_cache = [Player(**player) for player in players_data]
            else:
                self._players_cache = self._get_fallback_players()
            
            # Create name lookup dictionary
            self._players_by_name = {
                player.name: player for player in self._players_cache
            }
            
            logger.info(f"Loaded {len(self._players_cache)} players")
            
        except Exception as e:
            logger.error(f"Failed to load players: {e}")
            self._players_cache = self._get_fallback_players()
            self._players_by_name = {
                player.name: player for player in self._players_cache
            }
    
    def _get_fallback_players(self) -> List[Player]:
        """Get fallback player data with enhanced information."""
        return [
            Player(
                id=1,
                name="LeBron James",
                team="Los Angeles Lakers",
                position="SF",
                jersey_number=6,
                height="6'9\"",
                weight=250,
                years_pro=21
            ),
            Player(
                id=2,
                name="Stephen Curry",
                team="Golden State Warriors",
                position="PG",
                jersey_number=30,
                height="6'2\"",
                weight=185,
                years_pro=15
            ),
            Player(
                id=3,
                name="Kevin Durant",
                team="Phoenix Suns",
                position="SF",
                jersey_number=35,
                height="6'10\"",
                weight=240,
                years_pro=17
            ),
            Player(
                id=4,
                name="Jayson Tatum",
                team="Boston Celtics",
                position="SF",
                jersey_number=0,
                height="6'8\"",
                weight=210,
                years_pro=7
            ),
            Player(
                id=5,
                name="Luka Doncic",
                team="Dallas Mavericks",
                position="PG",
                jersey_number=77,
                height="6'7\"",
                weight=230,
                years_pro=6
            ),
            Player(
                id=6,
                name="Klay Thompson",
                team="Golden State Warriors",
                position="SG",
                jersey_number=11,
                height="6'6\"",
                weight=215,
                years_pro=13
            ),
            Player(
                id=7,
                name="Joel Embiid",
                team="Philadelphia 76ers",
                position="C",
                jersey_number=21,
                height="7'0\"",
                weight=280,
                years_pro=8
            ),
            Player(
                id=8,
                name="Giannis Antetokounmpo",
                team="Milwaukee Bucks",
                position="PF",
                jersey_number=34,
                height="6'11\"",
                weight=243,
                years_pro=11
            ),
            Player(
                id=9,
                name="Damian Lillard",
                team="Milwaukee Bucks",
                position="PG",
                jersey_number=0,
                height="6'2\"",
                weight=195,
                years_pro=12
            ),
            Player(
                id=10,
                name="Ja Morant",
                team="Memphis Grizzlies",
                position="PG",
                jersey_number=12,
                height="6'3\"",
                weight=174,
                years_pro=5
            ),
            Player(
                id=11,
                name="Jimmy Butler",
                team="Miami Heat",
                position="SF",
                jersey_number=22,
                height="6'7\"",
                weight=230,
                years_pro=13
            ),
            Player(
                id=12,
                name="Kawhi Leonard",
                team="LA Clippers",
                position="SF",
                jersey_number=2,
                height="6'7\"",
                weight=225,
                years_pro=13
            )
        ]
    
    def get_all_players(self, page: int = 1, per_page: int = 50) -> List[Player]:
        """Get all players with pagination."""
        if self._players_cache is None:
            self._load_players()
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        return self._players_cache[start_idx:end_idx]
    
    def get_player_by_name(self, name: str) -> Player:
        """Get a player by name."""
        if self._players_by_name is None:
            self._load_players()
        
        player = self._players_by_name.get(name)
        if not player:
            raise PlayerNotFoundError(name)
        
        return player
    
    def search_players(self, query: str) -> List[Player]:
        """Search players by name."""
        if self._players_cache is None:
            self._load_players()
        
        query_lower = query.lower()
        return [
            player for player in self._players_cache
            if query_lower in player.name.lower()
        ]
    
    def get_total_players(self) -> int:
        """Get total number of players."""
        if self._players_cache is None:
            self._load_players()
        return len(self._players_cache)
    
    def reload_players(self) -> None:
        """Reload player data."""
        self._players_cache = None
        self._players_by_name = None
        self._load_players()


# Global service instance
player_service = PlayerService()