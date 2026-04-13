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
  GridConfigV3,
  LegendPositionV3,
  LineSeriesConfigV3,
  ReferenceLineV3,
  V3HeaderProps
} from '../types';
import {
  buildLegendItemsFromLineSeries,
  buildLinePoints,
  buildReferenceLegend,
  createInvertedScale,
  describeAreaPath,
  describeLinePath,
  getDotRadius,
  getValueExtent,
  resolveTickEntries
} from '../utils';

export interface LineChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  categories: string[];
  series: LineSeriesConfigV3[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
  legendPosition?: LegendPositionV3;
  yAxis?: AxisConfigV3;
  secondaryYAxis?: AxisConfigV3;
  showSecondaryYAxis?: boolean;
  grid?: GridConfigV3;
  referenceLines?: ReferenceLineV3[];
}

function getSeriesExtent(series: LineSeriesConfigV3[]) {
  const values = series.flatMap((item) => item.data);
  return getValueExtent(values.length ? values : [0]);
}

export function LineChartV3({
  title = 'Line Chart',
  description,
  categories,
  series,
  width = 502,
  plotWidth = 414,
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
  ...headerProps
}: LineChartV3Props) {
  const leftSeries = series.filter((item) => item.axis !== 'right');
  const rightSeries = series.filter((item) => item.axis === 'right');
  const leftExtent = getSeriesExtent(leftSeries);
  const rightExtent = getSeriesExtent(rightSeries.length ? rightSeries : leftSeries);
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
  const legendItems = showLegend
    ? [
        ...buildLegendItemsFromLineSeries(series),
        ...buildReferenceLegend(referenceLines)
      ]
    : [];
  const referenceLayers: ReactNode[] = [];
  const lineLayers: ReactNode[] = [];

  referenceLines.forEach((line, index) => {
    const y = createInvertedScale(leftExtent.min, leftExtent.max, plotHeight)(line.value);
    referenceLayers.push(
      <Fragment key={`reference-${index}`}>
        <line
          x1="0"
          y1={y}
          x2={plotWidth}
          y2={y}
          stroke={line.color ?? chartTokens.text.subtle}
          strokeWidth="1.5"
          strokeDasharray={line.lineStyle === 'dashed' ? '5 4' : undefined}
        />
        {line.label ? (
          <text
            x={plotWidth - 4}
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
      plotWidth,
      plotHeight,
      extent.min,
      extent.max,
      12
    );
    const path = describeLinePath(points);
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
                {referenceLayers}
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
