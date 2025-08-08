import pandas as pd
import time
from nba_api.stats.static import players
from nba_api.stats.endpoints import shotchartdetail
from nba_api.stats.library.parameters import SeasonAll

# Helper: Get player ID from name
def get_player_id(player_name):
    player = players.find_players_by_full_name(player_name)
    if not player:
        raise ValueError(f"Player not found: {player_name}")
    return player[0]['id']

# Helper: Fetch shot data for a player
def get_shot_data(player_id, season='2023-24'):
    response = shotchartdetail.ShotChartDetail(
        team_id=0,
        player_id=player_id,
        season_type_all_star='Regular Season',
        season_nullable=season,
        context_measure_simple='FGA'
    )
    data = response.get_data_frames()[0]
    return data

# List of players you want to collect data for
player_names = [
    "Stephen Curry", "LeBron James", "Jayson Tatum",
    "Kevin Durant", "Luka Doncic", "Klay Thompson",
    "Joel Embiid", "Giannis Antetokounmpo"
]

# Pull data for all players and save to one CSV
all_shots = []
for name in player_names:
    try:
        print(f"Fetching data for {name}...")
        pid = get_player_id(name)
        df = get_shot_data(pid)
        df["PLAYER_NAME"] = name
        all_shots.append(df)
        time.sleep(1)  # Avoid rate limits
    except Exception as e:
        print(f"Error with {name}: {e}")

# Combine and export
if all_shots:
    shots_df = pd.concat(all_shots, ignore_index=True)
    shots_df.to_csv("data/all_players_shots.csv", index=False)
    print("Data saved to data/all_players_shots.csv")
else:
    print("No data collected.")