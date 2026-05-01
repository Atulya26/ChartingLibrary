import { memo, useState } from 'react';

import { chartTokens } from '../theme/tokens';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type { HalfDonutRange, LegendPosition, ChartHeaderProps } from '../types';
import {
  clamp,
  formatTooltipValue,
  getEstimatedHoverCardHeight,
  getViewportHoverCardPosition,
  mapValueToAngle,
  polarToCartesian
} from '../chartUtils';

export interface HalfDonutChartProps extends ChartHeaderProps {
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
  ranges?: HalfDonutRange[];
  valueColor?: string;
  roundedCaps?: boolean;
  startAngle?: number;
  sweepAngle?: number;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  showHoverCard?: boolean;
}

const defaultHalfDonutRanges: HalfDonutRange[] = [
  { from: 0, to: 100, color: chartTokens.multiHue.donutBlue, label: 'Current' }
];

function formatPoint(point: { x: number; y: number }) {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

function getArcFlags(startAngle: number, endAngle: number) {
  const span = Math.abs(endAngle - startAngle);
  return span > 180 ? '1' : '0';
}

function describeFlatArcBand(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const largeArcFlag = getArcFlags(startAngle, endAngle);

  return [
    `M ${formatPoint(outerStart)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${formatPoint(outerEnd)}`,
    `L ${formatPoint(innerEnd)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${formatPoint(innerStart)}`,
    'Z'
  ].join(' ');
}

function describeRoundedArcBand(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number
) {
  const span = Math.abs(endAngle - startAngle);
  const safeCornerRadius = Math.max(
    0,
    Math.min(cornerRadius, (outerRadius - innerRadius) / 2 - 0.5)
  );

  if (safeCornerRadius <= 0 || span < 3) {
    return describeFlatArcBand(centerX, centerY, outerRadius, innerRadius, startAngle, endAngle);
  }

  const maxOffset = span / 3;
  const outerOffset = Math.min((safeCornerRadius / outerRadius) * (180 / Math.PI), maxOffset);
  const innerOffset = Math.min((safeCornerRadius / innerRadius) * (180 / Math.PI), maxOffset);
  const largeArcFlag = getArcFlags(startAngle + outerOffset, endAngle - outerOffset);
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, startAngle + outerOffset);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, endAngle - outerOffset);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle - innerOffset);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle + innerOffset);

  return [
    `M ${formatPoint(outerStart)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${formatPoint(outerEnd)}`,
    `Q ${formatPoint(polarToCartesian(centerX, centerY, outerRadius, endAngle))} ${formatPoint(
      polarToCartesian(centerX, centerY, outerRadius - safeCornerRadius, endAngle)
    )}`,
    `L ${formatPoint(polarToCartesian(centerX, centerY, innerRadius + safeCornerRadius, endAngle))}`,
    `Q ${formatPoint(polarToCartesian(centerX, centerY, innerRadius, endAngle))} ${formatPoint(innerEnd)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${formatPoint(innerStart)}`,
    `Q ${formatPoint(polarToCartesian(centerX, centerY, innerRadius, startAngle))} ${formatPoint(
      polarToCartesian(centerX, centerY, innerRadius + safeCornerRadius, startAngle)
    )}`,
    `L ${formatPoint(polarToCartesian(centerX, centerY, outerRadius - safeCornerRadius, startAngle))}`,
    `Q ${formatPoint(polarToCartesian(centerX, centerY, outerRadius, startAngle))} ${formatPoint(outerStart)}`,
    'Z'
  ].join(' ');
}

export const HalfDonutChart = memo(function HalfDonutChart({
  title = 'Half Donut',
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
  ranges = defaultHalfDonutRanges,
  valueColor,
  roundedCaps = true,
  startAngle = 270,
  sweepAngle = 180,
  showLegend = false,
  legendPosition = 'bottom',
  showHoverCard = false,
  ...headerProps
}: HalfDonutChartProps) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const centerX = size / 2;
  const centerY = size * 0.55;
  const radius = size * 0.4;
  const outerRadius = radius + thickness / 2;
  const innerRadius = radius - thickness / 2;
  const endAngle = startAngle + sweepAngle;
  const clampedValue = clamp(value, min, max);
  const valueAngle = mapValueToAngle(clampedValue, min, max, startAngle, endAngle);
  const segmentCornerRadius = roundedCaps ? Math.min(4, thickness / 3) : 0;
  const joinGapAngle =
    clampedValue > min && clampedValue < max ? (1 / radius) * (180 / Math.PI) : 0;
  const progressEndAngle = Math.max(startAngle + 0.01, valueAngle - joinGapAngle / 2);
  const activeRange =
    ranges.find((range) => clampedValue >= range.from && clampedValue <= range.to) ??
    ranges[ranges.length - 1];
  const progressPath =
    clampedValue <= min
      ? null
      : describeRoundedArcBand(
          centerX,
          centerY,
          outerRadius,
          innerRadius,
          startAngle,
          progressEndAngle,
          segmentCornerRadius
        );
  const trackPath = describeRoundedArcBand(
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    startAngle,
    endAngle,
    segmentCornerRadius
  );
  const hoverRows = [
    {
      label: 'Current',
      value: centerLabel ?? formatTooltipValue(clampedValue),
      color: valueColor ?? activeRange.color,
      marker: 'solid' as const
    },
    ...(centerSubLabel
      ? [
          {
            label: 'Context',
            value: centerSubLabel
          }
        ]
      : []),
    {
      label: 'Band',
      value: activeRange.label ?? `${activeRange.from}-${activeRange.to}`,
      color: activeRange.color,
      marker: 'solid' as const
    },
    {
      label: 'Scale',
      value: `${leftLabel ?? min} - ${rightLabel ?? max}`
    }
  ];
  const hoverCardPosition = mousePos
    ? getViewportHoverCardPosition(
        mousePos.x,
        mousePos.y,
        196,
        getEstimatedHoverCardHeight(hoverRows.length)
      )
    : null;

  const legendItems = showLegend
    ? ranges.map((range) => ({
        label: range.label ?? `${range.from}-${range.to}`,
        marker: 'solid' as const,
        color: range.color,
        active: true
      }))
    : [];

  return (
    <ChartShell
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
      <div
        className="cl-chart-half-donut"
        style={{ position: 'relative', width: size, margin: '0 auto' }}
        onMouseMove={
          showHoverCard
            ? (event) => {
                setHovered(true);
                setMousePos({ x: event.clientX, y: event.clientY });
              }
            : undefined
        }
        onMouseLeave={
          showHoverCard
            ? () => {
                setHovered(false);
                setMousePos(null);
              }
            : undefined
        }
      >
        <svg
          width={size}
          height={size * 0.68}
          viewBox={`0 0 ${size} ${size * 0.68}`}
          role="img"
          aria-label={title}
          style={{ overflow: 'visible' }}
        >
          <path d={trackPath} fill={chartTokens.neutral.surfaceTint} />
          {progressPath ? <path d={progressPath} fill={valueColor ?? activeRange.color} /> : null}
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
        {showHoverCard && hovered ? (
          <ChartHoverCard
            title={title}
            rows={hoverRows}
            left={hoverCardPosition?.left ?? 0}
            top={hoverCardPosition?.top ?? 0}
          />
        ) : null}
      </div>
    </ChartShell>
  );
});
