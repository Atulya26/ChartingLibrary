import { Fragment, useId, useState } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../primitives/Axis';
import { GridLines } from '../primitives/GridLines';
import { chartTokens } from '../theme/tokens';
import { formatNumberCompact } from '../utils/chart';
import { withAlpha } from '../utils/color';
import type { TooltipRow } from '../types';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type {
  AxisConfig,
  FillStyleMode,
  GridConfig,
  HistogramBin,
  LegendMarkerMode,
  LegendPosition,
  ChartHeaderProps
} from '../types';
import {
  buildLinePoints,
  createInvertedScale,
  describeAreaPath,
  describeBarPath,
  describeLinePath,
  formatTooltipValue,
  getDotRadius,
  getEstimatedHoverCardHeight,
  getHoverIndex,
  getViewportHoverCardPosition,
  getSvgFillDefinition,
  getValueExtent,
  resolveFillLegendMarker,
  resolveHistogramBin,
  resolveResponsivePlotWidth,
  resolveTickEntries
} from '../chartUtils';

export interface HistogramChartProps extends ChartHeaderProps {
  title?: string;
  description?: string;
  bins: HistogramBin[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  showTopLabels?: boolean;
  overlayLine?: boolean;
  overlayDots?: boolean;
  overlayAreaFill?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  fillStyle?: FillStyleMode;
  legendMarker?: LegendMarkerMode;
  overlayLegendLabel?: string;
  showHoverCard?: boolean;
}

export function HistogramChart({
  title = 'Histogram',
  description,
  bins,
  width = 502,
  plotWidth,
  plotHeight = chartTokens.chart.plotHeight,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  yAxis,
  grid,
  showTopLabels = true,
  overlayLine = false,
  overlayDots = false,
  overlayAreaFill = false,
  showLegend = true,
  legendPosition = 'bottom',
  fillStyle = 'inherit',
  legendMarker = 'auto',
  overlayLegendLabel = 'Overlay line',
  showHoverCard = false,
  ...headerProps
}: HistogramChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const svgId = useId().replace(/:/g, '');
  const resolvedPlotWidth = resolveResponsivePlotWidth(width, plotWidth, 414, 88);
  const resolvedBins = bins.map((bin, index) =>
    resolveHistogramBin(bin, index, fillStyle)
  );
  const extent = getValueExtent(resolvedBins.map((bin) => bin.value));
  const tickEntries = resolveTickEntries(
    yAxis,
    extent.min,
    extent.max,
    grid?.count ?? chartTokens.chart.gridLineCount
  );
  const barWidth = resolvedPlotWidth / Math.max(resolvedBins.length, 1);
  const scaleY = createInvertedScale(extent.min, extent.max, plotHeight);
  const zeroY = scaleY(0);
  const defs: ReactNode[] = [];
  const barLayers: ReactNode[] = [];
  const labelLayers: ReactNode[] = [];
  const legendEntries = new Map<string, {
    label: string;
    color: string;
    strokeColor?: string;
    marker: ReturnType<typeof resolveFillLegendMarker>;
    active?: boolean;
  }>();

  resolvedBins.forEach((bin) => {
    if (bin.showLegendItem === false) {
      return;
    }

    const legendKey =
      bin.legendLabel ??
      `${bin.fill}-${bin.stroke}-${bin.fillStyle}`;

    if (!legendEntries.has(legendKey)) {
      legendEntries.set(legendKey, {
        label: bin.legendLabel ?? 'Distribution',
        color: bin.fill,
        strokeColor: bin.stroke,
        marker: resolveFillLegendMarker(bin.fillStyle, legendMarker),
        active: bin.active
      });
    }
  });

  if (overlayLine) {
    legendEntries.set('overlay-line', {
      label: overlayLegendLabel,
      color: chartTokens.categorical.secondary,
      strokeColor: chartTokens.categorical.secondary,
      marker: overlayDots ? 'dot-line' : 'line',
      active: true
    });
  }

  const legendItems = showLegend ? Array.from(legendEntries.values()) : [];

  resolvedBins.forEach((bin, index) => {
    const valueY = scaleY(bin.value);
    const height = Math.max(Math.abs(zeroY - valueY), 1);
    const paintId = `histogram-${svgId}-${index}`;
    const paint = getSvgFillDefinition(
      paintId,
      bin.fillStyle,
      bin.fill,
      bin.stroke
    );

    if (paint.definition) {
      defs.push(paint.definition);
    }

    barLayers.push(
      <path
        key={bin.label}
        d={describeBarPath(
          index * barWidth,
          bin.value >= 0 ? valueY : zeroY,
          Math.max(barWidth, 1),
          height,
          chartTokens.radii.bar,
          bin.value >= 0 ? 'positive' : 'negative'
        )}
        fill={paint.fill}
        stroke={bin.stroke}
        strokeWidth={1}
      />
    );

    if (showTopLabels) {
      labelLayers.push(
        <text
          key={`label-${bin.label}`}
          x={index * barWidth + barWidth / 2}
          y={valueY - 6}
          textAnchor="middle"
          fontFamily={chartTokens.fontFamily}
          fontSize="12"
          fontWeight="600"
          fill={chartTokens.text.chartLabel}
        >
          {formatNumberCompact(bin.value)}
        </text>
      );
    }
  });

  const overlayPoints = buildLinePoints(
    resolvedBins.map((bin) => bin.value),
    resolvedPlotWidth - barWidth,
    plotHeight,
    extent.min,
    extent.max
  ).map((point) => ({
    ...point,
    x: point.x + barWidth / 2
  }));
  const hoveredBin = hoveredIndex !== null ? resolvedBins[hoveredIndex] : null;
  const hoverCardPosition =
    hoveredIndex !== null && mousePos
      ? getViewportHoverCardPosition(mousePos.x, mousePos.y, 196, getEstimatedHoverCardHeight(overlayLine ? 2 : 1))
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
          ticks={tickEntries.map((entry) => entry.label)}
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
                            resolvedBins.length
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
                  <defs>{defs}</defs>
                  {showHoverCard && hoveredIndex !== null ? (
                    <rect
                      x={hoveredIndex * barWidth}
                      y={0}
                      width={barWidth}
                      height={plotHeight}
                      fill={chartTokens.neutral.surfaceTint}
                      opacity={0.4}
                    />
                  ) : null}
                  {barLayers}
                  {showTopLabels ? labelLayers : null}
                  {overlayLine ? (
                    <Fragment>
                      {overlayAreaFill ? (
                        <path
                          d={describeAreaPath(overlayPoints, zeroY)}
                          fill={withAlpha(chartTokens.categorical.secondary, 0.14)}
                          stroke="none"
                        />
                      ) : null}
                      <path
                        d={describeLinePath(overlayPoints)}
                        fill="none"
                        stroke={chartTokens.categorical.secondary}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {overlayDots
                        ? overlayPoints.map((point, index) => (
                            <circle
                              key={`dot-${index}`}
                              cx={point.x}
                              cy={point.y}
                              r={getDotRadius('medium')}
                              fill={chartTokens.neutral.white}
                              stroke={chartTokens.categorical.secondary}
                              strokeWidth={2}
                            />
                          ))
                        : null}
                    </Fragment>
                  ) : null}
                </svg>
                {showHoverCard && hoveredIndex !== null ? (
                  <ChartHoverCard
                    title={resolvedBins[hoveredIndex].label}
                    rows={[
                      {
                        label:
                          resolvedBins[hoveredIndex].legendLabel ??
                          'Observed distribution',
                        value: formatTooltipValue(
                          resolvedBins[hoveredIndex].value
                        ),
                        color: resolvedBins[hoveredIndex].fill,
                        strokeColor: resolvedBins[hoveredIndex].stroke,
                        marker: resolveFillLegendMarker(
                          resolvedBins[hoveredIndex].fillStyle,
                          legendMarker
                        ) as TooltipRow['marker']
                      },
                      ...(overlayLine
                        ? ([
                            {
                              label: overlayLegendLabel,
                              value: formatTooltipValue(
                                overlayPoints[hoveredIndex]?.value ??
                                  resolvedBins[hoveredIndex].value
                              ),
                              color: chartTokens.categorical.secondary,
                              strokeColor: chartTokens.categorical.secondary,
                              marker: (overlayDots ? 'dot-line' : 'line') as TooltipRow['marker']
                            }
                          ] satisfies TooltipRow[])
                        : [])
                    ] satisfies TooltipRow[]}
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
              <XAxis labels={resolvedBins.map((bin) => bin.label)} />
            </div>
          </div>
        </div>
      </div>
    </ChartShell>
  );
}
