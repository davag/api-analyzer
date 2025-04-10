'use client';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
  label?: string;
  grade?: string;
}

export default function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 10,
  backgroundColor = '#e6e6e6',
  progressColor = '#3b82f6',
  showPercentage = true,
  label,
  grade
}: CircularProgressProps) {
  // Calculate values needed for the SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 80) return '#22c55e'; // green-500
    if (percentage >= 60) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };
  
  const actualProgressColor = progressColor === '#3b82f6' ? getColor() : progressColor;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={actualProgressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Text in the center */}
          {showPercentage && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dy=".3em"
              fontSize={size / 4}
              fontWeight="bold"
              fill={actualProgressColor}
            >
              {grade ? grade : `${percentage}%`}
            </text>
          )}
        </svg>
      </div>
      {label && <div className="mt-2 text-sm text-gray-500">{label}</div>}
    </div>
  );
} 