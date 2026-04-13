import { Fragment } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../../primitives/Axis';
import { GridLines } from '../../primitives/GridLines';
import { chartTokens } from '../../theme/tokens';
import { formatNumberCompact } from '../../utils/chart';
import { withAlpha } from '../../utils/color';
import { ChartShellV3 } from '../components/ChartShellV3';
import type {
  AxisConfigV3,
  BarSeriesV3,
  FillStyleModeV3,
  GridConfigV3,
  LegendPositionV3,
  LegendMarkerModeV3,
  LineSeriesConfigV3,
  V3HeaderProps
} from '../types';
import {
  buildLegendItemsFromBarSeriesWithOverrides,
  buildLegendItemsFromLineSeries,
  buildLinePoints,
  createInvertedScale,
  describeAreaPath,
  describeBarPath,
  describeLinePath,
  getDotRadius,
  getGroupedExtent,
  getStackedExtent,
  getSvgFillDefinition,
  getValueExtent,
  resolveBarDatum,
  resolveTickEntries
} from '../utils';

export interface ComboChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  categories: string[];
  barSeries: BarSeriesV3[];
  lineSeries: LineSeriesConfigV3[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
  legendPosition?: LegendPositionV3;
  showSecondaryYAxis?: boolean;
  showOverlayLine?: boolean;
  yAxis?: AxisConfigV3;
  secondaryYAxis?: AxisConfigV3;
  grid?: GridConfigV3;
  barLayout?: 'grouped' | 'stacked';
  barGap?: number;
  categoryGapRatio?: number;
  barCornerRadius?: number;
  barFillStyle?: FillStyleModeV3;
  barLegendMarker?: LegendMarkerModeV3;
}

function getLineExtent(series: LineSeriesConfigV3[]) {
  return getValueExtent(series.flatMap((item) => item.data));
}

export function ComboChartV3({
  title = 'Title',
  description,
  categories,
  barSeries,
  lineSeries,
  width = 502,
  plotWidth = 414,
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
  ...headerProps
}: ComboChartV3Props) {
  const legendItems = showLegend
    ? [
        ...buildLegendItemsFromBarSeriesWithOverrides(
          barSeries,
          barFillStyle,
          barLegendMarker
        ),
        ...buildLegendItemsFromLineSeries(lineSeries).map((item) => ({
          ...item,
          active: showOverlayLine ? item.active : false
        }))
      ]
    : [];
  const leftExtent =
    barLayout === 'stacked'
      ? getStackedExtent(barSeries, categories.length)
      : getGroupedExtent(barSeries);
  const rightLines = lineSeries.filter((item) => item.axis === 'right');
  const rightExtent = rightLines.length ? getLineExtent(rightLines) : getLineExtent(lineSeries);
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
  const categoryWidth = plotWidth / Math.max(categories.length, 1);
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
  const scaleRight = createInvertedScale(rightExtent.min, rightExtent.max, plotHeight);
  const zeroY = scaleLeft(0);
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
        const laterSeries = barSeries.slice(seriesIndex + 1);
        const hasLaterPositive = laterSeries.some(
          (seriesItem, offset) =>
            resolveBarDatum(
              seriesItem.data[categoryIndex] ?? 0,
              seriesItem,
              seriesIndex + offset + 1,
              barFillStyle
            ).value > 0
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
        const paintId = `combo-v3-${categoryIndex}-${seriesIndex}`;
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
              startX + 1,
              y,
              Math.max(usableCategoryWidth - 2, 4),
              height,
              resolved.value >= 0
                ? hasLaterPositive
                  ? 0
                  : barCornerRadius
                : hasLaterNegative
                  ? 0
                  : barCornerRadius,
              resolved.value >= 0 ? 'positive' : 'negative'
            )}
            fill={paint.fill}
            stroke={resolved.stroke}
            strokeWidth={1}
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
      const paintId = `combo-v3-${categoryIndex}-${seriesIndex}`;
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
    lineSeries.forEach((item) => {
      const extent = item.axis === 'right' ? rightExtent : leftExtent;
      const points = buildLinePoints(
        item.data,
        plotWidth,
        plotHeight,
        extent.min,
        extent.max,
        12
      );
      const stroke = item.stroke ?? chartTokens.categorical.secondary;
      const baseline =
        12 +
        createInvertedScale(extent.min, extent.max, plotHeight - 24)(
          Math.max(extent.min, 0)
        );

      if (item.showAreaFill) {
        lineLayers.push(
          <path
            key={`area-${item.key}`}
            d={describeAreaPath(points, baseline)}
            fill={withAlpha(stroke, 0.14)}
            stroke="none"
          />
        );
      }

      lineLayers.push(
        <path
          key={`line-${item.key}`}
          d={describeLinePath(points)}
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
              fill={item.dotOutline ? '#ffffff' : stroke}
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
              fill={chartTokens.text.inverse}
            >
              {formatNumberCompact(point.value)}
            </text>
          );
        }
      });
    });
  }

  return (
    <ChartShellV3
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
        />
        <div className="cl-cartesian-chart__middle" style={{ width: plotWidth }}>
          <div className="cl-cartesian-chart__plot" style={{ width: plotWidth }}>
            <div
              style={{
                position: 'absolute',
                inset: '0 0 26px 0'
              }}
            >
              {(grid?.show ?? true) ? (
                <GridLines
                  width={plotWidth}
                  height={plotHeight}
                  count={grid?.count}
                  color={grid?.color}
                />
              ) : null}
              <svg
                width={plotWidth}
                height={plotHeight}
                viewBox={`0 0 ${plotWidth} ${plotHeight}`}
                role="img"
                aria-label={title}
                style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
              >
                <defs>{defs}</defs>
                <line
                  x1="0"
                  y1={zeroY}
                  x2={plotWidth}
                  y2={zeroY}
                  stroke={chartTokens.neutral.stoneLight}
                  strokeWidth="1"
                />
                {barLayers}
                {lineLayers}
              </svg>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 26
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
          />
        ) : null}
      </div>
    </ChartShellV3>
  );
}
