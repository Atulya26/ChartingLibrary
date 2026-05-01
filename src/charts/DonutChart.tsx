import { Fragment, memo, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { chartTokens } from '../theme/tokens';
import { formatNumberCompact } from '../utils/chart';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type {
  DonutSegment,
  FillStyleMode,
  LegendPosition,
  LegendMarkerMode,
  ChartHeaderProps
} from '../types';
import {
  buildLegendItemsFromDonutSegments,
  formatTooltipValue,
  getDonutLabel,
  getEstimatedHoverCardHeight,
  polarToCartesian,
  getViewportHoverCardPosition,
  getSvgFillDefinition,
  resolveFillLegendMarker,
  resolveFillStyle
} from '../chartUtils';

export interface DonutChartProps extends ChartHeaderProps {
  title?: string;
  description?: string;
  segments: DonutSegment[];
  width?: number | string;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
  showLabels?: boolean;
  legendPosition?: LegendPosition;
  labelMode?: 'value' | 'percent' | 'label' | 'label-percent';
  fillStyle?: FillStyleMode;
  legendMarker?: LegendMarkerMode;
  roundedCaps?: boolean;
  showHoverCard?: boolean;
}

function formatPoint(point: { x: number; y: number }) {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

function getArcFlags(startAngle: number, endAngle: number) {
  const span = Math.abs(endAngle - startAngle);
  return span > 180 ? '1' : '0';
}

function describeFlatDonutSegment(
  center: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(center, center, outerRadius, startAngle);
  const outerEnd = polarToCartesian(center, center, outerRadius, endAngle);
  const innerEnd = polarToCartesian(center, center, innerRadius, endAngle);
  const innerStart = polarToCartesian(center, center, innerRadius, startAngle);
  const largeArcFlag = getArcFlags(startAngle, endAngle);

  return [
    `M ${formatPoint(outerStart)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${formatPoint(outerEnd)}`,
    `L ${formatPoint(innerEnd)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${formatPoint(innerStart)}`,
    'Z'
  ].join(' ');
}

function describeRoundedDonutSegment(
  center: number,
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
    return describeFlatDonutSegment(center, outerRadius, innerRadius, startAngle, endAngle);
  }

  const maxOffset = span / 3;
  const outerOffset = Math.min((safeCornerRadius / outerRadius) * (180 / Math.PI), maxOffset);
  const innerOffset = Math.min((safeCornerRadius / innerRadius) * (180 / Math.PI), maxOffset);
  const largeArcFlag = getArcFlags(startAngle + outerOffset, endAngle - outerOffset);
  const outerStart = polarToCartesian(center, center, outerRadius, startAngle + outerOffset);
  const outerEnd = polarToCartesian(center, center, outerRadius, endAngle - outerOffset);
  const innerEnd = polarToCartesian(center, center, innerRadius, endAngle - innerOffset);
  const innerStart = polarToCartesian(center, center, innerRadius, startAngle + innerOffset);

  return [
    `M ${formatPoint(outerStart)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${formatPoint(outerEnd)}`,
    `Q ${formatPoint(polarToCartesian(center, center, outerRadius, endAngle))} ${formatPoint(
      polarToCartesian(center, center, outerRadius - safeCornerRadius, endAngle)
    )}`,
    `L ${formatPoint(polarToCartesian(center, center, innerRadius + safeCornerRadius, endAngle))}`,
    `Q ${formatPoint(polarToCartesian(center, center, innerRadius, endAngle))} ${formatPoint(innerEnd)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${formatPoint(innerStart)}`,
    `Q ${formatPoint(polarToCartesian(center, center, innerRadius, startAngle))} ${formatPoint(
      polarToCartesian(center, center, innerRadius + safeCornerRadius, startAngle)
    )}`,
    `L ${formatPoint(polarToCartesian(center, center, outerRadius - safeCornerRadius, startAngle))}`,
    `Q ${formatPoint(polarToCartesian(center, center, outerRadius, startAngle))} ${formatPoint(outerStart)}`,
    'Z'
  ].join(' ');
}

export const DonutChart = memo(function DonutChart({
  title = 'Pie Chart Example',
  description,
  segments,
  width = 379,
  size = 180,
  thickness = 16,
  centerLabel,
  centerSubLabel,
  showCardBackground = true,
  showHeader = true,
  showLegend = true,
  showTitle = true,
  showLabels = true,
  legendPosition = 'bottom',
  labelMode = 'value',
  fillStyle = 'inherit',
  legendMarker = 'auto',
  roundedCaps = false,
  showHoverCard = false,
  ...headerProps
}: DonutChartProps) {
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const total = useMemo(
    () =>
      Math.max(
        segments.reduce((sum, segment) => sum + segment.value, 0),
        1
      ),
    [segments]
  );
  const svgId = useId().replace(/:/g, '');
  const legendItems = useMemo(
    () => (showLegend ? buildLegendItemsFromDonutSegments(segments, fillStyle, legendMarker) : []),
    [fillStyle, legendMarker, segments, showLegend]
  );
  const center = size / 2;
  const radius = center - thickness / 2 - 2;
  const outerRadius = radius + thickness / 2;
  const innerRadius = radius - thickness / 2;
  const segmentCornerRadius = roundedCaps ? Math.min(4, thickness / 3) : 0;
  const segmentGapAngle = segments.length > 1 ? (1 / radius) * (180 / Math.PI) : 0;
  const { defs, segmentLayouts } = useMemo(() => {
    const definitions: ReactNode[] = [];
    let cumulative = 0;
    const layouts = segments.map((segment, index) => {
      const resolvedFillStyle = resolveFillStyle(segment.fillStyle ?? 'solid', fillStyle);
      const paintId = `donut-${svgId}-${index}`;
      const paint = getSvgFillDefinition(
        paintId,
        resolvedFillStyle,
        segment.color,
        segment.strokeColor ?? segment.color
      );
      const segmentStart = cumulative;
      const segmentMid = segmentStart + segment.value / 2;
      cumulative += segment.value;
      const rawStartAngle = (segmentStart / total) * 360;
      const rawEndAngle = (cumulative / total) * 360;
      const segmentAngle = rawEndAngle - rawStartAngle;
      const gapInset = Math.min(segmentGapAngle / 2, segmentAngle / 4);
      const startAngle = rawStartAngle + gapInset;
      const endAngle = rawEndAngle - gapInset;
      const angle = (segmentMid / total) * Math.PI * 2 - Math.PI / 2;
      const labelRadius = radius + thickness / 2 + 18;
      const labelX = center + Math.cos(angle) * labelRadius;
      const labelY = center + Math.sin(angle) * labelRadius;
      const path = describeRoundedDonutSegment(
        center,
        outerRadius,
        innerRadius,
        startAngle,
        endAngle,
        segmentCornerRadius
      );

      if (paint.definition) {
        definitions.push(paint.definition);
      }

      return {
        segment,
        index,
        resolvedFillStyle,
        paint,
        path,
        labelX,
        labelY
      };
    });

    return { defs: definitions, segmentLayouts: layouts };
  }, [
    center,
    fillStyle,
    innerRadius,
    outerRadius,
    radius,
    segmentCornerRadius,
    segmentGapAngle,
    segments,
    svgId,
    thickness,
    total
  ]);
  const orderedSegmentLayouts = useMemo(
    () =>
      [...segmentLayouts].sort((a, b) => {
        const getOrder = (item: (typeof segmentLayouts)[number]) => {
          if (item.segment.showLegendItem === false) {
            return 0;
          }

          if (item.resolvedFillStyle === 'texture') {
            return 1;
          }

          return 2;
        };

        return getOrder(a) - getOrder(b);
      }),
    [segmentLayouts]
  );
  const hoveredSegment = useMemo(
    () => (hoveredSegmentIndex !== null ? segments[hoveredSegmentIndex] : null),
    [hoveredSegmentIndex, segments]
  );
  const hoverCardPosition = useMemo(
    () =>
      mousePos
        ? getViewportHoverCardPosition(mousePos.x, mousePos.y, 196, getEstimatedHoverCardHeight(2))
        : null,
    [mousePos]
  );

  return (
    <ChartShell
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      legendItems={legendItems}
      legendPosition={legendPosition}
      description={description}
      {...headerProps}
    >
      <div
        className="cl-chart-donut"
        style={{ position: 'relative' }}
        onMouseLeave={
          showHoverCard
            ? () => {
                setHoveredSegmentIndex(null);
                setMousePos(null);
              }
            : undefined
        }
      >
        <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={title}
            style={{ overflow: 'visible' }}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={chartTokens.neutral.surfaceTint}
              strokeWidth={thickness}
            />
            <defs>{defs}</defs>
            {orderedSegmentLayouts.map(({ segment, index, paint, path }) => (
              <path
                key={`${segment.label}-${index}`}
                d={path}
                fill={paint.fill}
                opacity={
                  segment.active === false
                    ? 0.4
                    : hoveredSegmentIndex === null || hoveredSegmentIndex === index
                      ? 1
                      : 0.65
                }
                onMouseMove={
                  showHoverCard
                    ? (event) => {
                        setHoveredSegmentIndex(index);
                        setMousePos({ x: event.clientX, y: event.clientY });
                      }
                    : undefined
                }
              />
            ))}
            {segmentLayouts.map(({ segment, index, labelX, labelY }) => (
              <Fragment key={`label-${segment.label}-${index}`}>
                {showLabels && segment.showLabel !== false ? (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor={labelX > center ? 'start' : 'end'}
                    dominantBaseline="middle"
                    fontFamily={chartTokens.fontFamily}
                    fontSize="12"
                    fontWeight="600"
                    fill={chartTokens.text.chartLabel}
                  >
                    {getDonutLabel(segment, total, labelMode)}
                  </text>
                ) : null}
              </Fragment>
            ))}
            <text
              x={center}
              y={center - 4}
              textAnchor="middle"
              fontFamily={chartTokens.fontFamily}
              fontSize="20"
              fontWeight="600"
              fill={chartTokens.text.chartLabel}
            >
              {centerLabel ?? `${formatNumberCompact(total)}M`}
            </text>
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              fontFamily={chartTokens.fontFamily}
              fontSize="12"
              fontWeight="400"
              fill={chartTokens.text.chartHelper}
            >
              {centerSubLabel ?? 'Target'}
            </text>
          </svg>
          {showHoverCard && hoveredSegment ? (
            <ChartHoverCard
              title={hoveredSegment.legendLabel ?? hoveredSegment.label}
              rows={[
                {
                  label: 'Value',
                  value: formatTooltipValue(hoveredSegment.value),
                  color: hoveredSegment.color,
                  strokeColor: hoveredSegment.strokeColor,
                  marker: resolveFillLegendMarker(
                    resolveFillStyle(hoveredSegment.fillStyle ?? 'solid', fillStyle),
                    legendMarker
                  )
                },
                {
                  label: 'Share of total',
                  value: `${Math.round((hoveredSegment.value / total) * 100)}%`
                }
              ]}
              left={hoverCardPosition?.left ?? 12}
              top={hoverCardPosition?.top ?? 12}
            />
          ) : null}
        </div>
      </div>
    </ChartShell>
  );
});
