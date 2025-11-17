import React from 'react';

interface BasketballCourtProps {
  width?: number;
  height?: number;
  children?: React.ReactNode; // For overlaying other components
}

const BasketballCourt: React.FC<BasketballCourtProps> = ({ 
  width = 625, 
  height = 588, 
  children 
}) => {
  // Court dimensions in feet (we'll scale these to our SVG)
  const courtLength = 47; // feet
  const courtWidth = 50;  // feet
  
  // Calculate scale factors
  const scaleX = width / courtLength;
  const scaleY = height / courtWidth;
  
  // Key dimensions (scaled)
  const keyWidth = 16 * scaleX;
  const keyLength = 19 * scaleY;
  
  // Three-point line dimensions
  const threePointRadius = 23.75 * scaleY; // 23'9"
  // Used in three-point line calculations
  
  // Free throw dimensions
  const freeThrowCircleRadius = 6 * scaleY;

  return (
    <div className="basketball-court-container">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          background: '#D2691E', // Basketball court orange/brown
          border: '3px solid #8B4513', // Darker brown border
          width: '100%',
          height: 'auto'
        }}
      >
        {/* Court outline */}
        <rect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        
        {/* COURT */}
        {/* Key (paint) */}
        <rect
          x={(width - keyWidth) / 2}
          y={2}
          width={keyWidth}
          height={keyLength}
          fill="rgba(139, 69, 19, 0.3)" // Slightly darker for the key
          stroke="white"
          strokeWidth="2"
        />
        
        {/* Left free throw circle */}
        <circle
          cx={ width / 2 }
          cy={keyLength}
          r={freeThrowCircleRadius}
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        
        {/* Three-point line */}
          <path
            d={`M  37.5 175
                A ${threePointRadius} ${threePointRadius} 0 0 0 ${width - 37.5} 175`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        
        {/* Left Corner of 3PT Line */}
        <line
          x1={37.5}
          y1={0}
          x2={37.5}
          y2={175}
          stroke="white"
          strokeWidth="2"
        />

        {/* Right Corner of 3PT Line */}
        <line
          x1={ width - 37.5}
          y1={0}
          x2={width - 37.5}
          y2={175}
          stroke="white"
          strokeWidth="2"
        />

        {/* Basket */}
          <circle
            cx={width / 2}
            cy={(4 * scaleY) + 9.4}
            r={9.4}
            fill="white"
            stroke="red"
            strokeWidth="2"
          />
        
        {/* Backboard */}
          <line
            x1={(width / 2) - 18.75}
            y1={4 * scaleY}
            x2={(width / 2) + 18.75}
            y2={4 * scaleY}
            stroke="black"
            strokeWidth="3"
          />
      </svg>
      
      {/* Overlay children (like draggable icons, heatmaps, etc.) */}
      {children}
    </div>
  );
};

export default BasketballCourt;