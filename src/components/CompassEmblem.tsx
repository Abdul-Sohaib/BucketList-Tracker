interface CompassEmblemProps {
  className?: string;
  size?: number;
  light?: boolean;
}

export default function CompassEmblem({ className = '', size = 32, light = false }: CompassEmblemProps) {
  const strokeColor = light ? '#FAF8F5' : '#1B3B32';
  const fillColor = light ? '#FAF8F5' : '#1B3B32';
  const starFill = light ? '#1B3B32' : '#FAF8F5';
  const needleColor = '#D97706';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="DreamQuest Compass Emblem"
    >
      <circle cx="50" cy="50" r="46" stroke={strokeColor} strokeWidth="2.5" strokeDasharray="2 4" opacity="0.85" />
      <circle cx="50" cy="50" r="41" stroke={strokeColor} strokeWidth="1.5" opacity="0.9" />
      <circle cx="50" cy="50" r="38" fill={fillColor} />
      {/* Compass Star & Mountain Peaks Geometric Mark */}
      <polygon
        points="50,18 54,42 62,34 54,50 78,50 56,56 64,66 50,58 36,66 44,56 22,50 46,50 38,34 46,42"
        fill={starFill}
      />
      {/* North Needle Indicator */}
      <polygon points="50,22 53,44 50,50 47,44" fill={needleColor} />
      <circle cx="50" cy="50" r="4" fill={fillColor} stroke={starFill} strokeWidth="1.5" />
    </svg>
  );
}
