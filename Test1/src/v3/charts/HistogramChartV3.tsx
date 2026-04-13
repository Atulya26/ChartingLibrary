import { Fragment, useId } from 'react';
import type { ReactNode } from 'react';

import { XAxis, YAxis } from '../../primitives/Axis';
import { GridLines } from '../../primitives/GridLines';
import { chartTokens } from '../../theme/tokens';
import { formatNumberCompact } from '../../utils/chart';
import { withAlpha } from '../../utils/color';
import { ChartShellV3 } from '../components/ChartShellV3';
import type {
  AxisConfigV3,
  FillStyleModeV3,
  GridConfigV3,
  HistogramBinV3,
  LegendMarkerModeV3,
  LegendPositionV3,
  V3HeaderProps
} from '../types';
import {
  buildLinePoints,
  createInvertedScale,
  describeAreaPath,
  describeLinePath,
  getDotRadius,
  getSvgFillDefinition,
  getValueExtent,
  resolveFillLegendMarker,
  resolveHistogramBin,
  resolveTickEntries
} from '../utils';

export interface HistogramChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  bins: HistogramBinV3[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  yAxis?: AxisConfigV3;
  grid?: GridConfigV3;
  showTopLabels?: boolean;
  overlayLine?: boolean;
  overlayDots?: boolean;
  overlayAreaFill?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPositionV3;
  fillStyle?: FillStyleModeV3;
  legendMarker?: LegendMarkerModeV3;
  overlayLegendLabel?: string;
}

export function HistogramChartV3({
  title = 'Histogram',
  description,
  bins,
  width = 502,
  plotWidth = 414,
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
  ...headerProps
}: HistogramChartV3Props) {
  const svgId = useId().replace(/:/g, '');
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
  const barWidth = plotWidth / Math.max(resolvedBins.length, 1);
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
    const paintId = `histogram-v3-${svgId}-${index}`;
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
      <rect
        key={bin.label}
        x={index * barWidth}
        y={valueY}
        width={Math.max(barWidth, 1)}
        height={height}
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
          fill="#242424"
        >
          {formatNumberCompact(bin.value)}
        </text>
      );
    }
  });

  const overlayPoints = buildLinePoints(
    resolvedBins.map((bin) => bin.value),
    plotWidth - barWidth,
    plotHeight,
    extent.min,
    extent.max
  ).map((point, index) => ({
    ...point,
    x: point.x + barWidth / 2
  }));

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
                            fill={chartTokens.categorical.secondary}
                          />
                        ))
                      : null}
                  </Fragment>
                ) : null}
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
              <XAxis labels={resolvedBins.map((bin) => bin.label)} />
            </div>
          </div>
        </div>
      </div>
    </ChartShellV3>
  );
}
