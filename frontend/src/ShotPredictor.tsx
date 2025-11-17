import { useState, useCallback, useMemo } from 'react';
import BasketballCourt from './components/BasketballCourt';
import Heatmap, { type HeatmapPoint } from './components/Heatmap';
import PredictionDisplay from './PredictionDisplay';
import { apiClient, type ShotData, type ShotPrediction } from './api/client';
import { screenToCourtCoordinates } from './courtCoordinates';

interface ShotPredictorProps {
  selectedPlayer: string | null;
  width?: number;
  height?: number;
  onPrediction?: (shotMade: boolean, player: string, zone: string) => void;
}

const ShotPredictor: React.FC<ShotPredictorProps> = ({
  selectedPlayer,
  width = 500,
  height = 470,
  onPrediction
}) => {
  const [prediction, setPrediction] = useState<ShotPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shotLocation, setShotLocation] = useState<{
    x: number;
    y: number;
    distance: number;
  } | null>(null);

  // Generate demo heatmap data (same as before)
  const playerHeatmap: HeatmapPoint[] = useMemo(() => {
    const addCluster = (
      arr: HeatmapPoint[],
      centerX: number,
      centerY: number,
      spreadX: number,
      spreadY: number,
      count: number,
      baseProb: number,
      variance: number
    ) => {
      for (let i = 0; i < count; i++) {
        const x = centerX + (Math.random() * 2 - 1) * spreadX;
        const y = centerY + (Math.random() * 2 - 1) * spreadY;
        const weight = Math.max(0.2, Math.min(0.7, baseProb + (Math.random() * 2 - 1) * variance));
        const cx = Math.max(0, Math.min(47, x));
        const cy = Math.max(0, Math.min(50, y));
        arr.push({ x: cx, y: cy, weight });
      }
    };

    const pts: HeatmapPoint[] = [];
    const hoopX = 10;
    const centerY = 25;

    switch (selectedPlayer) {
      case 'Stephen Curry':
        addCluster(pts, hoopX + 24, centerY - 15, 6, 5, 120, 0.52, 0.06);
        addCluster(pts, hoopX + 26, centerY + 15, 6, 5, 120, 0.54, 0.06);
        addCluster(pts, hoopX + 22, centerY, 7, 4, 120, 0.50, 0.05);
        addCluster(pts, hoopX + 10, centerY, 10, 10, 60, 0.40, 0.06);
        break;
      case 'LeBron James':
        addCluster(pts, hoopX + 2, centerY, 4, 6, 160, 0.65, 0.05);
        addCluster(pts, hoopX + 10, centerY + 8, 6, 4, 100, 0.50, 0.06);
        addCluster(pts, hoopX + 10, centerY - 8, 6, 4, 100, 0.50, 0.06);
        addCluster(pts, hoopX + 18, centerY, 8, 6, 60, 0.38, 0.05);
        break;
      case 'Kevin Durant':
        addCluster(pts, hoopX + 16, centerY + 8, 5, 4, 140, 0.55, 0.05);
        addCluster(pts, hoopX + 16, centerY - 8, 5, 4, 140, 0.55, 0.05);
        addCluster(pts, hoopX + 24, centerY, 7, 5, 100, 0.44, 0.05);
        addCluster(pts, hoopX + 6, centerY, 5, 5, 60, 0.50, 0.05);
        break;
      default:
        addCluster(pts, hoopX + 4, centerY, 6, 8, 140, 0.58, 0.05);
        addCluster(pts, hoopX + 18, centerY, 10, 10, 120, 0.42, 0.06);
        addCluster(pts, hoopX + 26, centerY, 10, 12, 100, 0.36, 0.06);
        break;
    }
    return pts;
  }, [selectedPlayer]);

  const handleCourtClick = useCallback(async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPlayer) {
      setError('Please select a player first');
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert screen coordinates to NBA court coordinates
    const courtPos = screenToCourtCoordinates(
      { x: clickX, y: clickY },
      { width, height, courtLengthFeet: 47, courtWidthFeet: 50 }
    );

    // Calculate shot distance from basket (basket is at approximately 0, 50-100 in training data)
    const basketX = 0; // Center court 
    const basketY = 80; // Approximate basket position based on training data
    const distance = Math.sqrt(
      Math.pow((courtPos.x - basketX) / 10, 2) + Math.pow((courtPos.y - basketY) / 10, 2)
    );

    // Determine shot type and zone based on distance and position
    const shotType = distance > 23.75 ? 3 : 2;
    let shotZone = 'Mid-Range';
    
    if (distance <= 4) {
      shotZone = 'Restricted Area';
    } else if (distance <= 8) {
      shotZone = 'In The Paint (Non-RA)';
    } else if (distance > 23.75) {
      // Check if it's a corner 3 (far from center horizontally and close to baseline)
      if (Math.abs(courtPos.x) > 200 && courtPos.y < 150) {
        shotZone = courtPos.x > 0 ? 'Right Corner 3' : 'Left Corner 3';
      } else {
        shotZone = 'Above the Break 3';
      }
    }

    setLoading(true);
    setError(null);
    setShotLocation({
      x: courtPos.x,
      y: courtPos.y,
      distance
    });

    try {
      const shotData: ShotData = {
        LOC_X: courtPos.x,
        LOC_Y: courtPos.y,
        SHOT_DISTANCE: distance,
        SHOT_TYPE: shotType === 3 ? "3PT Field Goal" : "2PT Field Goal",
        SHOT_ZONE_BASIC: shotZone,
        PLAYER_NAME: selectedPlayer
      };

      const result = await apiClient.predictShot(shotData);
      setPrediction(result);
      
      // Update session stats
      if (onPrediction) {
        onPrediction(result.shot_made, selectedPlayer, shotZone);
      }
    } catch (err) {
      setError('Failed to predict shot. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPlayer, width, height]);

  return (
    <div className="shot-predictor">
      <div className="court-container" onClick={handleCourtClick} style={{ cursor: 'crosshair', width: '100%', maxWidth: '100%' }}>
        <BasketballCourt width={width} height={height}>
          <Heatmap
            width={width}
            height={height}
            autoResize
            coordinateSpace="court"
            courtDimensions={{ width, height, courtLengthFeet: 47, courtWidthFeet: 50 }}
            data={playerHeatmap}
            radius={28}
            maxOpacity={0.9}
            leagueAverage={0.45}
            leagueBand={0.2}
          />
        </BasketballCourt>
      </div>
      
      <div className="prediction-panel">
        <PredictionDisplay
          prediction={prediction}
          loading={loading}
          error={error}
          shotLocation={shotLocation || undefined}
        />
      </div>
    </div>
  );
};

export default ShotPredictor;
