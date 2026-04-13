import { Fragment, useId } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../../primitives/Axis';
import { GridLines } from '../../primitives/GridLines';
import { chartTokens } from '../../theme/tokens';
import { formatNumberCompact } from '../../utils/chart';
import { ChartShellV3 } from '../components/ChartShellV3';
import type {
  AxisConfigV3,
  BarSeriesV3,
  FillStyleModeV3,
  GridConfigV3,
  LegendPositionV3,
  LegendMarkerModeV3,
  V3HeaderProps
} from '../types';
import {
  buildLegendItemsFromBarSeriesWithOverrides,
  createInvertedScale,
  describeBarPath,
  getGroupedExtent,
  getStackedExtent,
  getSvgFillDefinition,
  resolveBarDatum,
  resolveTickEntries
} from '../utils';

export interface BarChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  categories: string[];
  series: BarSeriesV3[];
  layout?: 'grouped' | 'stacked';
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  legendPosition?: LegendPositionV3;
  yAxis?: AxisConfigV3;
  grid?: GridConfigV3;
  showLegend?: boolean;
  groupGapRatio?: number;
  barGap?: number;
  barCornerRadius?: number;
  showSegmentLabels?: boolean;
  showTotalLabels?: boolean;
  fillStyle?: FillStyleModeV3;
  legendMarker?: LegendMarkerModeV3;
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

export function BarChartV3({
  title = 'Bar Chart',
  description,
  categories,
  series,
  layout = 'grouped',
  width = 502,
  plotWidth = 414,
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
  ...headerProps
}: BarChartV3Props) {
  const svgId = useId().replace(/:/g, '');
  const legendItems = showLegend
    ? buildLegendItemsFromBarSeriesWithOverrides(series, fillStyle, legendMarker)
    : [];
  const extent =
    layout === 'stacked'
      ? getStackedExtent(series, categories.length)
      : getGroupedExtent(series);
  const tickEntries = resolveTickEntries(
    yAxis,
    extent.min,
    extent.max,
    grid?.count ?? chartTokens.chart.gridLineCount
  );
  const categoryWidth = plotWidth / Math.max(categories.length, 1);
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
        const paintId = `v3-bar-${svgId}-${categoryIndex}-${seriesIndex}`;
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
            opacity={resolved.active === false ? 0.4 : 1}
          />
        );

        if ((showSegmentLabels || resolved.showLabel) && height > 24) {
          labels.push(
            <Fragment key={`segment-${item.key}-${category}`}>
              {renderValueLabel(
                startX + usableCategoryWidth / 2,
                resolved.value >= 0 ? y + 14 : y + height - 8,
                resolved.value,
                resolved.fill === chartTokens.neutral.surfaceTint
                  ? chartTokens.text.default
                  : chartTokens.text.inverse
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
      const resolved = resolveBarDatum(
        item.data[categoryIndex] ?? 0,
        item,
        seriesIndex,
        fillStyle
      );
      const x = startX + seriesIndex * (groupedBarWidth + barGap);
      const valueY = scaleY(resolved.value);
      const y = resolved.value >= 0 ? valueY : zeroY;
      const height = Math.max(Math.abs(zeroY - valueY), 1);
      const paintId = `v3-bar-${svgId}-${categoryIndex}-${seriesIndex}`;
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
          ticks={tickEntries.map((entry) => entry.label)}
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
                {marks}
                {labels}
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
      </div>
    </ChartShellV3>
  );
}
