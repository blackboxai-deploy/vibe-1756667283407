'use client';

import React from 'react';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed: number;
  label: string;
  unit: string;
  size?: number;
  isActive?: boolean;
}

export function SpeedGauge({ 
  speed, 
  maxSpeed, 
  label, 
  unit, 
  size = 180,
  isActive = false 
}: SpeedGaugeProps) {
  // Calculate the angle for the speedometer (0-270 degrees)
  const maxAngle = 270;
  const angle = Math.min((speed / maxSpeed) * maxAngle, maxAngle);
  
  // Determine color based on speed ranges
  const getSpeedColor = (currentSpeed: number, max: number) => {
    const ratio = currentSpeed / max;
    if (ratio < 0.3) return '#ef4444'; // red
    if (ratio < 0.6) return '#f59e0b'; // amber
    if (ratio < 0.8) return '#10b981'; // emerald
    return '#06b6d4'; // cyan for very high speeds
  };

  const speedColor = getSpeedColor(speed, maxSpeed);
  
  // Create SVG path for the arc
  const radius = (size - 40) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Background arc path
  const createArcPath = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(centerX, centerY, r, endAngle);
    const end = polarToCartesian(centerX, centerY, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };
  
  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  const backgroundPath = createArcPath(135, 45, radius);
  const progressPath = createArcPath(135, 135 + angle, radius);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Speedometer */}
        <svg width={size} height={size} className="transform -rotate-45">
          {/* Background arc */}
          <path
            d={backgroundPath}
            stroke="#374151"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d={progressPath}
            stroke={speedColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={`transition-all duration-500 ${isActive ? 'drop-shadow-lg' : ''}`}
            style={{
              filter: isActive ? `drop-shadow(0 0 8px ${speedColor}40)` : 'none'
            }}
          />
          
          {/* Center dot */}
          <circle
            cx={centerX}
            cy={centerY}
            r="4"
            fill={speedColor}
            className="transition-colors duration-500"
          />
        </svg>
        
        {/* Speed display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className={`text-3xl font-bold transition-colors duration-500 ${
            isActive ? 'text-white' : 'text-gray-300'
          }`}>
            {speed.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wide">
            {unit}
          </div>
        </div>
        
        {/* Speed scale markers */}
        <div className="absolute inset-0">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const markerAngle = 135 + (ratio * 270) - 90; // Adjust for rotation
            const markerRadius = radius + 15;
            const markerPos = polarToCartesian(centerX, centerY, markerRadius, markerAngle + 90);
            
            return (
              <div
                key={index}
                className="absolute text-xs text-gray-500 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: markerPos.x,
                  top: markerPos.y,
                }}
              >
                {Math.round(maxSpeed * ratio)}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Label */}
      <div className="text-center">
        <h3 className={`text-lg font-semibold transition-colors duration-500 ${
          isActive ? 'text-white' : 'text-gray-300'
        }`}>
          {label}
        </h3>
      </div>
    </div>
  );
}