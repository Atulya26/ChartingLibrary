import { Fragment, memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

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
  ChartAccessibilityProps,
  ChartHeaderProps
} from '../types';
import {
  buildLegendItemsFromLineSeries,
  buildLinePointAtIndex,
  buildLinePointsAtIndices,
  buildReferenceLegend,
  createInvertedScale,
  describeAreaPath,
  describeLinePath,
  formatTooltipValue,
  getDotRadius,
  getEstimatedHoverCardHeight,
  getHoverIndex,
  getViewportHoverCardPosition,
  getValueExtent,
  resolveResponsivePlotWidth,
  resolveTickEntries
} from '../chartUtils';
import {
  ChartLiveRegion,
  ChartSvgA11y,
  describeCategoricalChart,
  getChartA11yContent,
  getChartA11yProps
} from '../utils/a11y';
import { useChartKeyboardNav } from '../utils/useChartKeyboardNav';
import {
  downsampleLttb,
  getDownsampleLimit,
  warnForLargeUndownsampledDataset
} from '../utils/downsample';

export interface LineChartProps extends ChartHeaderProps, ChartAccessibilityProps {
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
  /** Max points to render per series. Uses LTTB to preserve visual shape. Off by default. */
  downsample?: number;
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

export const LineChart = memo(function LineChart({
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
  downsample,
  ariaLabel,
  ariaDescription,
  enableKeyboardNavigation = false,
  ...headerProps
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const gradientBaseId = useId().replace(/:/g, '');
  const a11yTitleId = `${gradientBaseId}-title`;
  const a11yDescriptionId = `${gradientBaseId}-description`;
  useEffect(() => {
    warnForLargeUndownsampledDataset(
      'LineChart',
      series.reduce((sum, item) => sum + item.data.length, 0),
      downsample
    );
  }, [downsample, series]);
  const leftSeries = useMemo(() => series.filter((item) => item.axis !== 'right'), [series]);
  const rightSeries = useMemo(() => series.filter((item) => item.axis === 'right'), [series]);
  const resolvedPlotWidth = useMemo(
    () => resolveResponsivePlotWidth(width, plotWidth, 414, 88),
    [plotWidth, width]
  );
  const referenceValues = useMemo(() => referenceLines.map((item) => item.value), [referenceLines]);
  const a11yContent = useMemo(
    () =>
      getChartA11yContent({
        title,
        description,
        ariaLabel,
        ariaDescription,
        fallbackDescription: describeCategoricalChart({
          chartType: showSecondaryYAxis ? 'Dual-axis line chart' : 'Line chart',
          categories,
          series: series.map((item) => ({
            label: item.label,
            values: item.data
          }))
        })
      }),
    [ariaDescription, ariaLabel, categories, description, series, showSecondaryYAxis, title]
  );
  const chartA11yProps = getChartA11yProps({
    titleId: a11yTitleId,
    descriptionId: a11yDescriptionId,
    enableKeyboardNavigation
  });
  const keyboardItems = useMemo(
    () =>
      series.flatMap((item, seriesIndex) =>
        categories.map((category, categoryIndex) => ({
          category,
          categoryIndex,
          seriesLabel: item.label,
          seriesIndex,
          value: item.data[categoryIndex] ?? 0
        }))
      ),
    [categories, series]
  );
  const keyboardNav = useChartKeyboardNav({
    items: keyboardItems,
    enabled: enableKeyboardNavigation,
    getAnnouncement: (item, index) =>
      `${index + 1} of ${keyboardItems.length}: ${item.seriesLabel}, ${item.category}, ${formatTooltipValue(item.value)}.`,
    getNextIndex: (currentIndex, key, itemCount) => {
      const categoryCount = Math.max(categories.length, 1);
      const seriesCount = Math.max(series.length, 1);
      const currentSeries = Math.floor(currentIndex / categoryCount);
      const currentCategory = currentIndex % categoryCount;

      if (key === 'Home') {
        return currentSeries * categoryCount;
      }

      if (key === 'End') {
        return currentSeries * categoryCount + categoryCount - 1;
      }

      if (key === 'ArrowLeft') {
        return (
          currentSeries * categoryCount + ((currentCategory - 1 + categoryCount) % categoryCount)
        );
      }

      if (key === 'ArrowRight') {
        return currentSeries * categoryCount + ((currentCategory + 1) % categoryCount);
      }

      if (key === 'ArrowUp') {
        return ((currentSeries - 1 + seriesCount) % seriesCount) * categoryCount + currentCategory;
      }

      if (key === 'ArrowDown') {
        return ((currentSeries + 1) % seriesCount) * categoryCount + currentCategory;
      }

      return Math.min(currentIndex, itemCount - 1);
    },
    onDismiss: () => {
      setHoveredIndex(null);
      setMousePos(null);
    }
  });
  const rawLeftExtent = useMemo(
    () => getSeriesExtent(leftSeries, referenceValues),
    [leftSeries, referenceValues]
  );
  const leftExtent = useMemo(
    () => ({
      min: typeof yAxis?.min === 'number' ? yAxis.min : rawLeftExtent.min,
      max: typeof yAxis?.max === 'number' ? yAxis.max : rawLeftExtent.max
    }),
    [rawLeftExtent.max, rawLeftExtent.min, yAxis?.max, yAxis?.min]
  );
  const rawRightExtent = useMemo(
    () => getSeriesExtent(rightSeries.length ? rightSeries : leftSeries),
    [leftSeries, rightSeries]
  );
  const rightExtent = useMemo(
    () => ({
      min: typeof secondaryYAxis?.min === 'number' ? secondaryYAxis.min : rawRightExtent.min,
      max: typeof secondaryYAxis?.max === 'number' ? secondaryYAxis.max : rawRightExtent.max
    }),
    [rawRightExtent.max, rawRightExtent.min, secondaryYAxis?.max, secondaryYAxis?.min]
  );
  const leftTicks = useMemo(
    () =>
      resolveTickEntries(
        yAxis,
        leftExtent.min,
        leftExtent.max,
        grid?.count ?? chartTokens.chart.gridLineCount
      ),
    [grid?.count, leftExtent.max, leftExtent.min, yAxis]
  );
  const rightTicks = useMemo(
    () =>
      resolveTickEntries(
        secondaryYAxis,
        rightExtent.min,
        rightExtent.max,
        grid?.count ?? chartTokens.chart.gridLineCount
      ),
    [grid?.count, rightExtent.max, rightExtent.min, secondaryYAxis]
  );
  const lineLegendItems = useMemo(() => buildLegendItemsFromLineSeries(series), [series]);
  const legendItems = useMemo(
    () => (showLegend ? [...lineLegendItems, ...buildReferenceLegend(referenceLines)] : []),
    [lineLegendItems, referenceLines, showLegend]
  );
  const categoryWidth = resolvedPlotWidth / Math.max(categories.length, 1);
  const referenceLayers = useMemo<ReactNode[]>(
    () =>
      referenceLines.map((line, index) => {
        const y = createInvertedScale(leftExtent.min, leftExtent.max, plotHeight)(line.value);
        return (
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
      }),
    [leftExtent.max, leftExtent.min, plotHeight, referenceLines, resolvedPlotWidth]
  );
  const lineRenderData = useMemo(
    () =>
      series.map((item) => {
        const extent = item.axis === 'right' ? rightExtent : leftExtent;
        const limit = getDownsampleLimit(downsample, 'LineChart');
        const indexedData = item.data.map((value, index) => ({ x: index, y: value }));
        const renderedData =
          limit && item.data.length > limit ? downsampleLttb(indexedData, limit) : indexedData;
        const points = buildLinePointsAtIndices(
          renderedData.map((point) => point.y),
          renderedData.map((point) => point.x),
          categories.length,
          resolvedPlotWidth,
          plotHeight,
          extent.min,
          extent.max,
          chartTokens.chart.lineXInset
        );
        const stroke = item.stroke ?? chartTokens.categorical.secondary;
        const baseline =
          chartTokens.chart.lineXInset +
          createInvertedScale(
            extent.min,
            extent.max,
            plotHeight - chartTokens.chart.lineXInset * 2
          )(Math.max(extent.min, 0));
        const gradientId = `${gradientBaseId}-line-area-${item.key}`;

        return {
          item,
          points,
          extent,
          stroke,
          gradientId,
          linePath: describeLinePath(points),
          areaPath: describeAreaPath(points, baseline)
        };
      }),
    [
      categories.length,
      downsample,
      gradientBaseId,
      leftExtent,
      plotHeight,
      resolvedPlotWidth,
      rightExtent,
      series
    ]
  );
  const gradientLayers = useMemo<ReactNode[]>(
    () =>
      lineRenderData
        .filter(({ item }) => item.showAreaFill)
        .map(({ item, stroke, gradientId }) => (
          <linearGradient key={`gradient-${item.key}`} id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
            <stop offset="52%" stopColor={stroke} stopOpacity="0.08" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        )),
    [lineRenderData]
  );
  const lineLayers = useMemo<ReactNode[]>(() => {
    const layers: ReactNode[] = [];

    lineRenderData.forEach(({ item, points, stroke, gradientId, linePath, areaPath }) => {
      if (item.showAreaFill) {
        layers.push(
          <path key={`area-${item.key}`} d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        );
      }

      layers.push(
        <path
          key={`path-${item.key}`}
          d={linePath}
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
          layers.push(
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
          layers.push(
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

    return layers;
  }, [lineRenderData]);

  const hoverCardHeight = useMemo(
    () => getEstimatedHoverCardHeight(series.length),
    [series.length]
  );
  const activeKeyboardItem =
    keyboardNav.focusedIndex !== null ? keyboardItems[keyboardNav.focusedIndex] : null;
  const activeIndex = activeKeyboardItem?.categoryIndex ?? hoveredIndex;
  const showKeyboardFeedback = keyboardNav.focusedIndex !== null;
  const showInteractionFeedback = showHoverCard || showKeyboardFeedback;
  const hoverCardPosition = useMemo(() => {
    if (mousePos) {
      return getViewportHoverCardPosition(mousePos.x, mousePos.y, 196, hoverCardHeight);
    }

    if (!activeKeyboardItem || !plotRef.current) {
      return null;
    }

    const renderItem = lineRenderData[activeKeyboardItem.seriesIndex];
    const value = series[activeKeyboardItem.seriesIndex]?.data[activeKeyboardItem.categoryIndex];

    if (!renderItem || !Number.isFinite(value)) {
      return null;
    }

    const point = buildLinePointAtIndex(
      value,
      activeKeyboardItem.categoryIndex,
      categories.length,
      resolvedPlotWidth,
      plotHeight,
      renderItem.extent.min,
      renderItem.extent.max,
      chartTokens.chart.lineXInset
    );
    const rect = plotRef.current.getBoundingClientRect();
    return getViewportHoverCardPosition(
      rect.left + point.x,
      rect.top + point.y,
      196,
      hoverCardHeight
    );
  }, [
    activeKeyboardItem,
    categories.length,
    hoverCardHeight,
    lineRenderData,
    mousePos,
    plotHeight,
    resolvedPlotWidth,
    series
  ]);
  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoveredIndex(
        getHoverIndex(event.clientX - rect.left, resolvedPlotWidth, categories.length)
      );
      setMousePos({ x: event.clientX, y: event.clientY });
    },
    [categories.length, resolvedPlotWidth]
  );
  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setMousePos(null);
  }, []);
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
                ref={plotRef}
                style={{ position: 'relative', width: resolvedPlotWidth, height: plotHeight }}
                onMouseMove={showHoverCard ? handleMouseMove : undefined}
                onMouseLeave={showHoverCard ? handleMouseLeave : undefined}
              >
                <svg
                  width={resolvedPlotWidth}
                  height={plotHeight}
                  viewBox={`0 0 ${resolvedPlotWidth} ${plotHeight}`}
                  {...chartA11yProps}
                  onKeyDown={keyboardNav.handlers.onKeyDown}
                  onFocus={keyboardNav.handlers.onFocus}
                  onBlur={keyboardNav.handlers.onBlur}
                  style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
                >
                  <ChartSvgA11y
                    titleId={a11yTitleId}
                    descriptionId={a11yDescriptionId}
                    label={a11yContent.label}
                    description={a11yContent.description}
                  />
                  {gradientLayers.length ? <defs>{gradientLayers}</defs> : null}
                  {showInteractionFeedback && activeIndex !== null ? (
                    <>
                      <rect
                        x={activeIndex * categoryWidth}
                        y={0}
                        width={categoryWidth}
                        height={plotHeight}
                        fill={chartTokens.neutral.surfaceTint}
                        opacity={0.45}
                      />
                      <line
                        x1={activeIndex * categoryWidth + categoryWidth / 2}
                        y1={0}
                        x2={activeIndex * categoryWidth + categoryWidth / 2}
                        y2={plotHeight}
                        stroke={chartTokens.neutral.stoneLight}
                        strokeWidth={1}
                        strokeDasharray="4 3"
                      />
                    </>
                  ) : null}
                  {referenceLayers}
                  {lineLayers}
                  {showInteractionFeedback && activeIndex !== null
                    ? lineRenderData.map(({ item, extent, stroke }) => {
                        const value = item.data[activeIndex];

                        if (!Number.isFinite(value)) {
                          return null;
                        }

                        const point = buildLinePointAtIndex(
                          value,
                          activeIndex,
                          categories.length,
                          resolvedPlotWidth,
                          plotHeight,
                          extent.min,
                          extent.max,
                          chartTokens.chart.lineXInset
                        );

                        return (
                          <circle
                            key={`hover-point-${item.key}-${activeIndex}`}
                            cx={point.x}
                            cy={point.y}
                            r={getDotRadius(item.dotSize) + 2}
                            fill={chartTokens.neutral.white}
                            stroke={stroke}
                            strokeWidth={2}
                          />
                        );
                      })
                    : null}
                </svg>
                <ChartLiveRegion announcement={keyboardNav.announcement} />
                {showInteractionFeedback && activeIndex !== null ? (
                  <ChartHoverCard
                    title={categories[activeIndex]}
                    rows={series.map((item, index) => ({
                      label: item.label,
                      value: formatTooltipValue(item.data[activeIndex] ?? 0),
                      color: item.stroke ?? chartTokens.categorical.secondary,
                      strokeColor: item.stroke ?? chartTokens.categorical.secondary,
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
});
