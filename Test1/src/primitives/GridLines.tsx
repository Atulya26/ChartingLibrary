import { chartTokens } from '../theme/tokens';

export interface GridLinesProps {
  width: number;
  height: number;
  count?: number;
  color?: string;
}

export function GridLines({
  width,
  height,
  count = chartTokens.chart.gridLineCount,
  color = chartTokens.neutral.stoneLight
}: GridLinesProps) {
  return (
    <svg
      className="cl-grid"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => {
        const y = (height / Math.max(count - 1, 1)) * index;
        return (
          <line
            key={index}
            x1="0"
            y1={y}
            x2={width}
            y2={y}
            stroke={color}
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}
