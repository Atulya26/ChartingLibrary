import { chartTokens } from '../../theme/tokens';
import { buildLinePoints, describeLinePath, getValueExtent } from '../utils';

export interface SparklineV3Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export function SparklineV3({
  values,
  width = 84,
  height = 28,
  color = chartTokens.sequential.default.dark,
  strokeWidth = 1.5
}: SparklineV3Props) {
  const extent = getValueExtent(values);
  const points = buildLinePoints(values, width, height, extent.min, extent.max, 2);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sparkline"
    >
      <path
        d={describeLinePath(points)}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
