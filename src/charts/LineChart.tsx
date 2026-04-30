import { Fragment, useId, useState } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../primitives/Axis';
import { GridLines } from '../primitives/GridLines';
import { chartTokens } from '../theme/tokens';
import { formatNumberCompact } from '../utils/chart';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type {
  AxisConfig,
  GridConfig,
  LegendPosition,
  LineSeriesConfig,
  ReferenceLine,
  ChartHeaderProps
} from '../types';
import {
  buildLegendItemsFromLineSeries,
  buildLinePoints,
  buildReferenceLegend,
  createInvertedScale,
  describeAreaPath,
  describeLinePath,
  formatTooltipValue,
  getDotRadius,
  getEstimatedHoverCardHeight,
  getHoverCardPosition,
  getHoverIndex,
  getViewportHoverCardPosition,
  getValueExtent,
  resolveResponsivePlotWidth,
  resolveTickEntries
} from '../chartUtils';

export interface LineChartProps extends ChartHeaderProps {
  title?: string;
  description?: string;
  categories: string[];
  series: LineSeriesConfig[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
  legendPosition?: LegendPosition;
  yAxis?: AxisConfig;
  secondaryYAxis?: AxisConfig;
  showSecondaryYAxis?: boolean;
  grid?: GridConfig;
  referenceLines?: ReferenceLine[];
  showHoverCard?: boolean;
}

function getSeriesExtent(series: LineSeriesConfig[], extraValues: number[] = []) {
  const values = [...series.flatMap((item) => item.data), ...extraValues].filter((value) =>
    Number.isFinite(value)
  );

  if (!values.length) {
    return getValueExtent([0]);
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (Math.abs(max - min) < 0.001) {
    const padding = Math.max(Math.abs(max) * 0.1, 1);
    return {
      min: min - padding,
      max: max + padding
    };
  }

  return { min, max };
}

export function LineChart({
  title = 'Line Chart',
  description,
  categories,
  series,
  width = 502,
  plotWidth,
  plotHeight = chartTokens.chart.plotHeight,
  showCardBackground = true,
  showHeader = true,
  showLegend = true,
  showTitle = true,
  legendPosition = 'top',
  yAxis,
  secondaryYAxis,
  showSecondaryYAxis = false,
  grid,
  referenceLines = [],
  showHoverCard = false,
  ...headerProps
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const gradientBaseId = useId().replace(/:/g, '');
  const leftSeries = series.filter((item) => item.axis !== 'right');
  const rightSeries = series.filter((item) => item.axis === 'right');
  const resolvedPlotWidth = resolveResponsivePlotWidth(width, plotWidth, 414, 88);
  const rawLeftExtent = getSeriesExtent(
    leftSeries,
    referenceLines.map((item) => item.value)
  );
  const leftExtent = {
    min: typeof yAxis?.min === 'number' ? yAxis.min : rawLeftExtent.min,
    max: typeof yAxis?.max === 'number' ? yAxis.max : rawLeftExtent.max
  };
  const rawRightExtent = getSeriesExtent(rightSeries.length ? rightSeries : leftSeries);
  const rightExtent = {
    min: typeof secondaryYAxis?.min === 'number' ? secondaryYAxis.min : rawRightExtent.min,
    max: typeof secondaryYAxis?.max === 'number' ? secondaryYAxis.max : rawRightExtent.max
  };
  const leftTicks = resolveTickEntries(
    yAxis,
    leftExtent.min,
    leftExtent.max,
    grid?.count ?? chartTokens.chart.gridLineCount
  );
  const rightTicks = resolveTickEntries(
    secondaryYAxis,
    rightExtent.min,
    rightExtent.max,
    grid?.count ?? chartTokens.chart.gridLineCount
  );
  const lineLegendItems = buildLegendItemsFromLineSeries(series);
  const legendItems = showLegend
    ? [...lineLegendItems, ...buildReferenceLegend(referenceLines)]
    : [];
  const categoryWidth = resolvedPlotWidth / Math.max(categories.length, 1);
  const referenceLayers: ReactNode[] = [];
  const gradientLayers: ReactNode[] = [];
  const lineLayers: ReactNode[] = [];

  referenceLines.forEach((line, index) => {
    const y = createInvertedScale(leftExtent.min, leftExtent.max, plotHeight)(line.value);
    referenceLayers.push(
      <Fragment key={`reference-${index}`}>
        <line
          x1="0"
          y1={y}
          x2={resolvedPlotWidth}
          y2={y}
          stroke={line.color ?? chartTokens.text.subtle}
          strokeWidth="1.5"
          strokeDasharray={line.lineStyle === 'dashed' ? '5 4' : undefined}
        />
        {line.label ? (
          <text
            x={resolvedPlotWidth - 4}
            y={y - 4}
            textAnchor="end"
            fontFamily={chartTokens.fontFamily}
            fontSize="12"
            fontWeight="600"
            fill={line.color ?? chartTokens.text.subtle}
          >
            {line.label}
          </text>
        ) : null}
      </Fragment>
    );
  });

  series.forEach((item) => {
    const extent = item.axis === 'right' ? rightExtent : leftExtent;
    const points = buildLinePoints(
      item.data,
      resolvedPlotWidth,
      plotHeight,
      extent.min,
      extent.max,
      chartTokens.chart.lineXInset
    );
    const path = describeLinePath(points);
    const stroke = item.stroke ?? chartTokens.categorical.secondary;
    const baseline =
      chartTokens.chart.lineXInset +
      createInvertedScale(extent.min, extent.max, plotHeight - chartTokens.chart.lineXInset * 2)(
        Math.max(extent.min, 0)
      );

    if (item.showAreaFill) {
      const gradientId = `${gradientBaseId}-line-area-${item.key}`;
      gradientLayers.push(
        <linearGradient
          key={`gradient-${item.key}`}
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="52%" stopColor={stroke} stopOpacity="0.08" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      );
      lineLayers.push(
        <path
          key={`area-${item.key}`}
          d={describeAreaPath(points, baseline)}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
      );
    }

    lineLayers.push(
      <path
        key={`path-${item.key}`}
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={item.strokeWidth ?? 2}
        strokeDasharray={item.lineStyle === 'dashed' ? '5 4' : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={item.active === false ? 0.45 : 1}
      />
    );

    points.forEach((point, pointIndex) => {
      if (item.showDots !== false) {
        lineLayers.push(
          <circle
            key={`dot-${item.key}-${pointIndex}`}
            cx={point.x}
            cy={point.y}
            r={getDotRadius(item.dotSize)}
            fill={item.dotOutline ? chartTokens.neutral.white : stroke}
            stroke={stroke}
            strokeWidth={item.dotOutline ? 2 : 0}
          />
        );
      }

      if (item.showLabels) {
        const isBottomLeftLabel = item.labelPosition === 'bottom-left';
        lineLayers.push(
          <text
            key={`label-${item.key}-${pointIndex}`}
            x={point.x + (isBottomLeftLabel ? -8 : 0)}
            y={point.y + (isBottomLeftLabel ? 18 : -10)}
            textAnchor={isBottomLeftLabel ? 'end' : 'middle'}
            fontFamily={chartTokens.fontFamily}
            fontSize="12"
            fontWeight="600"
            fill={stroke}
          >
            {formatNumberCompact(point.value)}
          </text>
        );
      }
    });
  });

  const hoveredPoints =
    hoveredIndex !== null
      ? series
          .map((item) => {
            const extent = item.axis === 'right' ? rightExtent : leftExtent;
            return buildLinePoints(
              item.data,
              resolvedPlotWidth,
              plotHeight,
              extent.min,
              extent.max,
              chartTokens.chart.lineXInset
            )[hoveredIndex];
          })
          .filter(
            (point): point is { x: number; y: number; value: number; index: number } =>
              Boolean(point)
          )
      : [];
  const hoverCardHeight = getEstimatedHoverCardHeight(series.length);
  const hoverCardPosition = mousePos
    ? getViewportHoverCardPosition(mousePos.x, mousePos.y, 196, hoverCardHeight)
    : null;
  const plotFrameHeight = plotHeight + chartTokens.chart.xAxisHeight;

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
      <div className="cl-cartesian-chart">
        <YAxis
          title={yAxis?.title}
          ticks={leftTicks.map((entry) => entry.label)}
          hideMarkers={yAxis?.hideMarkers}
          height={plotFrameHeight}
        />
        <div className="cl-cartesian-chart__middle" style={{ width: resolvedPlotWidth }}>
          <div
            className="cl-cartesian-chart__plot"
            style={{ width: resolvedPlotWidth, height: plotFrameHeight }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0 0 26px 0'
              }}
            >
              {(grid?.show ?? true) ? (
                <GridLines
                  width={resolvedPlotWidth}
                  height={plotHeight}
                  count={grid?.count}
                  color={grid?.color}
                />
              ) : null}
              <div
                style={{ position: 'relative', width: resolvedPlotWidth, height: plotHeight }}
                onMouseMove={
                  showHoverCard
                    ? (event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHoveredIndex(
                          getHoverIndex(
                            event.clientX - rect.left,
                            resolvedPlotWidth,
                            categories.length
                          )
                        );
                        setMousePos({ x: event.clientX, y: event.clientY });
                      }
                    : undefined
                }
                onMouseLeave={
                  showHoverCard ? () => { setHoveredIndex(null); setMousePos(null); } : undefined
                }
              >
                <svg
                  width={resolvedPlotWidth}
                  height={plotHeight}
                  viewBox={`0 0 ${resolvedPlotWidth} ${plotHeight}`}
                  role="img"
                  aria-label={title}
                  style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
                >
                  {gradientLayers.length ? <defs>{gradientLayers}</defs> : null}
                  {showHoverCard && hoveredIndex !== null ? (
                    <>
                      <rect
                        x={hoveredIndex * categoryWidth}
                        y={0}
                        width={categoryWidth}
                        height={plotHeight}
                        fill={chartTokens.neutral.surfaceTint}
                        opacity={0.45}
                      />
                      <line
                        x1={hoveredIndex * categoryWidth + categoryWidth / 2}
                        y1={0}
                        x2={hoveredIndex * categoryWidth + categoryWidth / 2}
                        y2={plotHeight}
                        stroke={chartTokens.neutral.stoneLight}
                        strokeWidth={1}
                        strokeDasharray="4 3"
                      />
                    </>
                  ) : null}
                  {referenceLayers}
                  {lineLayers}
                  {showHoverCard && hoveredIndex !== null
                    ? series.map((item) => {
                        const extent =
                          item.axis === 'right' ? rightExtent : leftExtent;
                        const points = buildLinePoints(
                          item.data,
                          resolvedPlotWidth,
                          plotHeight,
                          extent.min,
                          extent.max,
                          chartTokens.chart.lineXInset
                        );
                        const point = points[hoveredIndex];

                        if (!point) {
                          return null;
                        }

                        return (
                          <circle
                            key={`hover-point-${item.key}-${hoveredIndex}`}
                            cx={point.x}
                            cy={point.y}
                            r={getDotRadius(item.dotSize) + 2}
                            fill={chartTokens.neutral.white}
                            stroke={item.stroke ?? chartTokens.categorical.secondary}
                            strokeWidth={2}
                          />
                        );
                      })
                    : null}
                </svg>
                {showHoverCard && hoveredIndex !== null ? (
                  <ChartHoverCard
                    title={categories[hoveredIndex]}
                    rows={series.map((item, index) => ({
                      label: item.label,
                      value: formatTooltipValue(item.data[hoveredIndex] ?? 0),
                      color:
                        item.stroke ?? chartTokens.categorical.secondary,
                      strokeColor:
                        item.stroke ?? chartTokens.categorical.secondary,
                      marker: lineLegendItems[index]?.marker
                    }))}
                    left={hoverCardPosition?.left ?? 12}
                    top={hoverCardPosition?.top ?? 12}
                  />
                ) : null}
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: chartTokens.chart.xAxisHeight
              }}
            >
              <XAxis labels={categories} />
            </div>
          </div>
        </div>
        {showSecondaryYAxis ? (
          <YAxis
            side="right"
            title={secondaryYAxis?.title}
            ticks={rightTicks.map((entry) => entry.label)}
            hideMarkers={secondaryYAxis?.hideMarkers}
            height={plotFrameHeight}
          />
        ) : null}
      </div>
    </ChartShell>
  );
}
