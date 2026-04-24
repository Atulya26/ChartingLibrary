import { chartTokens } from './theme/tokens';
import { formatNumberCompact, getTickValues } from './utils/chart';
import { withAlpha } from './utils/color';
import type { FillStyle } from './types';
import type {
  AxisConfig,
  BarDatum,
  BarSeries,
  DonutSegment,
  FillStyleMode,
  HistogramBin,
  LegendMarkerMode,
  LineSeriesConfig,
  PointerScaleRange,
  ReferenceLine
} from './types';

export interface ResolvedBarDatum extends BarDatum {
  fill: string;
  stroke: string;
  fillStyle: FillStyle;
}

export interface TickEntry {
  value: number;
  label: string;
}

export interface PlotPoint {
  x: number;
  y: number;
  value: number;
  index: number;
}

export function getPaletteColor(index: number) {
  return chartTokens.categorical.axisPalette[
    index % chartTokens.categorical.axisPalette.length
  ];
}

export function resolveFillStyle(
  fillStyle: FillStyle,
  fillStyleOverride: FillStyleMode = 'inherit'
) {
  return fillStyleOverride === 'inherit' ? fillStyle : fillStyleOverride;
}

export function getFillLegendMarker(fillStyle: FillStyle) {
  return fillStyle === 'texture' ? ('solid-texture' as const) : ('solid' as const);
}

export function resolveFillLegendMarker(
  fillStyle: FillStyle,
  legendMarker: LegendMarkerMode = 'auto'
) {
  return legendMarker === 'auto' ? getFillLegendMarker(fillStyle) : legendMarker;
}

export function getLineLegendMarker(item: LineSeriesConfig) {
  if (item.showDots === false) {
    return item.lineStyle === 'dashed'
      ? ('line-dashed' as const)
      : ('line' as const);
  }

  return item.lineStyle === 'dashed'
    ? ('dot-line-dashed' as const)
    : ('dot-line' as const);
}

export function formatTooltipValue(value: number) {
  const isWholeNumber = Math.abs(value - Math.round(value)) < 0.001;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: isWholeNumber ? 0 : 1
  }).format(value);
}

export function getEstimatedHoverCardHeight(
  rowCount: number,
  hasTotalRow = false
) {
  return 54 + rowCount * 26 + (hasTotalRow ? 30 : 0);
}

export interface HoverCardPositionOptions {
  cardWidth?: number;
  cardHeight?: number;
  offset?: number;
  padding?: number;
  preferVertical?: 'auto' | 'above' | 'below';
}

export function getHoverCardPosition(
  anchorX: number,
  anchorY: number,
  boundaryWidth: number,
  boundaryHeight: number,
  {
    cardWidth = 196,
    cardHeight = 132,
    offset = 12,
    padding = 12,
    preferVertical = 'auto'
  }: HoverCardPositionOptions = {}
) {
  const maxLeft = Math.max(boundaryWidth - cardWidth - padding, padding);
  const maxTop = Math.max(boundaryHeight - cardHeight - padding, padding);
  const placeRight = anchorX + offset;
  const placeLeft = anchorX - cardWidth - offset;
  const canPlaceRight = placeRight <= maxLeft;
  const canPlaceLeft = placeLeft >= padding;

  let left: number;
  if (canPlaceRight && (!canPlaceLeft || anchorX <= boundaryWidth / 2)) {
    left = placeRight;
  } else if (canPlaceLeft) {
    left = placeLeft;
  } else {
    left = clamp(anchorX - cardWidth / 2, padding, maxLeft);
  }

  const placeAbove = anchorY - cardHeight - offset;
  const placeBelow = anchorY + offset;
  const canPlaceAbove = placeAbove >= padding;
  const canPlaceBelow = placeBelow <= maxTop;
  const preferAbove =
    preferVertical === 'auto' ? anchorY >= boundaryHeight / 2 : preferVertical === 'above';

  let top: number;
  if (preferAbove && canPlaceAbove) {
    top = placeAbove;
  } else if (!preferAbove && canPlaceBelow) {
    top = placeBelow;
  } else if (canPlaceAbove) {
    top = placeAbove;
  } else if (canPlaceBelow) {
    top = placeBelow;
  } else {
    top = clamp(anchorY - cardHeight / 2, padding, maxTop);
  }

  return { left, top };
}

export function getViewportHoverCardPosition(
  mouseX: number,
  mouseY: number,
  cardWidth = 196,
  cardHeight = 132,
  offset = 16
) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const padding = 12;

  let left = mouseX + offset;
  if (left + cardWidth > vw - padding) {
    left = mouseX - cardWidth - offset;
  }
  left = Math.max(padding, Math.min(left, vw - cardWidth - padding));

  let top = mouseY - cardHeight / 2;
  top = Math.max(padding, Math.min(top, vh - cardHeight - padding));

  return { left, top };
}

export function getHoverCardLeft(
  anchorX: number,
  boundaryWidth: number,
  cardWidth = 188,
  offset = 14
) {
  return clamp(anchorX + offset, 12, Math.max(boundaryWidth - cardWidth - 12, 12));
}

export function getHoverIndex(
  pointerX: number,
  plotWidth: number,
  itemCount: number
) {
  if (itemCount <= 1) {
    return 0;
  }

  const boundedX = clamp(pointerX, 0, Math.max(plotWidth - 1, 0));
  return Math.min(
    itemCount - 1,
    Math.max(0, Math.floor((boundedX / plotWidth) * itemCount))
  );
}

export function resolveBarDatum(
  datum: number | BarDatum,
  series: BarSeries,
  seriesIndex: number,
  fillStyleOverride: FillStyleMode = 'inherit'
): ResolvedBarDatum {
  const fallback = getPaletteColor(seriesIndex);
  const override = typeof datum === 'number' ? undefined : datum;
  const resolvedFillStyle = resolveFillStyle(
    override?.fillStyle ?? series.fillStyle ?? 'solid',
    fillStyleOverride
  );

  return {
    value: typeof datum === 'number' ? datum : datum.value,
    fill: override?.fill ?? series.fill ?? fallback.fill,
    stroke: override?.stroke ?? series.stroke ?? fallback.stroke,
    fillStyle: resolvedFillStyle,
    active: override?.active ?? series.active ?? true,
    showLabel: override?.showLabel
  };
}

export function resolveHistogramBin(
  bin: HistogramBin,
  index: number,
  fillStyleOverride: FillStyleMode = 'inherit'
) {
  const palette = getPaletteColor(index);
  const resolvedFillStyle = resolveFillStyle(bin.fillStyle ?? 'solid', fillStyleOverride);
  return {
    ...bin,
    fill: bin.fill ?? palette.fill,
    stroke: bin.stroke ?? palette.stroke,
    fillStyle: resolvedFillStyle
  };
}

export function getGroupedExtent(series: BarSeries[]) {
  const values = series.flatMap((item, seriesIndex) =>
    item.data.map((datum) => resolveBarDatum(datum, item, seriesIndex).value)
  );

  return {
    min: Math.min(...values, 0),
    max: Math.max(...values, 0, 1)
  };
}

export function getStackedExtent(
  series: BarSeries[],
  categoryCount: number
) {
  let min = 0;
  let max = 1;

  Array.from({ length: categoryCount }).forEach((_, categoryIndex) => {
    let positive = 0;
    let negative = 0;

    series.forEach((item, seriesIndex) => {
      const resolved = resolveBarDatum(
        item.data[categoryIndex] ?? 0,
        item,
        seriesIndex
      );

      if (resolved.value >= 0) {
        positive += resolved.value;
      } else {
        negative += resolved.value;
      }
    });

    max = Math.max(max, positive, 0);
    min = Math.min(min, negative, 0);
  });

  return { min, max };
}

export function getValueExtent(values: number[]) {
  return {
    min: Math.min(...values, 0),
    max: Math.max(...values, 0, 1)
  };
}

export function resolveTickEntries(
  axis: AxisConfig | undefined,
  minValue: number,
  maxValue: number,
  count = 3
): TickEntry[] {
  const ticks = axis?.ticks;

  if (!ticks?.length) {
    return getTickValues(minValue, maxValue, count).map((tick) => ({
      value: tick,
      label: formatNumberCompact(Math.round(tick * 10) / 10)
    }));
  }

  if (ticks.every((tick) => typeof tick === 'number')) {
    return (ticks as number[]).map((tick) => ({
      value: tick,
      label: formatNumberCompact(Math.round(tick * 10) / 10)
    }));
  }

  const step = (maxValue - minValue) / Math.max(ticks.length - 1, 1);
  return ticks.map((tick, index) => ({
    value: maxValue - step * index,
    label: `${tick}`
  }));
}

export function createLinearScale(
  minValue: number,
  maxValue: number,
  size: number
) {
  const range = maxValue - minValue || 1;
  return (value: number) => ((value - minValue) / range) * size;
}

export function createInvertedScale(
  minValue: number,
  maxValue: number,
  size: number
) {
  const scale = createLinearScale(minValue, maxValue, size);
  return (value: number) => size - scale(value);
}

export function resolveResponsivePlotWidth(
  width: number | string | undefined,
  plotWidth: number | undefined,
  fallbackPlotWidth: number,
  reservedWidth: number,
  minPlotWidth = 160
) {
  if (typeof plotWidth === 'number') {
    return plotWidth;
  }

  if (typeof width === 'number') {
    return Math.max(minPlotWidth, width - reservedWidth);
  }

  return fallbackPlotWidth;
}

export function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  minValue: number,
  maxValue: number,
  inset = 0
): PlotPoint[] {
  const scaleY = createInvertedScale(minValue, maxValue, Math.max(height - inset * 2, 1));
  const denominator = Math.max(values.length - 1, 1);
  const usableWidth = Math.max(width - inset * 2, 1);

  return values.map((value, index) => ({
    x: inset + (usableWidth * index) / denominator,
    y: inset + scaleY(value),
    value,
    index
  }));
}

export function describeLinePath(points: PlotPoint[]) {
  if (!points.length) {
    return '';
  }

  return points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(' ');
}

export function describeAreaPath(points: PlotPoint[], baseline: number) {
  if (!points.length) {
    return '';
  }

  const linePath = describeLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x.toFixed(2)} ${baseline.toFixed(
    2
  )} L ${firstPoint.x.toFixed(2)} ${baseline.toFixed(2)} Z`;
}

export function getDotRadius(size: LineSeriesConfig['dotSize'] = 'medium') {
  if (size === 'small') {
    return 2;
  }

  if (size === 'large') {
    return 5;
  }

  return 3;
}

export function getSvgFillDefinition(
  id: string,
  fillStyle: FillStyle,
  fill: string,
  stroke: string
) {
  if (fillStyle === 'solid') {
    return { fill, definition: null };
  }

  if (fillStyle === 'gradient') {
    return {
      fill: `url(#${id})`,
      definition: (
        <linearGradient id={id} key={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={withAlpha(fill, 0.92)} />
          <stop offset="100%" stopColor={withAlpha(fill, 0.65)} />
        </linearGradient>
      )
    };
  }

  return {
    fill: `url(#${id})`,
    definition: (
      <pattern
        id={id}
        key={id}
        patternUnits="userSpaceOnUse"
        width="8"
        height="8"
        patternTransform="rotate(45)"
      >
        <rect width="8" height="8" fill={withAlpha(fill, 0.08)} />
        <line x1="0" y1="0" x2="0" y2="8" stroke={stroke} strokeWidth="4" />
      </pattern>
    )
  };
}

export function describeBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  direction: 'positive' | 'negative' = 'positive'
) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  if (safeRadius === 0) {
    return `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;
  }

  if (direction === 'negative') {
    return [
      `M ${x} ${y}`,
      `L ${x} ${y + height - safeRadius}`,
      `Q ${x} ${y + height} ${x + safeRadius} ${y + height}`,
      `L ${x + width - safeRadius} ${y + height}`,
      `Q ${x + width} ${y + height} ${x + width} ${y + height - safeRadius}`,
      `L ${x + width} ${y}`,
      'Z'
    ].join(' ');
  }

  return [
    `M ${x} ${y + height}`,
    `L ${x} ${y + safeRadius}`,
    `Q ${x} ${y} ${x + safeRadius} ${y}`,
    `L ${x + width - safeRadius} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + safeRadius}`,
    `L ${x + width} ${y + height}`,
    'Z'
  ].join(' ');
}

export function describeHorizontalBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  direction: 'positive' | 'negative' = 'positive'
) {
  const safeRadius = Math.max(0, Math.min(radius, Math.abs(width) / 2, height / 2));
  const x2 = x + width;

  if (safeRadius === 0) {
    return `M ${x} ${y} H ${x2} V ${y + height} H ${x} Z`;
  }

  if (direction === 'negative') {
    return [
      `M ${x2} ${y}`,
      `L ${x + safeRadius} ${y}`,
      `Q ${x} ${y} ${x} ${y + safeRadius}`,
      `L ${x} ${y + height - safeRadius}`,
      `Q ${x} ${y + height} ${x + safeRadius} ${y + height}`,
      `L ${x2} ${y + height}`,
      'Z'
    ].join(' ');
  }

  return [
    `M ${x} ${y}`,
    `L ${x2 - safeRadius} ${y}`,
    `Q ${x2} ${y} ${x2} ${y + safeRadius}`,
    `L ${x2} ${y + height - safeRadius}`,
    `Q ${x2} ${y + height} ${x2 - safeRadius} ${y + height}`,
    `L ${x} ${y + height}`,
    'Z'
  ].join(' ');
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

export function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function describeArcSegment(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  sweepFlag = 1
) {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const normalizedSpan = Math.abs(endAngle - startAngle);
  const largeArcFlag = normalizedSpan > 180 ? '1' : '0';

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function mapValueToAngle(
  value: number,
  minValue: number,
  maxValue: number,
  startAngle: number,
  endAngle: number
) {
  const ratio = (clamp(value, minValue, maxValue) - minValue) / (maxValue - minValue || 1);
  return startAngle + ratio * (endAngle - startAngle);
}

export function getHalfDonutArcLength(
  value: number,
  minValue: number,
  maxValue: number,
  radius: number
) {
  const ratio = (clamp(value, minValue, maxValue) - minValue) / (maxValue - minValue || 1);
  return Math.PI * radius * ratio;
}

export function getDonutLabel(
  segment: DonutSegment,
  total: number,
  mode: 'value' | 'percent' | 'label' | 'label-percent'
) {
  const percent = total <= 0 ? 0 : Math.round((segment.value / total) * 100);

  if (mode === 'percent') {
    return `${percent}%`;
  }

  if (mode === 'label') {
    return segment.label;
  }

  if (mode === 'label-percent') {
    return `${segment.label} ${percent}%`;
  }

  return formatNumberCompact(segment.value);
}

export function buildLegendItemsFromLineSeries(series: LineSeriesConfig[]) {
  return series.map((item) => ({
    label: item.label,
    color: item.stroke ?? chartTokens.categorical.secondary,
    strokeColor: item.stroke ?? chartTokens.categorical.secondary,
    marker: getLineLegendMarker(item),
    active: item.active
  }));
}

export function buildLegendItemsFromBarSeries(series: BarSeries[]) {
  return series.map((item, index) => {
    const resolved = resolveBarDatum(item.data[0] ?? 0, item, index);
    return {
      label: item.label,
      color: resolved.fill,
      strokeColor: resolved.stroke,
      marker: resolveFillLegendMarker(resolved.fillStyle),
      active: item.active
    };
  });
}

export function buildLegendItemsFromBarSeriesWithOverrides(
  series: BarSeries[],
  fillStyleOverride: FillStyleMode = 'inherit',
  legendMarker: LegendMarkerMode = 'auto'
) {
  return series.map((item, index) => {
    const resolved = resolveBarDatum(item.data[0] ?? 0, item, index, fillStyleOverride);
    return {
      label: item.label,
      color: resolved.fill,
      strokeColor: resolved.stroke,
      marker: resolveFillLegendMarker(resolved.fillStyle, legendMarker),
      active: item.active
    };
  });
}

export function buildLegendItemsFromDonutSegments(
  segments: DonutSegment[],
  fillStyleOverride: FillStyleMode = 'inherit',
  legendMarker: LegendMarkerMode = 'auto'
) {
  return segments
    .filter((segment) => segment.value > 0 && segment.showLegendItem !== false)
    .map((segment) => {
      const resolvedFillStyle = resolveFillStyle(
        segment.fillStyle ?? 'solid',
        fillStyleOverride
      );

      return {
        label: segment.legendLabel ?? segment.label,
        color: segment.color,
        strokeColor: segment.strokeColor,
        marker: resolveFillLegendMarker(resolvedFillStyle, legendMarker),
        active: segment.active
      };
    });
}

export function buildLegendItemsFromBubbles(
  points: Array<{
    label: string;
    color: string;
    strokeColor?: string;
    fillStyle?: FillStyle;
    active?: boolean;
  }>,
  fillStyleOverride: FillStyleMode = 'inherit',
  legendMarker: LegendMarkerMode = 'auto'
) {
  const deduped = new Map<string, {
    label: string;
    color: string;
    strokeColor?: string;
    fillStyle?: FillStyle;
    active?: boolean;
  }>();

  points.forEach((point) => {
    if (!deduped.has(point.label)) {
      deduped.set(point.label, point);
    }
  });

  return Array.from(deduped.values()).map((point) => ({
    label: point.label,
    color: point.color,
    strokeColor: point.strokeColor,
    marker: resolveFillLegendMarker(
      resolveFillStyle(point.fillStyle ?? 'solid', fillStyleOverride),
      legendMarker
    ),
    active: point.active
  }));
}

export function buildReferenceLegend(referenceLines: ReferenceLine[]) {
  return referenceLines.map((line, index) => ({
    label: line.label ?? `Reference ${index + 1}`,
    color: line.color ?? chartTokens.text.subtle,
    strokeColor: line.color ?? chartTokens.text.subtle,
    marker: line.lineStyle === 'dashed' ? ('line-dashed' as const) : ('line' as const)
  }));
}

export function getPointerScaleStops(ranges: PointerScaleRange[]) {
  const sorted = [...ranges].sort((left, right) => left.from - right.from);
  return sorted.map((range) => ({
    ...range,
    widthPercent: Math.max(range.to - range.from, 0)
  }));
}
