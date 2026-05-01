import { memo, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../primitives/Axis';
import { GridLines } from '../primitives/GridLines';
import { chartTokens } from '../theme/tokens';
import { formatNumberCompact } from '../utils/chart';
import { getAccessibleSeriesTextColor, withAlpha } from '../utils/color';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type {
  AxisConfig,
  BarSeries,
  FillStyleMode,
  GridConfig,
  LegendPosition,
  LegendMarkerMode,
  LineSeriesConfig,
  ChartAccessibilityProps,
  ChartHeaderProps
} from '../types';
import {
  buildLegendItemsFromBarSeriesWithOverrides,
  buildLegendItemsFromLineSeries,
  buildLinePoints,
  createInvertedScale,
  describeAreaPath,
  describeBarPath,
  describeLinePath,
  formatTooltipValue,
  getDotRadius,
  getEstimatedHoverCardHeight,
  getGroupedExtent,
  getHoverIndex,
  getViewportHoverCardPosition,
  getStackedExtent,
  getSvgFillDefinition,
  getValueExtent,
  resolveBarDatum,
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

export interface ComboChartProps extends ChartHeaderProps, ChartAccessibilityProps {
  title?: string;
  description?: string;
  categories: string[];
  barSeries: BarSeries[];
  lineSeries: LineSeriesConfig[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
  legendPosition?: LegendPosition;
  showSecondaryYAxis?: boolean;
  showOverlayLine?: boolean;
  yAxis?: AxisConfig;
  secondaryYAxis?: AxisConfig;
  grid?: GridConfig;
  barLayout?: 'grouped' | 'stacked';
  barGap?: number;
  categoryGapRatio?: number;
  barCornerRadius?: number;
  barFillStyle?: FillStyleMode;
  barLegendMarker?: LegendMarkerMode;
  showHoverCard?: boolean;
}

function getLineExtent(series: LineSeriesConfig[]) {
  return getValueExtent(series.flatMap((item) => item.data));
}

function describeRoundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.max(0, Math.min(radius, Math.abs(width) / 2, height / 2));
  const x2 = x + width;
  const y2 = y + height;

  if (safeRadius === 0) {
    return `M ${x} ${y} H ${x2} V ${y2} H ${x} Z`;
  }

  return [
    `M ${x + safeRadius} ${y}`,
    `H ${x2 - safeRadius}`,
    `Q ${x2} ${y} ${x2} ${y + safeRadius}`,
    `V ${y2 - safeRadius}`,
    `Q ${x2} ${y2} ${x2 - safeRadius} ${y2}`,
    `H ${x + safeRadius}`,
    `Q ${x} ${y2} ${x} ${y2 - safeRadius}`,
    `V ${y + safeRadius}`,
    `Q ${x} ${y} ${x + safeRadius} ${y}`,
    'Z'
  ].join(' ');
}

export const ComboChart = memo(function ComboChart({
  title = 'Title',
  description,
  categories,
  barSeries,
  lineSeries,
  width = 502,
  plotWidth,
  plotHeight = chartTokens.chart.plotHeight,
  showCardBackground = true,
  showHeader = true,
  showLegend = true,
  showTitle = true,
  legendPosition = 'top',
  showSecondaryYAxis = true,
  showOverlayLine = true,
  yAxis,
  secondaryYAxis,
  grid,
  barLayout = 'grouped',
  barGap = chartTokens.chart.barGapPx,
  categoryGapRatio = chartTokens.chart.barCategoryGapRatio,
  barCornerRadius = chartTokens.radii.bar,
  barFillStyle = 'inherit',
  barLegendMarker = 'auto',
  showHoverCard = false,
  ariaLabel,
  ariaDescription,
  enableKeyboardNavigation = false,
  ...headerProps
}: ComboChartProps) {
  const a11yId = useId().replace(/:/g, '');
  const a11yTitleId = `${a11yId}-title`;
  const a11yDescriptionId = `${a11yId}-description`;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const resolvedPlotWidth = useMemo(
    () => resolveResponsivePlotWidth(width, plotWidth, 414, 88),
    [plotWidth, width]
  );
  const barLegendItems = useMemo(
    () => buildLegendItemsFromBarSeriesWithOverrides(barSeries, barFillStyle, barLegendMarker),
    [barFillStyle, barLegendMarker, barSeries]
  );
  const lineLegendItems = useMemo(() => buildLegendItemsFromLineSeries(lineSeries), [lineSeries]);
  const legendItems = useMemo(
    () =>
      showLegend
        ? [
            ...barLegendItems,
            ...lineLegendItems.map((item) => ({
              ...item,
              active: showOverlayLine ? item.active : false
            }))
          ]
        : [],
    [barLegendItems, lineLegendItems, showLegend, showOverlayLine]
  );
  const a11yContent = useMemo(
    () =>
      getChartA11yContent({
        title,
        description,
        ariaLabel,
        ariaDescription,
        fallbackDescription: describeCategoricalChart({
          chartType: barLayout === 'stacked' ? 'Stacked combination chart' : 'Combination chart',
          categories,
          series: [
            ...barSeries.map((item) => ({
              label: item.label,
              values: item.data.map((datum) => (typeof datum === 'number' ? datum : datum.value))
            })),
            ...lineSeries.map((item) => ({
              label: item.label,
              values: item.data
            }))
          ]
        })
      }),
    [ariaDescription, ariaLabel, barLayout, barSeries, categories, description, lineSeries, title]
  );
  const chartA11yProps = getChartA11yProps({
    titleId: a11yTitleId,
    descriptionId: a11yDescriptionId,
    enableKeyboardNavigation
  });
  const keyboardItems = useMemo(() => {
    const barItems = barSeries.map((item) => ({
      label: item.label,
      type: 'bar' as const,
      values: item.data.map((datum) => (typeof datum === 'number' ? datum : datum.value))
    }));
    const lineItems = lineSeries.map((item) => ({
      label: item.label,
      type: 'line' as const,
      values: item.data
    }));

    return [...barItems, ...lineItems].flatMap((item, seriesIndex) =>
      categories.map((category, categoryIndex) => ({
        category,
        categoryIndex,
        seriesIndex,
        seriesLabel: item.label,
        type: item.type,
        value: item.values[categoryIndex] ?? 0
      }))
    );
  }, [barSeries, categories, lineSeries]);
  const keyboardNav = useChartKeyboardNav({
    items: keyboardItems,
    enabled: enableKeyboardNavigation,
    getAnnouncement: (item, index) =>
      `${index + 1} of ${keyboardItems.length}: ${item.seriesLabel}, ${item.category}, ${formatTooltipValue(item.value)}.`,
    getNextIndex: (currentIndex, key, itemCount) => {
      const categoryCount = Math.max(categories.length, 1);
      const seriesCount = Math.max(Math.ceil(itemCount / categoryCount), 1);
      const currentSeries = Math.floor(currentIndex / categoryCount);
      const currentCategory = currentIndex % categoryCount;

      if (key === 'Home') return currentSeries * categoryCount;
      if (key === 'End') return currentSeries * categoryCount + categoryCount - 1;
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
  const leftExtent = useMemo(
    () =>
      barLayout === 'stacked'
        ? getStackedExtent(barSeries, categories.length)
        : getGroupedExtent(barSeries),
    [barLayout, barSeries, categories.length]
  );
  const rightLines = useMemo(
    () => lineSeries.filter((item) => item.axis === 'right'),
    [lineSeries]
  );
  const rightExtent = useMemo(
    () => (rightLines.length ? getLineExtent(rightLines) : getLineExtent(lineSeries)),
    [lineSeries, rightLines]
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
  const categoryWidth = resolvedPlotWidth / Math.max(categories.length, 1);
  const usableCategoryWidth = categoryWidth * (1 - categoryGapRatio);
  const groupedBarWidth =
    barLayout === 'stacked'
      ? usableCategoryWidth
      : Math.max(
          (usableCategoryWidth - barGap * Math.max(barSeries.length - 1, 0)) /
            Math.max(barSeries.length, 1),
          8
        );
  const scaleLeft = createInvertedScale(leftExtent.min, leftExtent.max, plotHeight);
  const zeroY = scaleLeft(0);
  const lineRenderData = useMemo(
    () =>
      showOverlayLine
        ? lineSeries.map((item) => {
            const extent = item.axis === 'right' ? rightExtent : leftExtent;
            const points = buildLinePoints(
              item.data,
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

            return {
              item,
              points,
              stroke,
              areaPath: describeAreaPath(points, baseline),
              linePath: describeLinePath(points)
            };
          })
        : [],
    [leftExtent, lineSeries, plotHeight, resolvedPlotWidth, rightExtent, showOverlayLine]
  );
  const stackedSegmentGap = barLayout === 'stacked' ? 3 : 0;
  const defs: ReactNode[] = [];
  const barLayers: ReactNode[] = [];
  const lineLayers: ReactNode[] = [];

  categories.forEach((category, categoryIndex) => {
    const slotX = categoryIndex * categoryWidth;
    const startX = slotX + (categoryWidth - usableCategoryWidth) / 2;

    if (barLayout === 'stacked') {
      let positiveTotal = 0;
      let negativeTotal = 0;

      barSeries.forEach((item, seriesIndex) => {
        const resolved = resolveBarDatum(
          item.data[categoryIndex] ?? 0,
          item,
          seriesIndex,
          barFillStyle
        );
        const startValue = resolved.value >= 0 ? positiveTotal : negativeTotal;
        const endValue = startValue + resolved.value;
        const topValue = Math.max(startValue, endValue);
        const bottomValue = Math.min(startValue, endValue);
        const y = scaleLeft(topValue);
        const height = Math.max(scaleLeft(bottomValue) - y, 1);
        const earlierSeries = barSeries.slice(0, seriesIndex);
        const laterSeries = barSeries.slice(seriesIndex + 1);
        const hasEarlierPositive = earlierSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(seriesItem.data[categoryIndex] ?? 0, seriesItem, offset, barFillStyle)
              .value > 0
        );
        const hasLaterPositive = laterSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(
              seriesItem.data[categoryIndex] ?? 0,
              seriesItem,
              seriesIndex + offset + 1,
              barFillStyle
            ).value > 0
        );
        const hasEarlierNegative = earlierSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(seriesItem.data[categoryIndex] ?? 0, seriesItem, offset, barFillStyle)
              .value < 0
        );
        const hasLaterNegative = laterSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(
              seriesItem.data[categoryIndex] ?? 0,
              seriesItem,
              seriesIndex + offset + 1,
              barFillStyle
            ).value < 0
        );
        const paintId = `combo-${categoryIndex}-${seriesIndex}`;
        const paint = getSvgFillDefinition(
          paintId,
          resolved.fillStyle,
          resolved.fill,
          resolved.stroke
        );

        if (paint.definition) {
          defs.push(paint.definition);
        }

        const topGapInset =
          resolved.value >= 0
            ? hasLaterPositive
              ? stackedSegmentGap / 2
              : 0
            : hasEarlierNegative
              ? stackedSegmentGap / 2
              : 0;
        const bottomGapInset =
          resolved.value >= 0
            ? hasEarlierPositive
              ? stackedSegmentGap / 2
              : 0
            : hasLaterNegative
              ? stackedSegmentGap / 2
              : 0;
        const renderedY = y + topGapInset;
        const renderedHeight = Math.max(height - topGapInset - bottomGapInset, 1);

        barLayers.push(
          <path
            key={`${item.key}-${category}`}
            d={describeRoundedRectPath(
              startX + 1,
              renderedY,
              Math.max(usableCategoryWidth - 2, 4),
              renderedHeight,
              barCornerRadius
            )}
            fill={paint.fill}
            stroke={resolved.stroke}
            strokeWidth={1}
            opacity={resolved.active === false ? 0.4 : 1}
          />
        );

        if (resolved.value >= 0) {
          positiveTotal = endValue;
        } else {
          negativeTotal = endValue;
        }
      });

      return;
    }

    barSeries.forEach((item, seriesIndex) => {
      const resolved = resolveBarDatum(
        item.data[categoryIndex] ?? 0,
        item,
        seriesIndex,
        barFillStyle
      );
      const x = startX + seriesIndex * (groupedBarWidth + barGap);
      const valueY = scaleLeft(resolved.value);
      const y = resolved.value >= 0 ? valueY : zeroY;
      const height = Math.max(Math.abs(zeroY - valueY), 1);
      const paintId = `combo-${categoryIndex}-${seriesIndex}`;
      const paint = getSvgFillDefinition(
        paintId,
        resolved.fillStyle,
        resolved.fill,
        resolved.stroke
      );

      if (paint.definition) {
        defs.push(paint.definition);
      }

      barLayers.push(
        <path
          key={`${item.key}-${category}`}
          d={describeBarPath(
            x,
            y,
            groupedBarWidth,
            height,
            barCornerRadius,
            resolved.value >= 0 ? 'positive' : 'negative'
          )}
          fill={paint.fill}
          stroke={resolved.stroke}
          strokeWidth={1}
        />
      );
    });
  });

  if (showOverlayLine) {
    lineRenderData.forEach(({ item, points, stroke, areaPath, linePath }) => {
      if (item.showAreaFill) {
        lineLayers.push(
          <path
            key={`area-${item.key}`}
            d={areaPath}
            fill={withAlpha(stroke, 0.14)}
            stroke="none"
          />
        );
      }

      lineLayers.push(
        <path
          key={`line-${item.key}`}
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth={item.strokeWidth ?? 2}
          strokeDasharray={item.lineStyle === 'dashed' ? '5 4' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
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
          lineLayers.push(
            <text
              key={`label-${item.key}-${pointIndex}`}
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fontFamily={chartTokens.fontFamily}
              fontSize="12"
              fontWeight="600"
              fill={getAccessibleSeriesTextColor(item.stroke ?? chartTokens.text.default)}
            >
              {formatNumberCompact(point.value)}
            </text>
          );
        }
      });
    });
  }

  const activeKeyboardItem =
    keyboardNav.focusedIndex !== null ? keyboardItems[keyboardNav.focusedIndex] : null;
  const activeIndex = activeKeyboardItem?.categoryIndex ?? hoveredIndex;
  const showKeyboardFeedback = keyboardNav.focusedIndex !== null;
  const showInteractionFeedback = showHoverCard || showKeyboardFeedback;
  const hoveredBarRows =
    activeIndex !== null
      ? barSeries.map((item, index) => {
          const resolved = resolveBarDatum(item.data[activeIndex] ?? 0, item, index, barFillStyle);

          return {
            label: item.label,
            value: formatTooltipValue(resolved.value),
            color: resolved.fill,
            strokeColor: resolved.stroke,
            marker: barLegendItems[index]?.marker
          };
        })
      : [];
  const hoveredLineRows =
    activeIndex !== null && showOverlayLine
      ? lineSeries.map((item, index) => ({
          label: item.label,
          value: formatTooltipValue(item.data[activeIndex] ?? 0),
          color: item.stroke ?? chartTokens.categorical.secondary,
          strokeColor: item.stroke ?? chartTokens.categorical.secondary,
          marker: lineLegendItems[index]?.marker
        }))
      : [];
  const hoveredStackTotal =
    activeIndex !== null && barLayout === 'stacked'
      ? barSeries.reduce(
          (sum, item, index) =>
            sum + resolveBarDatum(item.data[activeIndex] ?? 0, item, index, barFillStyle).value,
          0
        )
      : undefined;
  const hoverCardPosition =
    activeIndex !== null
      ? mousePos
        ? getViewportHoverCardPosition(
            mousePos.x,
            mousePos.y,
            196,
            getEstimatedHoverCardHeight(
              hoveredBarRows.length + hoveredLineRows.length,
              typeof hoveredStackTotal === 'number'
            )
          )
        : activeKeyboardItem && plotRef.current
          ? getViewportHoverCardPosition(
              plotRef.current.getBoundingClientRect().left +
                activeIndex * categoryWidth +
                categoryWidth / 2,
              plotRef.current.getBoundingClientRect().top + plotHeight / 2,
              196,
              getEstimatedHoverCardHeight(
                hoveredBarRows.length + hoveredLineRows.length,
                typeof hoveredStackTotal === 'number'
              )
            )
          : null
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
                ref={plotRef}
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
                  showHoverCard
                    ? () => {
                        setHoveredIndex(null);
                        setMousePos(null);
                      }
                    : undefined
                }
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
                  <defs>{defs}</defs>
                  {showInteractionFeedback && activeIndex !== null ? (
                    <>
                      <rect
                        x={activeIndex * categoryWidth}
                        y={0}
                        width={categoryWidth}
                        height={plotHeight}
                        fill={chartTokens.neutral.surfaceTint}
                        opacity={0.38}
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
                  <line
                    x1="0"
                    y1={zeroY}
                    x2={resolvedPlotWidth}
                    y2={zeroY}
                    stroke={chartTokens.neutral.stoneLight}
                    strokeWidth="1"
                  />
                  {barLayers}
                  {lineLayers}
                  {showInteractionFeedback && activeIndex !== null && showOverlayLine
                    ? lineRenderData.map(({ item, points, stroke }) => {
                        const point = points[activeIndex];

                        if (!point) {
                          return null;
                        }

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
                    rows={[...hoveredBarRows, ...hoveredLineRows]}
                    totalLabel={barLayout === 'stacked' ? 'Bar total' : undefined}
                    totalValue={
                      typeof hoveredStackTotal === 'number'
                        ? formatTooltipValue(hoveredStackTotal)
                        : undefined
                    }
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
