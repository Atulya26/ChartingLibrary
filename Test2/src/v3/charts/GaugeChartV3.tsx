import { chartTokens } from '../../theme/tokens';
import { ChartShellV3 } from '../components/ChartShellV3';
import type { GaugeRangeV3, LegendPositionV3, V3HeaderProps } from '../types';
import {
  clamp,
  describeArcSegment,
  mapValueToAngle
} from '../utils';

export interface GaugeChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  width?: number | string;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  leftLabel?: string;
  rightLabel?: string;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  ranges?: GaugeRangeV3[];
  valueColor?: string;
  roundedCaps?: boolean;
  startAngle?: number;
  sweepAngle?: number;
  showLegend?: boolean;
  legendPosition?: LegendPositionV3;
}

const defaultGaugeRanges: GaugeRangeV3[] = [
  { from: 0, to: 60, color: chartTokens.sequential.red.dark },
  { from: 60, to: 80, color: chartTokens.sequential.warning.default },
  { from: 80, to: 100, color: chartTokens.sequential.success.dark }
];

export function GaugeChartV3({
  title = 'Half Donut Gauge',
  description,
  value,
  min = 0,
  max = 100,
  width = 379,
  size = 220,
  thickness = 16,
  centerLabel,
  centerSubLabel,
  leftLabel,
  rightLabel,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  ranges = defaultGaugeRanges,
  valueColor,
  roundedCaps = true,
  startAngle = 270,
  sweepAngle = 180,
  showLegend = false,
  legendPosition = 'bottom',
  ...headerProps
}: GaugeChartV3Props) {
  const centerX = size / 2;
  const centerY = size * 0.55;
  const radius = size * 0.40;
  const endAngle = startAngle + sweepAngle;
  const clampedValue = clamp(value, min, max);
  const valueAngle = mapValueToAngle(clampedValue, min, max, startAngle, endAngle);
  const activeRange =
    ranges.find((range) => clampedValue >= range.from && clampedValue <= range.to) ??
    ranges[ranges.length - 1];
  const progressPath =
    clampedValue <= min
      ? null
      : describeArcSegment(centerX, centerY, radius, startAngle, valueAngle);

  const legendItems = showLegend ? ranges.map(range => ({
    label: range.label ?? `${range.from}-${range.to}`,
    marker: 'solid' as const,
    color: range.color,
    active: true
  })) : [];

  return (
    <ChartShellV3
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      description={description}
      legendItems={legendItems}
      legendPosition={legendPosition}
      {...headerProps}
    >
      <div className="cl-v3-gauge">
        <svg
          width={size}
          height={size * 0.68}
          viewBox={`0 0 ${size} ${size * 0.68}`}
          role="img"
          aria-label={title}
          style={{ overflow: 'visible' }}
        >
          <path
            d={describeArcSegment(centerX, centerY, radius, startAngle, endAngle)}
            fill="none"
            stroke={chartTokens.neutral.surfaceTint}
            strokeWidth={thickness}
            strokeLinecap={roundedCaps ? 'round' : undefined}
          />
          {progressPath ? (
            <path
              d={progressPath}
              fill="none"
              stroke={valueColor ?? activeRange.color}
              strokeWidth={thickness}
              strokeLinecap={roundedCaps ? 'round' : undefined}
            />
          ) : null}
          <text
            x={centerX}
            y={centerY - 20}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="20"
            fontWeight="600"
            fill={chartTokens.text.default}
          >
            {centerLabel ?? `${Math.round(clampedValue)}`}
          </text>
          <text
            x={centerX}
            y={centerY - 2}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="12"
            fontWeight="400"
            fill={chartTokens.text.subtle}
          >
            {centerSubLabel ?? 'Target'}
          </text>
          <text
            x={centerX - radius}
            y={centerY + 18}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="12"
            fontWeight="400"
            fill={chartTokens.text.subtle}
          >
            {leftLabel ?? `${min}`}
          </text>
          <text
            x={centerX + radius}
            y={centerY + 18}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="12"
            fontWeight="400"
            fill={chartTokens.text.subtle}
          >
            {rightLabel ?? `${max}`}
          </text>
        </svg>
      </div>
    </ChartShellV3>
  );
}
