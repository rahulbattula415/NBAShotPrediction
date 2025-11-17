// courtCoordinates.ts - Utility functions for coordinate conversion

export interface CourtDimensions {
  width: number;
  height: number;
  courtLengthFeet: number;
  courtWidthFeet: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface CourtPosition {
  x: number; // Distance from baseline in feet
  y: number; // Distance from sideline in feet
}

/**
 * Convert screen/SVG coordinates to NBA court coordinates 
 * NBA coordinate system matches training data scale:
 * - LOC_X: 0 is center court, negative = left side, positive = right side  
 * - LOC_Y: distance from baseline, basket is around Y=50-100
 * - Coordinates are in tenths of feet (scale ~-250 to +250 for X, 0 to 400+ for Y)
 */
export const screenToCourtCoordinates = (
  screenPos: Position, 
  dimensions: CourtDimensions
): CourtPosition => {
  // Convert screen position to normalized coordinates (0-1)
  const normalizedX = screenPos.x / dimensions.width;
  const normalizedY = screenPos.y / dimensions.height;
  
  // Map to NBA coordinate system scale to match training data
  // X: center at 0, range roughly -250 to +250 (negative = left, positive = right)
  const nbaX = (normalizedY - 0.5) * 500; // Center and scale to match training data
  // Y: baseline at ~50, range roughly 50 to 400+ 
  const nbaY = 50 + (normalizedX * 350); // Start at baseline and extend toward opposite end
  
  return {
    x: Math.round(nbaX),
    y: Math.round(nbaY)
  };
};

/**
 * Convert court coordinates (feet) to screen/SVG coordinates
 */
export const courtToScreenCoordinates = (
  courtPos: CourtPosition, 
  dimensions: CourtDimensions
): Position => {
  const scaleX = dimensions.width / dimensions.courtLengthFeet;
  const scaleY = dimensions.height / dimensions.courtWidthFeet;
  
  return {
    x: courtPos.x * scaleX,
    y: courtPos.y * scaleY
  };
};

/**
 * Check if a position is within court bounds
 */
export const isWithinCourtBounds = (
  courtPos: CourtPosition, 
  dimensions: CourtDimensions
): boolean => {
  return (
    courtPos.x >= 0 && 
    courtPos.x <= dimensions.courtLengthFeet &&
    courtPos.y >= 0 && 
    courtPos.y <= dimensions.courtWidthFeet
  );
};

/**
 * Calculate distance from basket (useful for shot predictions)
 */
export const distanceFromBasket = (
  courtPos: CourtPosition, 
  basketSide: 'left' | 'right' = 'right'
): number => {
  const basketX = basketSide === 'left' ? 10 : 84; // 10 feet from each baseline
  const basketY = 25; // Center of court (50/2 = 25)
  
  const dx = courtPos.x - basketX;
  const dy = courtPos.y - basketY;
  
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate angle to basket (in degrees)
 */
export const angleToBasket = (
  courtPos: CourtPosition, 
  basketSide: 'left' | 'right' = 'right'
): number => {
  const basketX = basketSide === 'left' ? 10 : 84;
  const basketY = 25;
  
  const dx = basketX - courtPos.x;
  const dy = basketY - courtPos.y;
  
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

/**
 * Determine shot zone based on position
 */
export const getShotZone = (courtPos: CourtPosition): string => {
  const distanceToBasket = distanceFromBasket(courtPos, 'right');
  
  if (distanceToBasket <= 8) return 'Restricted Area';
  if (distanceToBasket <= 16) return 'Paint';
  if (distanceToBasket <= 23.75) return 'Mid-range';
  return 'Three-point';
};

/**
 * Default court dimensions
 */
export const DEFAULT_COURT_DIMENSIONS: CourtDimensions = {
  width: 800,
  height: 400,
  courtLengthFeet: 94,
  courtWidthFeet: 50
};