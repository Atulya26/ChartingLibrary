import { chartTokens } from '../theme/tokens';
import type {
  AxisConfig,
  BarSeries,
  ChartAction,
  LegendItem,
  SelectOption
} from '../types';
import { formatNumberCompact, getTickValues, getValueExtent } from '../utils/chart';
import { getSeriesColor } from '../utils/color';
import { ChartCard } from '../components/ChartCard';
import { ChartHeader } from '../components/ChartHeader';
import { XAxis, YAxis } from '../primitives/Axis';
import { BarMark } from '../primitives/BarMark';
import { GridLines } from '../primitives/GridLines';

export interface BarChartProps {
  title?: string;
  categories: string[];
  series: BarSeries[];
  layout?: 'grouped' | 'stacked';
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  yAxis?: AxisConfig;
  selectOptions?: SelectOption[];
  selectedValue?: string;
  actions?: ChartAction[];
  primaryActionLabel?: string;
  showMenu?: boolean;
}

function buildLegendItems(series: BarSeries[]): LegendItem[] {
  return series.map((item, index) => {
    const fallback = getSeriesColor(index);
    return {
      label: item.label,
      color: item.fill ?? fallback.fill,
      strokeColor: item.stroke ?? fallback.stroke,
      marker: item.fillStyle === 'texture' ? 'solid-texture' : 'solid',
      active: item.active
    } satisfies LegendItem;
  });
}

export function BarChart({
  title = 'Bar Chart',
  categories,
  series,
  layout = 'grouped',
  width = 502,
  plotWidth = 414,
  plotHeight = chartTokens.chart.plotHeight,
  showCardBackground = true,
  showHeader = true,
  showLegend = true,
  yAxis,
  selectOptions,
  selectedValue,
  actions,
  primaryActionLabel,
  showMenu
}: BarChartProps) {
  const legendItems = showLegend ? buildLegendItems(series) : [];
  const valuesForExtent =
    layout === 'stacked'
      ? [
          categories.map((_, categoryIndex) =>
            series.reduce((sum, currentSeries) => sum + (currentSeries.data[categoryIndex] ?? 0), 0)
          )
        ]
      : series.map((item) => item.data);
  const extent = getValueExtent(valuesForExtent);
  const ticks = (
    yAxis?.ticks ?? getTickValues(extent.min, extent.max, 3)
  ).map((tick) =>
    typeof tick === 'number' ? formatNumberCompact(Math.round(tick)) : tick
  );
  const categoryWidth = plotWidth / Math.max(categories.length, 1);
  const usableCategoryWidth =
    categoryWidth * (1 - chartTokens.chart.barCategoryGapRatio);
  const barGap = chartTokens.chart.barGapPx;
  const valueRange = extent.max - extent.min || 1;
  const scaleY = (value: number) => ((extent.max - value) / valueRange) * plotHeight;
  const barWidth =
    layout === 'stacked'
      ? usableCategoryWidth
      : Math.max(
          (usableCategoryWidth - barGap * Math.max(series.length - 1, 0)) /
            Math.max(series.length, 1),
          8
        );

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
          title={yAxis?.title}
          ticks={ticks}
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
              {categories.map((category, categoryIndex) => {
                const slotX = categoryIndex * categoryWidth;
                const startX = slotX + (categoryWidth - usableCategoryWidth) / 2;

                if (layout === 'stacked') {
                  let positiveTotal = 0;
                  let negativeTotal = 0;

                  return series.map((item, seriesIndex) => {
                    const fallback = getSeriesColor(seriesIndex);
                    const rawValue = item.data[categoryIndex] ?? 0;
                    const startValue = rawValue >= 0 ? positiveTotal : negativeTotal;
                    const endValue = startValue + rawValue;
                    const topValue = Math.max(startValue, endValue);
                    const bottomValue = Math.min(startValue, endValue);
                    const top = scaleY(topValue);
                    const height = Math.max(scaleY(bottomValue) - top, 1);

                    if (rawValue >= 0) {
                      positiveTotal = endValue;
                    } else {
                      negativeTotal = endValue;
                    }

                    return (
                      <div
                        key={`${item.key}-${category}`}
                        style={{
                          position: 'absolute',
                          left: startX + 1,
                          top,
                          width: Math.max(barWidth - 2, 4),
                          height,
                          background:
                            item.fillStyle === 'texture'
                              ? `repeating-linear-gradient(135deg, ${item.fill ?? fallback.fill}, ${item.fill ?? fallback.fill} 4px, rgba(255, 255, 255, 0) 4px, rgba(255, 255, 255, 0) 8px)`
                              : item.fill ?? fallback.fill,
                          border: `1px solid ${item.stroke ?? fallback.stroke}`,
                          borderRadius:
                            rawValue >= 0
                              ? `${chartTokens.radii.card}px ${chartTokens.radii.card}px 0 0`
                              : `0 0 ${chartTokens.radii.card}px ${chartTokens.radii.card}px`
                        }}
                      />
                    );
                  });
                }

                return series.map((item, seriesIndex) => {
                  const fallback = getSeriesColor(seriesIndex);
                  const x = startX + seriesIndex * (barWidth + barGap);
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
                        minValue={extent.min}
                        maxValue={extent.max}
                        width={barWidth}
                        height={plotHeight}
                        fill={item.fill ?? fallback.fill}
                        stroke={item.stroke ?? fallback.stroke}
                        fillStyle={item.fillStyle}
                        showLabel={false}
                      />
                    </div>
                  );
                });
              })}
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
    </ChartCard>
  );
}
