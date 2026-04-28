import { useMemo } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import statesAtlas from 'us-atlas/states-10m.json';
import { feature } from 'topojson-client';

import { ChartCard } from './ChartCard';
import { chartTokens } from '../theme/tokens';
import { cx } from '../utils/cx';
import { describeArcSegment } from '../chartUtils';
import { describeSankeyRibbon } from '../sankeyLayout';
import type {
  ChartLoadingSkeletonProps,
  ChartLoadingType
} from '../types';

const statesCollection = feature(
  statesAtlas as any,
  (statesAtlas as any).objects.states
) as any;

const dimensionsByType: Record<
  ChartLoadingType,
  { width: number; plotWidth: number; plotHeight: number }
> = {
  bar: { width: 502, plotWidth: 414, plotHeight: 206 },
  combo: { width: 502, plotWidth: 414, plotHeight: 206 },
  line: { width: 502, plotWidth: 414, plotHeight: 206 },
  histogram: { width: 502, plotWidth: 414, plotHeight: 206 },
  donut: { width: 379, plotWidth: 180, plotHeight: 180 },
  'half-donut': { width: 379, plotWidth: 220, plotHeight: 150 },
  sparkline: { width: 379, plotWidth: 320, plotHeight: 96 },
  'pointer-scale': { width: 379, plotWidth: 320, plotHeight: 110 },
  'map-bubble': { width: 520, plotWidth: 472, plotHeight: 260 },
  sankey: { width: 640, plotWidth: 560, plotHeight: 320 }
};

const titlesByType: Record<ChartLoadingType, string> = {
  bar: 'Bar chart',
  combo: 'Combination chart',
  line: 'Line chart',
  donut: 'Donut chart',
  'half-donut': 'Half donut',
  histogram: 'Histogram',
  sparkline: 'Sparkline',
  'pointer-scale': 'Pointer scale',
  'map-bubble': 'Map bubble',
  sankey: 'Sankey chart'
};

function CartesianFrame({
  plotWidth,
  plotHeight,
  xLabels = 4,
  children
}: {
  plotWidth: number;
  plotHeight: number;
  xLabels?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="cl-loading-skeleton__cartesian" style={{ width: plotWidth + 42 }}>
      <div className="cl-loading-skeleton__y-axis">
        {[28, 22, 18].map((width, index) => (
          <span
            key={index}
            className="cl-loading-skeleton__shape"
            style={{ width, height: 8 }}
          />
        ))}
      </div>
      <div className="cl-loading-skeleton__cartesian-main">
        <div
          className="cl-loading-skeleton__plot"
          style={{ width: plotWidth, height: plotHeight }}
        >
          <div className="cl-loading-skeleton__grid">
            {[0, 1, 2].map((item) => (
              <span key={item} />
            ))}
          </div>
          {children}
        </div>
        <div className="cl-loading-skeleton__x-axis">
          {Array.from({ length: xLabels }).map((_, index) => (
            <span
              key={index}
              className="cl-loading-skeleton__shape"
              style={{ width: 32 + (index % 2) * 8, height: 8 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BarSkeleton({
  plotWidth,
  plotHeight,
  variant = 'bar'
}: {
  plotWidth: number;
  plotHeight: number;
  variant?: 'bar' | 'histogram' | 'combo';
}) {
  const heights =
    variant === 'histogram'
      ? [38, 58, 76, 92, 70, 48, 34]
      : variant === 'combo'
        ? [48, 66, 82, 40, 58, 70]
        : [52, 74, 42, 86, 63, 36];

  return (
    <div
      className={cx(
        'cl-loading-skeleton__bars',
        variant === 'histogram' && 'cl-loading-skeleton__bars--touching',
        variant === 'combo' && 'cl-loading-skeleton__bars--combo'
      )}
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className="cl-loading-skeleton__bar"
          style={{
            height: `${height}%`,
            animationDelay: `${index * 70}ms`
          }}
        />
      ))}
    </div>
  );
}

function LineOverlay({
  plotWidth,
  plotHeight,
  showSecondary = false
}: {
  plotWidth: number;
  plotHeight: number;
  showSecondary?: boolean;
}) {
  return (
    <svg
      className="cl-loading-skeleton__line"
      viewBox={`0 0 ${plotWidth} ${plotHeight}`}
      preserveAspectRatio="none"
      role="presentation"
    >
      <path
        d={`M 0 ${plotHeight * 0.68} L ${plotWidth * 0.25} ${plotHeight * 0.46} L ${plotWidth * 0.5} ${plotHeight * 0.58} L ${plotWidth * 0.75} ${plotHeight * 0.28} L ${plotWidth} ${plotHeight * 0.4}`}
        pathLength="1"
      />
      {showSecondary ? (
        <path
          className="cl-loading-skeleton__line-secondary"
          d={`M 0 ${plotHeight * 0.78} L ${plotWidth * 0.25} ${plotHeight * 0.62} L ${plotWidth * 0.5} ${plotHeight * 0.7} L ${plotWidth * 0.75} ${plotHeight * 0.52} L ${plotWidth} ${plotHeight * 0.55}`}
          pathLength="1"
        />
      ) : null}
    </svg>
  );
}

function LineSkeleton({
  plotWidth,
  plotHeight
}: {
  plotWidth: number;
  plotHeight: number;
}) {
  return (
    <CartesianFrame plotWidth={plotWidth} plotHeight={plotHeight}>
      <LineOverlay plotWidth={plotWidth} plotHeight={plotHeight} showSecondary />
    </CartesianFrame>
  );
}

function ComboSkeleton({
  plotWidth,
  plotHeight
}: {
  plotWidth: number;
  plotHeight: number;
}) {
  return (
    <CartesianFrame plotWidth={plotWidth} plotHeight={plotHeight}>
      <BarSkeleton plotWidth={plotWidth} plotHeight={plotHeight} variant="combo" />
      <LineOverlay plotWidth={plotWidth} plotHeight={plotHeight} />
    </CartesianFrame>
  );
}

function BarSkeletonFrame({
  plotWidth,
  plotHeight,
  variant
}: {
  plotWidth: number;
  plotHeight: number;
  variant: 'bar' | 'histogram';
}) {
  return (
    <CartesianFrame
      plotWidth={plotWidth}
      plotHeight={plotHeight}
      xLabels={variant === 'histogram' ? 7 : 6}
    >
      <BarSkeleton plotWidth={plotWidth} plotHeight={plotHeight} variant={variant} />
    </CartesianFrame>
  );
}

function DonutSkeleton() {
  const size = 180;
  const thickness = 16;
  const center = size / 2;
  const radius = center - thickness / 2 - 2;

  return (
    <div className="cl-loading-skeleton__radial">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="presentation"
      >
        <circle
          className="cl-loading-skeleton__ring-base"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
        />
        <circle
          className="cl-loading-skeleton__ring-progress"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
          pathLength="1"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="cl-loading-skeleton__radial-center">
        <span
          className="cl-loading-skeleton__shape"
          style={{ width: 56, height: 16 }}
        />
        <span
          className="cl-loading-skeleton__shape"
          style={{ width: 36, height: 8 }}
        />
      </div>
    </div>
  );
}

function HalfDonutSkeleton() {
  const size = 220;
  const viewBoxHeight = Math.round(size * 0.68);
  const centerX = size / 2;
  const centerY = size * 0.55;
  const radius = size * 0.4;
  const thickness = 16;
  const startAngle = 270;
  const endAngle = startAngle + 180;

  const trackPath = describeArcSegment(centerX, centerY, radius, startAngle, endAngle);

  return (
    <div className="cl-loading-skeleton__radial cl-loading-skeleton__radial--half">
      <svg
        width={size}
        height={viewBoxHeight}
        viewBox={`0 0 ${size} ${viewBoxHeight}`}
        role="presentation"
      >
        <path
          className="cl-loading-skeleton__ring-base"
          d={trackPath}
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        <path
          className="cl-loading-skeleton__ring-progress cl-loading-skeleton__ring-progress--half"
          d={trackPath}
          strokeWidth={thickness}
          strokeLinecap="round"
          pathLength="1"
        />
      </svg>
      <div
        className="cl-loading-skeleton__radial-center cl-loading-skeleton__radial-center--half"
        style={{ top: centerY - 28 }}
      >
        <span
          className="cl-loading-skeleton__shape"
          style={{ width: 52, height: 16 }}
        />
        <span
          className="cl-loading-skeleton__shape"
          style={{ width: 32, height: 8 }}
        />
      </div>
      <div
        className="cl-loading-skeleton__radial-endlabels"
        style={{ top: centerY + 14, width: radius * 2 + 24, left: centerX - radius - 12 }}
      >
        <span
          className="cl-loading-skeleton__shape"
          style={{ width: 18, height: 8 }}
        />
        <span
          className="cl-loading-skeleton__shape"
          style={{ width: 22, height: 8 }}
        />
      </div>
    </div>
  );
}

function SparklineSkeleton({
  plotWidth,
  plotHeight
}: {
  plotWidth: number;
  plotHeight: number;
}) {
  return (
    <div
      className="cl-loading-skeleton__sparkline"
      style={{ width: plotWidth, height: plotHeight }}
    >
      <svg
        viewBox={`0 0 ${plotWidth} ${plotHeight}`}
        preserveAspectRatio="none"
        role="presentation"
      >
        <path
          d={`M 0 ${plotHeight * 0.7} L ${plotWidth * 0.18} ${plotHeight * 0.52} L ${plotWidth * 0.35} ${plotHeight * 0.6} L ${plotWidth * 0.52} ${plotHeight * 0.36} L ${plotWidth * 0.72} ${plotHeight * 0.44} L ${plotWidth} ${plotHeight * 0.26}`}
          pathLength="1"
        />
      </svg>
    </div>
  );
}

function PointerScaleSkeleton({ plotWidth }: { plotWidth: number }) {
  return (
    <div className="cl-loading-skeleton__pointer" style={{ width: plotWidth }}>
      <span
        className="cl-loading-skeleton__shape cl-loading-skeleton__pointer-value"
        style={{ width: 56, height: 22 }}
      />
      <div className="cl-loading-skeleton__pointer-track">
        <div className="cl-loading-skeleton__pointer-segments">
          <span className="cl-loading-skeleton__pointer-segment" />
          <span className="cl-loading-skeleton__pointer-segment" />
          <span className="cl-loading-skeleton__pointer-segment" />
        </div>
        <span
          className="cl-loading-skeleton__pointer-needle"
          style={{ left: '58%' }}
        />
      </div>
      <div className="cl-loading-skeleton__pointer-range-labels">
        <span className="cl-loading-skeleton__shape" style={{ width: 22, height: 8 }} />
        <span className="cl-loading-skeleton__shape" style={{ width: 36, height: 8 }} />
        <span className="cl-loading-skeleton__shape" style={{ width: 22, height: 8 }} />
      </div>
      <div className="cl-loading-skeleton__pointer-axis-labels">
        <span className="cl-loading-skeleton__shape" style={{ width: 14, height: 8 }} />
        <span className="cl-loading-skeleton__shape" style={{ width: 22, height: 8 }} />
      </div>
    </div>
  );
}

function MapSkeleton({
  plotWidth,
  plotHeight
}: {
  plotWidth: number;
  plotHeight: number;
}) {
  const statePaths = useMemo(() => {
    const projection = geoAlbersUsa().fitExtent(
      [
        [10, 10],
        [plotWidth - 10, plotHeight - 10]
      ],
      statesCollection as any
    );
    const pathGenerator = geoPath(projection as any);
    return statesCollection.features.map((featureItem: any) => ({
      id: String(featureItem.id),
      d: pathGenerator(featureItem) ?? ''
    }));
  }, [plotWidth, plotHeight]);

  const bubbles = [
    { cx: 0.18, cy: 0.62, r: 6 },
    { cx: 0.32, cy: 0.45, r: 10 },
    { cx: 0.5, cy: 0.55, r: 8 },
    { cx: 0.62, cy: 0.7, r: 12 },
    { cx: 0.78, cy: 0.42, r: 7 },
    { cx: 0.86, cy: 0.6, r: 9 }
  ];

  return (
    <div
      className="cl-loading-skeleton__map"
      style={{ width: plotWidth, height: plotHeight }}
    >
      <svg
        width={plotWidth}
        height={plotHeight}
        viewBox={`0 0 ${plotWidth} ${plotHeight}`}
        role="presentation"
      >
        <rect
          className="cl-loading-skeleton__map-bg"
          x="0"
          y="0"
          width={plotWidth}
          height={plotHeight}
          rx="4"
        />
        <g className="cl-loading-skeleton__map-states">
          {statePaths.map((state: { id: string; d: string }) => (
            <path key={state.id} d={state.d} />
          ))}
        </g>
        <g className="cl-loading-skeleton__map-bubbles">
          {bubbles.map((bubble, index) => (
            <circle
              key={index}
              cx={plotWidth * bubble.cx}
              cy={plotHeight * bubble.cy}
              r={bubble.r}
              style={{ animationDelay: `${index * 80}ms` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

type SankeyColumn = {
  x: number;
  nodes: Array<{ y0: number; y1: number }>;
};

function buildSankeyRibbons(
  source: SankeyColumn,
  target: SankeyColumn,
  links: Array<{ from: number; to: number; weight: number }>,
  nodeWidth: number,
  scaleY: (y: number) => number
) {
  const sourceCursors: number[] = source.nodes.map(() => 0);
  const targetCursors: number[] = target.nodes.map(() => 0);
  const sourceTotals: number[] = source.nodes.map((node, index) =>
    links.filter((link) => link.from === index).reduce((sum, link) => sum + link.weight, 0) || 1
  );
  const targetTotals: number[] = target.nodes.map((_, index) =>
    links.filter((link) => link.to === index).reduce((sum, link) => sum + link.weight, 0) || 1
  );

  return links.map((link) => {
    const src = source.nodes[link.from];
    const tgt = target.nodes[link.to];
    const srcSpan = src.y1 - src.y0;
    const tgtSpan = tgt.y1 - tgt.y0;

    const sy0 = src.y0 + srcSpan * (sourceCursors[link.from] / sourceTotals[link.from]);
    sourceCursors[link.from] += link.weight;
    const sy1 = src.y0 + srcSpan * (sourceCursors[link.from] / sourceTotals[link.from]);

    const ty0 = tgt.y0 + tgtSpan * (targetCursors[link.to] / targetTotals[link.to]);
    targetCursors[link.to] += link.weight;
    const ty1 = tgt.y0 + tgtSpan * (targetCursors[link.to] / targetTotals[link.to]);

    return describeSankeyRibbon(
      source.x + nodeWidth,
      scaleY(sy0),
      scaleY(sy1),
      target.x,
      scaleY(ty0),
      scaleY(ty1)
    );
  });
}

function SankeySkeleton({
  plotWidth,
  plotHeight
}: {
  plotWidth: number;
  plotHeight: number;
}) {
  const nodeWidth = 6;
  const padX = 24;
  const designHeight = 320;
  const scaleY = (y: number) => (y / designHeight) * plotHeight;

  const columns: SankeyColumn[] = [
    {
      x: padX,
      nodes: [
        { y0: 24, y1: 96 },
        { y0: 128, y1: 208 },
        { y0: 240, y1: 296 }
      ]
    },
    {
      x: plotWidth / 2 - nodeWidth / 2,
      nodes: [
        { y0: 36, y1: 100 },
        { y0: 132, y1: 208 },
        { y0: 240, y1: 292 }
      ]
    },
    {
      x: plotWidth - padX - nodeWidth,
      nodes: [
        { y0: 20, y1: 108 },
        { y0: 140, y1: 216 },
        { y0: 248, y1: 296 }
      ]
    }
  ];

  const leftToMid = buildSankeyRibbons(
    columns[0],
    columns[1],
    [
      { from: 0, to: 0, weight: 3 },
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 1, weight: 2 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 2, weight: 1 }
    ],
    nodeWidth,
    scaleY
  );

  const midToRight = buildSankeyRibbons(
    columns[1],
    columns[2],
    [
      { from: 0, to: 0, weight: 2 },
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 1, weight: 3 },
      { from: 2, to: 2, weight: 1 }
    ],
    nodeWidth,
    scaleY
  );

  const ribbons = [...leftToMid, ...midToRight];

  return (
    <div
      className="cl-loading-skeleton__sankey"
      style={{ width: plotWidth, height: plotHeight }}
    >
      <svg
        width={plotWidth}
        height={plotHeight}
        viewBox={`0 0 ${plotWidth} ${plotHeight}`}
        role="presentation"
      >
        <g className="cl-loading-skeleton__sankey-ribbons">
          {ribbons.map((d, index) => (
            <path key={index} d={d} />
          ))}
        </g>
        <g className="cl-loading-skeleton__sankey-nodes">
          {columns.map((col, ci) =>
            col.nodes.map((node, ni) => (
              <rect
                key={`${ci}-${ni}`}
                x={col.x}
                y={scaleY(node.y0)}
                width={nodeWidth}
                height={scaleY(node.y1) - scaleY(node.y0)}
              />
            ))
          )}
        </g>
      </svg>
    </div>
  );
}

function renderSkeleton(
  type: ChartLoadingType,
  plotWidth: number,
  plotHeight: number
) {
  switch (type) {
    case 'combo':
      return <ComboSkeleton plotWidth={plotWidth} plotHeight={plotHeight} />;
    case 'line':
      return <LineSkeleton plotWidth={plotWidth} plotHeight={plotHeight} />;
    case 'donut':
      return <DonutSkeleton />;
    case 'half-donut':
      return <HalfDonutSkeleton />;
    case 'histogram':
      return (
        <BarSkeletonFrame
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          variant="histogram"
        />
      );
    case 'sparkline':
      return <SparklineSkeleton plotWidth={plotWidth} plotHeight={plotHeight} />;
    case 'pointer-scale':
      return <PointerScaleSkeleton plotWidth={plotWidth} />;
    case 'map-bubble':
      return <MapSkeleton plotWidth={plotWidth} plotHeight={plotHeight} />;
    case 'sankey':
      return <SankeySkeleton plotWidth={plotWidth} plotHeight={plotHeight} />;
    case 'bar':
    default:
      return (
        <BarSkeletonFrame
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          variant="bar"
        />
      );
  }
}

export function ChartLoadingSkeleton({
  chartType = 'bar',
  title,
  width,
  plotWidth,
  plotHeight,
  showCardBackground = true,
  animate = true
}: ChartLoadingSkeletonProps) {
  const defaults = dimensionsByType[chartType];
  const resolvedWidth = width ?? defaults.width;
  const resolvedPlotWidth = plotWidth ?? defaults.plotWidth;
  const resolvedPlotHeight = plotHeight ?? defaults.plotHeight;
  const resolvedTitle = title ?? titlesByType[chartType];

  return (
    <ChartCard
      width={resolvedWidth}
      surface={showCardBackground ? 'card' : 'plain'}
      className={cx(
        'cl-chart-card',
        'cl-loading-skeleton',
        `cl-loading-skeleton--${chartType}`,
        animate && 'cl-loading-skeleton--animated'
      )}
    >
      <figure className="cl-chart-shell" aria-busy="true" aria-label={`${resolvedTitle} is loading`}>
        <h3 className="cl-header__title cl-loading-skeleton__title">{resolvedTitle}</h3>
        <div className="cl-chart-shell__body">
          <div className="cl-chart-shell__main">
            <div className="cl-loading-skeleton__stage">
              {renderSkeleton(chartType, resolvedPlotWidth, resolvedPlotHeight)}
            </div>
          </div>
        </div>
      </figure>
    </ChartCard>
  );
}
