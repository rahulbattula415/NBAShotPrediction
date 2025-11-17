const API_BASE_URL = 'http://localhost:8000';

export interface ShotData {
  LOC_X: number;
  LOC_Y: number;
  SHOT_DISTANCE: number;
  SHOT_TYPE: number | string;
  SHOT_ZONE_BASIC: string;
  PLAYER_NAME: string;
}

export interface ShotPrediction {
  shot_made: boolean;
  probability: number;
  confidence: string;
  shot_info: {
    distance: number;
    shot_type: string;
    zone: string;
    difficulty: string;
    comparable_shots: {
      league_avg: number;
      attempts: number;
      makes: number;
    };
    league_average: number;
  };
  player_stats?: {
    fg_percentage: number;
    three_point_percentage: number;
    free_throw_percentage: number;
    effective_fg_percentage: number;
    true_shooting_percentage: number;
    games_played: number;
    minutes_per_game: number;
    field_goals_made: number;
    field_goals_attempted: number;
  };
}

export interface Player {
  id: number;
  name: string;
  team?: string;
  position?: string;
  jersey_number?: number;
  height?: string;
  weight?: number;
  years_pro?: number;
}

export interface PlayersResponse {
  players: Player[];
  total: number;
  page: number;
  per_page: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async predictShot(shotData: ShotData): Promise<ShotPrediction> {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shotData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getPlayers(): Promise<PlayersResponse> {
    const response = await fetch(`${this.baseUrl}/players`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
