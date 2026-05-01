import { Fragment, memo, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../primitives/Axis';
import { GridLines } from '../primitives/GridLines';
import { chartTokens } from '../theme/tokens';
import { formatNumberCompact } from '../utils/chart';
import { getAccessibleTextColor, withAlpha } from '../utils/color';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type {
  AxisConfig,
  BarSeries,
  DistributionSegment,
  FillStyleMode,
  GridConfig,
  LegendPosition,
  LegendMarkerMode,
  ChartAccessibilityProps,
  ChartHeaderProps
} from '../types';
import {
  buildLegendItemsFromBarSeriesWithOverrides,
  createLinearScale,
  createInvertedScale,
  describeBarPath,
  describeHorizontalBarPath,
  formatTooltipValue,
  getGroupedExtent,
  getEstimatedHoverCardHeight,
  getHoverIndex,
  getStackedExtent,
  getSvgFillDefinition,
  getViewportHoverCardPosition,
  resolveBarDatum,
  resolveFillLegendMarker,
  resolveResponsivePlotWidth,
  resolveTickEntries
} from '../chartUtils';
import {
  ChartLiveRegion,
  ChartSvgA11y,
  ChartRoleA11yContent,
  describeCategoricalChart,
  describeSegmentChart,
  getChartA11yContent,
  getChartA11yProps
} from '../utils/a11y';
import { useChartKeyboardNav } from '../utils/useChartKeyboardNav';

export interface BarChartProps extends ChartHeaderProps, ChartAccessibilityProps {
  title?: string;
  description?: string;
  categories?: string[];
  series?: BarSeries[];
  layout?: 'grouped' | 'stacked';
  mode?: 'vertical' | 'horizontal' | 'distribution';
  distributionSegments?: DistributionSegment[];
  showScale?: boolean;
  barHeight?: number;
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  legendPosition?: LegendPosition;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  showLegend?: boolean;
  groupGapRatio?: number;
  barGap?: number;
  barCornerRadius?: number;
  showSegmentLabels?: boolean;
  showTotalLabels?: boolean;
  fillStyle?: FillStyleMode;
  legendMarker?: LegendMarkerMode;
  showHoverCard?: boolean;
}

function renderValueLabel(
  x: number,
  y: number,
  value: number,
  color: string,
  anchor: 'start' | 'middle' | 'end' = 'middle'
) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily={chartTokens.fontFamily}
      fontSize="12"
      fontWeight="600"
      fill={color}
    >
      {formatNumberCompact(value)}
    </text>
  );
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

export const BarChart = memo(function BarChart({
  title = 'Bar Chart',
  description,
  categories = [],
  series = [],
  layout = 'grouped',
  mode = 'vertical',
  distributionSegments,
  showScale = false,
  barHeight = 24,
  width = 502,
  plotWidth,
  plotHeight = chartTokens.chart.plotHeight,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  legendPosition = 'top',
  yAxis,
  grid,
  showLegend = true,
  groupGapRatio = chartTokens.chart.barCategoryGapRatio,
  barGap = chartTokens.chart.barGapPx,
  barCornerRadius = chartTokens.radii.bar,
  showSegmentLabels = false,
  showTotalLabels = false,
  fillStyle = 'inherit',
  legendMarker = 'auto',
  showHoverCard = false,
  ariaLabel,
  ariaDescription,
  enableKeyboardNavigation = false,
  ...headerProps
}: BarChartProps) {
  const svgId = useId().replace(/:/g, '');
  const a11yTitleId = `${svgId}-title`;
  const a11yDescriptionId = `${svgId}-description`;
  const stackedSegmentGap = layout === 'stacked' ? 3 : 0;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredDistributionIndex, setHoveredDistributionIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const distributionRef = useRef<HTMLDivElement>(null);
  const horizontalFrameRef = useRef<HTMLDivElement>(null);
  const verticalPlotRef = useRef<HTMLDivElement>(null);
  const resolvedPlotWidth = useMemo(
    () =>
      resolveResponsivePlotWidth(
        width,
        plotWidth,
        mode === 'vertical' ? 414 : 454,
        mode === 'vertical' ? 88 : 48
      ),
    [mode, plotWidth, width]
  );
  const resolvedDistributionSegments = useMemo(
    () =>
      distributionSegments?.length
        ? distributionSegments
        : (series[0]?.data.map((datum, index) => {
            const resolved = resolveBarDatum(datum, series[0], index, fillStyle);

            return {
              label: categories[index] ?? series[0].label,
              value: resolved.value,
              fill: resolved.fill
            };
          }) ?? []),
    [categories, distributionSegments, fillStyle, series]
  );
  const legendItems = useMemo(
    () =>
      showLegend ? buildLegendItemsFromBarSeriesWithOverrides(series, fillStyle, legendMarker) : [],
    [fillStyle, legendMarker, series, showLegend]
  );
  const extent = useMemo(
    () =>
      layout === 'stacked' ? getStackedExtent(series, categories.length) : getGroupedExtent(series),
    [categories.length, layout, series]
  );
  const tickEntries = useMemo(
    () =>
      resolveTickEntries(
        yAxis,
        extent.min,
        extent.max,
        grid?.count ?? chartTokens.chart.gridLineCount
      ),
    [extent.max, extent.min, grid?.count, yAxis]
  );
  const a11yContent = useMemo(
    () =>
      getChartA11yContent({
        title,
        description,
        ariaLabel,
        ariaDescription,
        fallbackDescription:
          mode === 'distribution'
            ? describeSegmentChart({
                chartType: 'Distribution bar chart',
                segments: resolvedDistributionSegments
              })
            : describeCategoricalChart({
                chartType: layout === 'stacked' ? 'Stacked bar chart' : 'Grouped bar chart',
                categories,
                series: series.map((item) => ({
                  label: item.label,
                  values: item.data.map((datum) =>
                    typeof datum === 'number' ? datum : datum.value
                  )
                }))
              })
      }),
    [
      ariaDescription,
      ariaLabel,
      categories,
      description,
      layout,
      mode,
      resolvedDistributionSegments,
      series,
      title
    ]
  );
  const chartA11yProps = getChartA11yProps({
    titleId: a11yTitleId,
    descriptionId: a11yDescriptionId,
    enableKeyboardNavigation
  });
  const keyboardItems = useMemo(
    () =>
      mode === 'distribution'
        ? resolvedDistributionSegments.map((segment) => ({
            label: segment.label,
            value: segment.value
          }))
        : categories.map((category, categoryIndex) => ({
            label: category,
            value: series.reduce(
              (sum, item, seriesIndex) =>
                sum +
                resolveBarDatum(item.data[categoryIndex] ?? 0, item, seriesIndex, fillStyle).value,
              0
            )
          })),
    [categories, fillStyle, mode, resolvedDistributionSegments, series]
  );
  const keyboardNav = useChartKeyboardNav({
    items: keyboardItems,
    enabled: enableKeyboardNavigation,
    getAnnouncement: (item, index) =>
      `${index + 1} of ${keyboardItems.length}: ${item.label}, ${formatTooltipValue(item.value)}.`,
    onDismiss: () => {
      setHoveredIndex(null);
      setHoveredDistributionIndex(null);
      setMousePos(null);
    }
  });
  const activeDistributionIndex =
    mode === 'distribution'
      ? (keyboardNav.focusedIndex ?? hoveredDistributionIndex)
      : hoveredDistributionIndex;
  const activeBarIndex =
    mode !== 'distribution' ? (keyboardNav.focusedIndex ?? hoveredIndex) : hoveredIndex;

  /* ---------- Distribution band mode ---------- */
  if (mode === 'distribution' && resolvedDistributionSegments.length) {
    const total = resolvedDistributionSegments.reduce((sum, seg) => sum + seg.value, 0);
    const distributionLegendItems = resolvedDistributionSegments.map((seg, i) => ({
      label: seg.label,
      marker: 'solid' as const,
      color:
        seg.fill ??
        chartTokens.categorical.axisPalette[i % chartTokens.categorical.axisPalette.length].fill,
      active: true
    }));
    const hoveredSegment =
      activeDistributionIndex !== null
        ? resolvedDistributionSegments[activeDistributionIndex]
        : null;
    const hoveredDistributionCardHeight = getEstimatedHoverCardHeight(1, true);
    const hoveredDistributionPosition = mousePos
      ? getViewportHoverCardPosition(mousePos.x, mousePos.y, 196, hoveredDistributionCardHeight)
      : activeDistributionIndex !== null && distributionRef.current
        ? getViewportHoverCardPosition(
            distributionRef.current.getBoundingClientRect().left +
              (activeDistributionIndex + 0.5) *
                (resolvedPlotWidth / Math.max(resolvedDistributionSegments.length, 1)),
            distributionRef.current.getBoundingClientRect().top + barHeight / 2,
            196,
            hoveredDistributionCardHeight
          )
        : null;

    return (
      <ChartShell
        width={width}
        showCardBackground={showCardBackground}
        showHeader={showHeader}
        showTitle={showTitle}
        title={title}
        description={description}
        legendItems={showLegend ? distributionLegendItems : []}
        legendPosition={legendPosition}
        {...headerProps}
      >
        {/* Chart inspection uses one focus target with role=img; arrow-key behavior is opt-in. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          ref={distributionRef}
          role="img"
          aria-labelledby={a11yTitleId}
          aria-describedby={a11yDescriptionId}
          {...(enableKeyboardNavigation ? { tabIndex: 0 } : {})}
          onKeyDown={keyboardNav.handlers.onKeyDown}
          onFocus={keyboardNav.handlers.onFocus}
          onBlur={keyboardNav.handlers.onBlur}
          style={{ padding: '4px 0', position: 'relative', width: resolvedPlotWidth }}
        >
          <ChartRoleA11yContent
            labelId={a11yTitleId}
            descriptionId={a11yDescriptionId}
            label={a11yContent.label}
            description={a11yContent.description}
          />
          <div
            style={{
              display: 'flex',
              gap: 3,
              height: barHeight,
              width: resolvedPlotWidth,
              background: 'transparent'
            }}
            onMouseLeave={
              showHoverCard
                ? () => {
                    setHoveredDistributionIndex(null);
                    setMousePos(null);
                  }
                : undefined
            }
          >
            {resolvedDistributionSegments.map((seg, i) => {
              const percent = total > 0 ? seg.value / total : 0;
              const color =
                seg.fill ??
                chartTokens.categorical.axisPalette[i % chartTokens.categorical.axisPalette.length]
                  .fill;
              const stroke = 'stroke' in seg ? seg.stroke : undefined;
              return (
                <div
                  key={i}
                  onMouseMove={
                    showHoverCard
                      ? (event: React.MouseEvent) => {
                          setHoveredDistributionIndex(i);
                          setMousePos({ x: event.clientX, y: event.clientY });
                        }
                      : undefined
                  }
                  style={{
                    flex: `${seg.value} 1 0`,
                    minWidth: 0,
                    height: '100%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: chartTokens.radii.bar,
                    boxShadow: `inset 0 0 0 1px ${stroke ?? withAlpha(chartTokens.neutral.white, 0.35)}`,
                    opacity:
                      activeDistributionIndex === null || activeDistributionIndex === i ? 1 : 0.78
                  }}
                >
                  {percent > 0.08 && (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: getAccessibleTextColor(color),
                        fontFamily: chartTokens.fontFamily
                      }}
                    >
                      {`${Math.round(percent * 100)}%`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {showScale && (
            <div
              style={{
                position: 'relative',
                marginTop: '6px',
                width: resolvedPlotWidth,
                height: 18
              }}
            >
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
                <span
                  key={`tickmark-${tick}`}
                  style={{
                    position: 'absolute',
                    left: `${tick * 100}%`,
                    top: 0,
                    width: 1,
                    height: 4,
                    background: chartTokens.neutral.stoneLight,
                    transform: 'translateX(-0.5px)'
                  }}
                />
              ))}
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
                <span
                  key={`ticklabel-${tick}`}
                  style={{
                    position: 'absolute',
                    left: `${tick * 100}%`,
                    top: 6,
                    fontSize: '11px',
                    color: chartTokens.text.subtle,
                    fontFamily: chartTokens.fontFamily,
                    transform:
                      tick === 0
                        ? 'translateX(0)'
                        : tick === 1
                          ? 'translateX(-100%)'
                          : 'translateX(-50%)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {`${Math.round(tick * 100)}%`}
                </span>
              ))}
            </div>
          )}
          <ChartLiveRegion announcement={keyboardNav.announcement} />
          {showHoverCard && hoveredSegment ? (
            <ChartHoverCard
              title={hoveredSegment.label}
              rows={[
                {
                  label: 'Share of patients',
                  value: `${Math.round((hoveredSegment.value / Math.max(total, 1)) * 100)}%`,
                  color:
                    hoveredSegment.fill ??
                    chartTokens.categorical.axisPalette[activeDistributionIndex ?? 0].fill,
                  marker: 'solid'
                }
              ]}
              totalLabel="Band total"
              totalValue={formatTooltipValue(hoveredSegment.value)}
              left={hoveredDistributionPosition?.left ?? 12}
              top={hoveredDistributionPosition?.top ?? 12}
            />
          ) : null}
        </div>
      </ChartShell>
    );
  }

  if (mode === 'horizontal') {
    const labelWidth = Math.min(
      Math.max(chartTokens.chart.horizontalCategoryLabelWidth, resolvedPlotWidth * 0.22),
      Math.max(resolvedPlotWidth - 180, 88)
    );
    const horizontalPlotWidth = Math.max(resolvedPlotWidth - labelWidth, 160);
    const horizontalFrameHeight = plotHeight + chartTokens.chart.xAxisHeight;
    const categoryHeight = plotHeight / Math.max(categories.length, 1);
    const usableCategoryHeight = categoryHeight * (1 - groupGapRatio);
    const groupedBarHeight =
      layout === 'stacked'
        ? Math.min(22, Math.max(usableCategoryHeight, 8))
        : Math.min(
            18,
            Math.max(
              (usableCategoryHeight - barGap * Math.max(series.length - 1, 0)) /
                Math.max(series.length, 1),
              8
            )
          );
    const scaleX = createLinearScale(extent.min, extent.max, horizontalPlotWidth);
    const zeroX = scaleX(0);
    const defs: ReactNode[] = [];
    const bars: ReactNode[] = [];
    const valueLabels: ReactNode[] = [];

    categories.forEach((category, categoryIndex) => {
      const slotY = categoryIndex * categoryHeight;
      const groupY = slotY + (categoryHeight - usableCategoryHeight) / 2;

      if (layout === 'stacked') {
        let positiveTotal = 0;
        let negativeTotal = 0;
        let totalLabelX: number | null = null;
        let totalLabelY: number | null = null;
        let totalLabelValue = 0;

        series.forEach((item, seriesIndex) => {
          const resolved = resolveBarDatum(
            item.data[categoryIndex] ?? 0,
            item,
            seriesIndex,
            fillStyle
          );
          const startValue = resolved.value >= 0 ? positiveTotal : negativeTotal;
          const endValue = startValue + resolved.value;
          const startX = scaleX(startValue);
          const endX = scaleX(endValue);
          const x = Math.min(startX, endX);
          const width = Math.max(Math.abs(endX - startX), 1);
          const y = groupY + (usableCategoryHeight - groupedBarHeight) / 2;
          const earlierSeries = series.slice(0, seriesIndex);
          const hasEarlierPositive = earlierSeries.some(
            (seriesItem, offset) =>
              resolveBarDatum(seriesItem.data[categoryIndex] ?? 0, seriesItem, offset, fillStyle)
                .value > 0
          );
          const hasEarlierNegative = earlierSeries.some(
            (seriesItem, offset) =>
              resolveBarDatum(seriesItem.data[categoryIndex] ?? 0, seriesItem, offset, fillStyle)
                .value < 0
          );
          const laterSeries = series.slice(seriesIndex + 1);
          const hasLaterPositive = laterSeries.some(
            (seriesItem, offset) =>
              resolveBarDatum(
                seriesItem.data[categoryIndex] ?? 0,
                seriesItem,
                seriesIndex + offset + 1,
                fillStyle
              ).value > 0
          );
          const hasLaterNegative = laterSeries.some(
            (seriesItem, offset) =>
              resolveBarDatum(
                seriesItem.data[categoryIndex] ?? 0,
                seriesItem,
                seriesIndex + offset + 1,
                fillStyle
              ).value < 0
          );
          const paintId = `bar-h-${svgId}-${categoryIndex}-${seriesIndex}`;
          const paint = getSvgFillDefinition(
            paintId,
            resolved.fillStyle,
            resolved.fill,
            resolved.stroke
          );

          if (paint.definition) {
            defs.push(paint.definition);
          }

          const leftGapInset =
            resolved.value >= 0
              ? hasEarlierPositive
                ? stackedSegmentGap / 2
                : 0
              : hasLaterNegative
                ? stackedSegmentGap / 2
                : 0;
          const rightGapInset =
            resolved.value >= 0
              ? hasLaterPositive
                ? stackedSegmentGap / 2
                : 0
              : hasEarlierNegative
                ? stackedSegmentGap / 2
                : 0;
          const renderedX = x + leftGapInset;
          const renderedWidth = Math.max(width - leftGapInset - rightGapInset, 1);

          bars.push(
            <path
              key={`h-${item.key}-${category}`}
              d={describeRoundedRectPath(
                renderedX,
                y,
                renderedWidth,
                groupedBarHeight,
                barCornerRadius
              )}
              fill={paint.fill}
              stroke={resolved.stroke}
              strokeWidth={1}
              opacity={resolved.active === false ? 0.4 : 1}
            />
          );

          if ((showSegmentLabels || resolved.showLabel) && width > 34) {
            valueLabels.push(
              <text
                key={`h-label-${item.key}-${category}`}
                x={resolved.value >= 0 ? renderedX + renderedWidth - 7 : renderedX + 7}
                y={y + groupedBarHeight / 2}
                textAnchor={resolved.value >= 0 ? 'end' : 'start'}
                dominantBaseline="middle"
                fontFamily={chartTokens.fontFamily}
                fontSize="12"
                fontWeight="600"
                fill={
                  resolved.fill === chartTokens.neutral.surfaceTint
                    ? chartTokens.text.default
                    : getAccessibleTextColor(resolved.fill)
                }
              >
                {formatNumberCompact(resolved.value)}
              </text>
            );
          }

          if (resolved.value >= 0) {
            positiveTotal = endValue;
            totalLabelX = endX;
            totalLabelY = y + groupedBarHeight / 2;
            totalLabelValue = endValue;
          } else {
            negativeTotal = endValue;
          }
        });

        if (
          showTotalLabels &&
          totalLabelX !== null &&
          totalLabelY !== null &&
          totalLabelValue > 0
        ) {
          valueLabels.push(
            <text
              key={`h-total-${category}`}
              x={Math.min(totalLabelX + 6, horizontalPlotWidth - 2)}
              y={totalLabelY}
              textAnchor={totalLabelX + 42 > horizontalPlotWidth ? 'end' : 'start'}
              dominantBaseline="middle"
              fontFamily={chartTokens.fontFamily}
              fontSize="12"
              fontWeight="600"
              fill={chartTokens.text.default}
            >
              {formatNumberCompact(totalLabelValue)}
            </text>
          );
        }

        return;
      }

      series.forEach((item, seriesIndex) => {
        const resolved = resolveBarDatum(
          item.data[categoryIndex] ?? 0,
          item,
          seriesIndex,
          fillStyle
        );
        const valueX = scaleX(resolved.value);
        const x = Math.min(zeroX, valueX);
        const width = Math.max(Math.abs(valueX - zeroX), 1);
        const y =
          groupY +
          (usableCategoryHeight -
            (groupedBarHeight * series.length + barGap * Math.max(series.length - 1, 0))) /
            2 +
          seriesIndex * (groupedBarHeight + barGap);
        const paintId = `bar-h-${svgId}-${categoryIndex}-${seriesIndex}`;
        const paint = getSvgFillDefinition(
          paintId,
          resolved.fillStyle,
          resolved.fill,
          resolved.stroke
        );

        if (paint.definition) {
          defs.push(paint.definition);
        }

        bars.push(
          <path
            key={`h-${item.key}-${category}`}
            d={describeHorizontalBarPath(
              x,
              y,
              width,
              groupedBarHeight,
              barCornerRadius,
              resolved.value >= 0 ? 'positive' : 'negative'
            )}
            fill={paint.fill}
            stroke={resolved.stroke}
            strokeWidth={1}
            opacity={resolved.active === false ? 0.4 : 1}
          />
        );
      });
    });

    const hoveredRows =
      activeBarIndex !== null
        ? series.map((item, index) => {
            const resolved = resolveBarDatum(
              item.data[activeBarIndex] ?? 0,
              item,
              index,
              fillStyle
            );

            return {
              label: item.label,
              value: formatTooltipValue(resolved.value),
              color: resolved.fill,
              strokeColor: resolved.stroke,
              marker: resolveFillLegendMarker(resolved.fillStyle, legendMarker)
            };
          })
        : [];
    const hoveredStackTotal =
      activeBarIndex !== null && layout === 'stacked'
        ? series.reduce(
            (sum, item, index) =>
              sum + resolveBarDatum(item.data[activeBarIndex] ?? 0, item, index, fillStyle).value,
            0
          )
        : undefined;
    const hoverCardPosition =
      activeBarIndex !== null
        ? mousePos
          ? getViewportHoverCardPosition(
              mousePos.x,
              mousePos.y,
              196,
              getEstimatedHoverCardHeight(hoveredRows.length, typeof hoveredStackTotal === 'number')
            )
          : keyboardNav.focusedIndex !== null && horizontalFrameRef.current
            ? getViewportHoverCardPosition(
                horizontalFrameRef.current.getBoundingClientRect().left +
                  labelWidth +
                  horizontalPlotWidth / 2,
                horizontalFrameRef.current.getBoundingClientRect().top +
                  activeBarIndex * categoryHeight +
                  categoryHeight / 2,
                196,
                getEstimatedHoverCardHeight(
                  hoveredRows.length,
                  typeof hoveredStackTotal === 'number'
                )
              )
            : null
        : null;

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
        <div className="cl-horizontal-bar-chart" style={{ width: resolvedPlotWidth }}>
          <div
            ref={horizontalFrameRef}
            className="cl-horizontal-bar-chart__frame"
            style={{ width: resolvedPlotWidth, height: horizontalFrameHeight }}
            onMouseMove={
              showHoverCard
                ? (event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setHoveredIndex(
                      getHoverIndex(event.clientY - rect.top, plotHeight, categories.length)
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
            <div
              className="cl-horizontal-bar-chart__labels"
              style={{ width: labelWidth, height: plotHeight }}
            >
              {categories.map((category) => (
                <span
                  key={category}
                  className="cl-horizontal-bar-chart__label"
                  style={{ height: categoryHeight }}
                  title={category}
                >
                  {category}
                </span>
              ))}
            </div>
            <svg
              width={resolvedPlotWidth}
              height={horizontalFrameHeight}
              viewBox={`0 0 ${resolvedPlotWidth} ${horizontalFrameHeight}`}
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
              <g transform={`translate(${labelWidth} 0)`}>
                {(grid?.show ?? true)
                  ? tickEntries.map((entry, index) => {
                      const x = scaleX(entry.value);
                      return (
                        <line
                          key={`h-grid-${index}`}
                          x1={x}
                          y1={0}
                          x2={x}
                          y2={plotHeight}
                          stroke={grid?.color ?? chartTokens.neutral.stoneLight}
                          strokeWidth="1"
                        />
                      );
                    })
                  : null}
                {showHoverCard && activeBarIndex !== null ? (
                  <rect
                    x={0}
                    y={activeBarIndex * categoryHeight}
                    width={horizontalPlotWidth}
                    height={categoryHeight}
                    fill={chartTokens.neutral.surfaceTint}
                    opacity={0.38}
                  />
                ) : null}
                <line
                  x1={zeroX}
                  y1={0}
                  x2={zeroX}
                  y2={plotHeight}
                  stroke={chartTokens.neutral.stoneLight}
                  strokeWidth="1"
                />
                {bars}
                {valueLabels}
              </g>
            </svg>
            <div
              className="cl-horizontal-bar-chart__axis"
              style={{
                left: labelWidth,
                width: horizontalPlotWidth,
                top: plotHeight,
                height: chartTokens.chart.xAxisHeight
              }}
            >
              {tickEntries.map((entry, index) => {
                const left = (scaleX(entry.value) / horizontalPlotWidth) * 100;
                return (
                  <span
                    key={`h-tick-${entry.label}-${index}`}
                    className="cl-horizontal-bar-chart__tick"
                    style={{
                      left: `${left}%`,
                      transform:
                        index === 0
                          ? 'translateX(0)'
                          : index === tickEntries.length - 1
                            ? 'translateX(-100%)'
                            : 'translateX(-50%)'
                    }}
                  >
                    {entry.label}
                  </span>
                );
              })}
            </div>
            <ChartLiveRegion announcement={keyboardNav.announcement} />
            {showHoverCard && activeBarIndex !== null ? (
              <ChartHoverCard
                title={categories[activeBarIndex]}
                rows={hoveredRows}
                totalLabel={layout === 'stacked' ? 'Bar total' : undefined}
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
      </ChartShell>
    );
  }

  const categoryWidth = resolvedPlotWidth / Math.max(categories.length, 1);
  const usableCategoryWidth = categoryWidth * (1 - groupGapRatio);
  const groupedBarWidth =
    layout === 'stacked'
      ? usableCategoryWidth
      : Math.max(
          (usableCategoryWidth - barGap * Math.max(series.length - 1, 0)) /
            Math.max(series.length, 1),
          8
        );
  const scaleY = createInvertedScale(extent.min, extent.max, plotHeight);
  const zeroY = scaleY(0);
  const defs: ReactNode[] = [];
  const marks: ReactNode[] = [];
  const labels: ReactNode[] = [];

  categories.forEach((category, categoryIndex) => {
    const slotX = categoryIndex * categoryWidth;
    const startX = slotX + (categoryWidth - usableCategoryWidth) / 2;

    if (layout === 'stacked') {
      let positiveTotal = 0;
      let negativeTotal = 0;
      let topLabelY: number | null = null;
      let topLabelValue = 0;

      series.forEach((item, seriesIndex) => {
        const resolved = resolveBarDatum(
          item.data[categoryIndex] ?? 0,
          item,
          seriesIndex,
          fillStyle
        );
        const startValue = resolved.value >= 0 ? positiveTotal : negativeTotal;
        const endValue = startValue + resolved.value;
        const topValue = Math.max(startValue, endValue);
        const bottomValue = Math.min(startValue, endValue);
        const y = scaleY(topValue);
        const height = Math.max(scaleY(bottomValue) - y, 1);
        const earlierSeries = series.slice(0, seriesIndex);
        const hasEarlierPositive = earlierSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(seriesItem.data[categoryIndex] ?? 0, seriesItem, offset, fillStyle)
              .value > 0
        );
        const hasEarlierNegative = earlierSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(seriesItem.data[categoryIndex] ?? 0, seriesItem, offset, fillStyle)
              .value < 0
        );
        const laterSeries = series.slice(seriesIndex + 1);
        const hasLaterPositive = laterSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(
              seriesItem.data[categoryIndex] ?? 0,
              seriesItem,
              seriesIndex + offset + 1,
              fillStyle
            ).value > 0
        );
        const hasLaterNegative = laterSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(
              seriesItem.data[categoryIndex] ?? 0,
              seriesItem,
              seriesIndex + offset + 1,
              fillStyle
            ).value < 0
        );
        const paintId = `bar-${svgId}-${categoryIndex}-${seriesIndex}`;
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

        marks.push(
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

        if ((showSegmentLabels || resolved.showLabel) && height > 24) {
          labels.push(
            <Fragment key={`segment-${item.key}-${category}`}>
              {renderValueLabel(
                startX + usableCategoryWidth / 2,
                resolved.value >= 0 ? renderedY + 14 : renderedY + renderedHeight - 8,
                resolved.value,
                resolved.fill === chartTokens.neutral.surfaceTint
                  ? chartTokens.text.default
                  : getAccessibleTextColor(resolved.fill)
              )}
            </Fragment>
          );
        }

        if (resolved.value >= 0) {
          positiveTotal = endValue;
          topLabelY = y;
          topLabelValue = endValue;
        } else {
          negativeTotal = endValue;
        }
      });

      if (showTotalLabels && topLabelY !== null && topLabelValue > 0) {
        labels.push(
          <Fragment key={`total-${category}`}>
            {renderValueLabel(
              startX + usableCategoryWidth / 2,
              topLabelY - 6,
              topLabelValue,
              chartTokens.text.default
            )}
          </Fragment>
        );
      }

      return;
    }

    series.forEach((item, seriesIndex) => {
      const resolved = resolveBarDatum(item.data[categoryIndex] ?? 0, item, seriesIndex, fillStyle);
      const x = startX + seriesIndex * (groupedBarWidth + barGap);
      const valueY = scaleY(resolved.value);
      const y = resolved.value >= 0 ? valueY : zeroY;
      const height = Math.max(Math.abs(zeroY - valueY), 1);
      const paintId = `bar-${svgId}-${categoryIndex}-${seriesIndex}`;
      const paint = getSvgFillDefinition(
        paintId,
        resolved.fillStyle,
        resolved.fill,
        resolved.stroke
      );

      if (paint.definition) {
        defs.push(paint.definition);
      }

      marks.push(
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
          opacity={resolved.active === false ? 0.4 : 1}
        />
      );
    });
  });

  const hoveredRows =
    activeBarIndex !== null
      ? series.map((item, index) => {
          const resolved = resolveBarDatum(item.data[activeBarIndex] ?? 0, item, index, fillStyle);

          return {
            label: item.label,
            value: formatTooltipValue(resolved.value),
            color: resolved.fill,
            strokeColor: resolved.stroke,
            marker: resolveFillLegendMarker(resolved.fillStyle, legendMarker)
          };
        })
      : [];
  const hoveredStackTotal =
    activeBarIndex !== null && layout === 'stacked'
      ? series.reduce(
          (sum, item, index) =>
            sum + resolveBarDatum(item.data[activeBarIndex] ?? 0, item, index, fillStyle).value,
          0
        )
      : undefined;
  const hoverCardPosition =
    activeBarIndex !== null
      ? mousePos
        ? getViewportHoverCardPosition(
            mousePos.x,
            mousePos.y,
            196,
            getEstimatedHoverCardHeight(hoveredRows.length, typeof hoveredStackTotal === 'number')
          )
        : keyboardNav.focusedIndex !== null && verticalPlotRef.current
          ? getViewportHoverCardPosition(
              verticalPlotRef.current.getBoundingClientRect().left +
                activeBarIndex * categoryWidth +
                categoryWidth / 2,
              verticalPlotRef.current.getBoundingClientRect().top + plotHeight / 2,
              196,
              getEstimatedHoverCardHeight(hoveredRows.length, typeof hoveredStackTotal === 'number')
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
                ref={verticalPlotRef}
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
                  {showHoverCard && activeBarIndex !== null ? (
                    <rect
                      x={activeBarIndex * categoryWidth}
                      y={0}
                      width={categoryWidth}
                      height={plotHeight}
                      fill={chartTokens.neutral.surfaceTint}
                      opacity={0.4}
                    />
                  ) : null}
                  <line
                    x1="0"
                    y1={zeroY}
                    x2={resolvedPlotWidth}
                    y2={zeroY}
                    stroke={chartTokens.neutral.stoneLight}
                    strokeWidth="1"
                  />
                  {marks}
                  {labels}
                </svg>
                <ChartLiveRegion announcement={keyboardNav.announcement} />
                {showHoverCard && activeBarIndex !== null ? (
                  <ChartHoverCard
                    title={categories[activeBarIndex]}
                    rows={hoveredRows}
                    totalLabel={layout === 'stacked' ? 'Total' : undefined}
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
      </div>
    </ChartShell>
  );
});
