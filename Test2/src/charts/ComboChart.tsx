import { chartTokens } from '../theme/tokens';
import type {
  AxisConfig,
  BarSeries,
  ChartAction,
  LegendItem,
  LineSeriesConfig,
  SelectOption
} from '../types';
import { formatNumberCompact, getTickValues, getValueExtent } from '../utils/chart';
import { getSeriesColor } from '../utils/color';
import { ChartCard } from '../components/ChartCard';
import { ChartHeader } from '../components/ChartHeader';
import { XAxis, YAxis } from '../primitives/Axis';
import { BarMark } from '../primitives/BarMark';
import { GridLines } from '../primitives/GridLines';
import { LineSeries } from '../primitives/LineSeries';

export interface ComboChartProps {
  title?: string;
  categories: string[];
  barSeries: BarSeries[];
  lineSeries: LineSeriesConfig[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showSecondaryYAxis?: boolean;
  yAxis?: AxisConfig;
  secondaryYAxis?: AxisConfig;
  selectOptions?: SelectOption[];
  selectedValue?: string;
  actions?: ChartAction[];
  primaryActionLabel?: string;
  showMenu?: boolean;
}

function buildLegendItems(
  barSeries: BarSeries[],
  lineSeries: LineSeriesConfig[]
): LegendItem[] {
  const barItems = barSeries.map((item, index) => {
    const fallback = getSeriesColor(index);
    return {
      label: item.label,
      color: item.fill ?? fallback.fill,
      strokeColor: item.stroke ?? fallback.stroke,
      marker: item.fillStyle === 'texture' ? 'solid-texture' : 'solid'
    } satisfies LegendItem;
  });

  const lineItems = lineSeries.map((item) => ({
    label: item.label,
    color: item.stroke ?? chartTokens.categorical.secondary,
    strokeColor: item.stroke ?? chartTokens.categorical.secondary,
    marker:
      item.marker ??
      (item.showDots === false
        ? item.lineStyle === 'dashed'
          ? 'line-dashed'
          : 'line'
        : item.lineStyle === 'dashed'
          ? 'dot-line-dashed'
          : 'dot-line')
  }));

  return [...barItems, ...lineItems];
}

export function ComboChart({
  title = 'Title',
  categories,
  barSeries,
  lineSeries,
  width = 502,
  plotWidth = 414,
  plotHeight = chartTokens.chart.plotHeight,
  showCardBackground = true,
  showHeader = true,
  showLegend = true,
  showSecondaryYAxis = true,
  yAxis,
  secondaryYAxis,
  selectOptions,
  selectedValue,
  actions,
  primaryActionLabel,
  showMenu
}: ComboChartProps) {
  const legendItems = showLegend ? buildLegendItems(barSeries, lineSeries) : [];
  const leftExtent = getValueExtent(barSeries.map((item) => item.data));
  const rightLines = lineSeries.filter((item) => item.axis !== 'left');
  const leftLines = lineSeries.filter((item) => item.axis === 'left');
  const rightExtent = getValueExtent(
    rightLines.length ? rightLines.map((item) => item.data) : [lineSeries[0]?.data ?? [0]]
  );
  const leftTicks = (yAxis?.ticks ??
    getTickValues(leftExtent.min, leftExtent.max, 3)).map((tick) =>
    typeof tick === 'number' ? formatNumberCompact(Math.round(tick)) : tick
  );
  const rightTicks = (
    secondaryYAxis?.ticks ?? getTickValues(rightExtent.min, rightExtent.max, 3)
  ).map((tick) =>
    typeof tick === 'number' ? formatNumberCompact(Math.round(tick)) : tick
  );
  const categoryWidth = plotWidth / Math.max(categories.length, 1);
  const usableCategoryWidth =
    categoryWidth * (1 - chartTokens.chart.barCategoryGapRatio);

  return (
    <ChartCard width={width} surface={showCardBackground ? 'card' : 'plain'}>
      {showHeader ? (
        <ChartHeader
          title={title}
          legendItems={legendItems}
          selectOptions={selectOptions}
          selectedValue={selectedValue}
          actions={actions}
          primaryActionLabel={primaryActionLabel}
          showMenu={showMenu}
        />
      ) : null}
      <div className="cl-cartesian-chart">
        <YAxis
          title={yAxis?.title ?? 'Header'}
          ticks={leftTicks}
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
              <GridLines width={plotWidth} height={plotHeight} />
              {categories.map((category, categoryIndex) =>
                barSeries.map((item, seriesIndex) => {
                  const fallback = getSeriesColor(seriesIndex);
                  const x =
                    categoryIndex * categoryWidth +
                    (categoryWidth - usableCategoryWidth) / 2 +
                    seriesIndex *
                      ((usableCategoryWidth -
                        chartTokens.chart.barGapPx * Math.max(barSeries.length - 1, 0)) /
                        Math.max(barSeries.length, 1) +
                        chartTokens.chart.barGapPx);
                  const widthForBar = Math.max(
                    (usableCategoryWidth -
                      chartTokens.chart.barGapPx * Math.max(barSeries.length - 1, 0)) /
                      Math.max(barSeries.length, 1),
                    8
                  );

                  return (
                    <div
                      key={`${item.key}-${category}`}
                      style={{
                        position: 'absolute',
                        left: x,
                        top: 0
                      }}
                    >
                      <BarMark
                        value={item.data[categoryIndex] ?? 0}
                        minValue={leftExtent.min}
                        maxValue={leftExtent.max}
                        width={widthForBar}
                        height={plotHeight}
                        fill={item.fill ?? fallback.fill}
                        stroke={item.stroke ?? fallback.stroke}
                        fillStyle={item.fillStyle}
                        showLabel={false}
                      />
                    </div>
                  );
                })
              )}
              {leftLines.map((item) => (
                <LineSeries
                  key={item.key}
                  values={item.data}
                  width={plotWidth}
                  height={plotHeight}
                  minValue={leftExtent.min}
                  maxValue={leftExtent.max}
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  lineStyle={item.lineStyle}
                  dotSize={item.dotSize}
                  dotOutline={item.dotOutline}
                  showDots={item.showDots}
                  showAreaFill={item.showAreaFill}
                  showLabels={item.showLabels}
                  labelPosition={item.labelPosition}
                />
              ))}
              {rightLines.map((item) => (
                <LineSeries
                  key={item.key}
                  values={item.data}
                  width={plotWidth}
                  height={plotHeight}
                  minValue={rightExtent.min}
                  maxValue={rightExtent.max}
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  lineStyle={item.lineStyle}
                  dotSize={item.dotSize}
                  dotOutline={item.dotOutline}
                  showDots={item.showDots}
                  showAreaFill={item.showAreaFill}
                  showLabels={item.showLabels}
                  labelPosition={item.labelPosition}
                />
              ))}
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
            title={secondaryYAxis?.title ?? 'Header'}
            ticks={rightTicks}
            hideMarkers={secondaryYAxis?.hideMarkers}
          />
        ) : null}
      </div>
    </ChartCard>
  );
}
