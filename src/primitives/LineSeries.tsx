import { chartTokens } from '../theme/tokens';
import type { DotSize, LineSeriesConfig } from '../types';
import {
  buildLinePoints,
  createYScale,
  describeAreaPath,
  describeLinePath,
  getValueExtent
} from '../utils/chart';
import { withAlpha } from '../utils/color';

export interface LineSeriesProps extends Pick<
  LineSeriesConfig,
  | 'stroke'
  | 'strokeWidth'
  | 'lineStyle'
  | 'dotSize'
  | 'dotOutline'
  | 'showDots'
  | 'showAreaFill'
  | 'showLabels'
  | 'labelPosition'
> {
  values: number[];
  width: number;
  height: number;
  minValue?: number;
  maxValue?: number;
}

function getDotRadius(size: DotSize = 'medium') {
  if (size === 'small') {
    return 2;
  }

  if (size === 'large') {
    return 5;
  }

  return 3;
}

export function LineSeries({
  values,
  width,
  height,
  minValue,
  maxValue,
  stroke = chartTokens.categorical.secondary,
  strokeWidth = 2,
  lineStyle = 'solid',
  dotSize = 'medium',
  dotOutline = false,
  showDots = true,
  showAreaFill = false,
  showLabels = false,
  labelPosition = 'top'
}: LineSeriesProps) {
  const extent = getValueExtent([values]);
  const resolvedMin = typeof minValue === 'number' ? minValue : extent.min;
  const resolvedMax = typeof maxValue === 'number' ? maxValue : extent.max;
  const insets = { top: 12, right: 0, bottom: 12, left: 0 };
  const points = buildLinePoints(values, width, height, insets, resolvedMin, resolvedMax);
  const linePath = describeLinePath(points);
  const baseline =
    insets.top + createYScale(resolvedMin, resolvedMax, height - insets.top - insets.bottom)(0);
  const areaPath = describeAreaPath(points, baseline);
  const radius = getDotRadius(dotSize);

  return (
    <svg
      className="cl-line-series"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {showAreaFill ? <path d={areaPath} fill={withAlpha(stroke, 0.14)} stroke="none" /> : null}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={lineStyle === 'dashed' ? '5 4' : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, index) => (
        <g key={index}>
          {showDots ? (
            <circle
              cx={point.x}
              cy={point.y}
              r={radius}
              fill={dotOutline ? chartTokens.neutral.white : stroke}
              stroke={stroke}
              strokeWidth={dotOutline ? 2 : 0}
            />
          ) : null}
          {showLabels ? (
            <text
              x={point.x}
              y={point.y + (labelPosition === 'bottom-left' ? 16 : -10)}
              textAnchor={labelPosition === 'bottom-left' ? 'end' : 'middle'}
              fontFamily={chartTokens.fontFamily}
              fontSize="12"
              fontWeight="600"
              fill={chartTokens.text.inverse}
            >
              x
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
