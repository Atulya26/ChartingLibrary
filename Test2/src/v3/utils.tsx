import { chartTokens } from '../theme/tokens';
import { formatNumberCompact, getTickValues } from '../utils/chart';
import { withAlpha } from '../utils/color';
import type { FillStyle } from '../types';
import type {
  AxisConfigV3,
  BarDatumV3,
  BarSeriesV3,
  DonutSegmentV3,
  FillStyleModeV3,
  HistogramBinV3,
  LegendMarkerModeV3,
  LineSeriesConfigV3,
  PointerScaleRangeV3,
  ReferenceLineV3
} from './types';

export interface ResolvedBarDatumV3 extends BarDatumV3 {
  fill: string;
  stroke: string;
  fillStyle: FillStyle;
}

export interface TickEntryV3 {
  value: number;
  label: string;
}

export interface PlotPointV3 {
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
  fillStyleOverride: FillStyleModeV3 = 'inherit'
) {
  return fillStyleOverride === 'inherit' ? fillStyle : fillStyleOverride;
}

export function getFillLegendMarker(fillStyle: FillStyle) {
  return fillStyle === 'texture' ? ('solid-texture' as const) : ('solid' as const);
}

export function resolveFillLegendMarker(
  fillStyle: FillStyle,
  legendMarker: LegendMarkerModeV3 = 'auto'
) {
  return legendMarker === 'auto' ? getFillLegendMarker(fillStyle) : legendMarker;
}

export function resolveBarDatum(
  datum: number | BarDatumV3,
  series: BarSeriesV3,
  seriesIndex: number,
  fillStyleOverride: FillStyleModeV3 = 'inherit'
): ResolvedBarDatumV3 {
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
  bin: HistogramBinV3,
  index: number,
  fillStyleOverride: FillStyleModeV3 = 'inherit'
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

export function getGroupedExtent(series: BarSeriesV3[]) {
  const values = series.flatMap((item, seriesIndex) =>
    item.data.map((datum) => resolveBarDatum(datum, item, seriesIndex).value)
  );

  return {
    min: Math.min(...values, 0),
    max: Math.max(...values, 0, 1)
  };
}

export function getStackedExtent(
  series: BarSeriesV3[],
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
  axis: AxisConfigV3 | undefined,
  minValue: number,
  maxValue: number,
  count = 3
): TickEntryV3[] {
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

export function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  minValue: number,
  maxValue: number,
  inset = 0
): PlotPointV3[] {
  const scaleY = createInvertedScale(minValue, maxValue, Math.max(height - inset * 2, 1));
  const denominator = Math.max(values.length - 1, 1);

  return values.map((value, index) => ({
    x: (width * index) / denominator,
    y: inset + scaleY(value),
    value,
    index
  }));
}

export function describeLinePath(points: PlotPointV3[]) {
  if (!points.length) {
    return '';
  }

  return points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(' ');
}

export function describeAreaPath(points: PlotPointV3[], baseline: number) {
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

export function getDotRadius(size: LineSeriesConfigV3['dotSize'] = 'medium') {
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

export function getGaugeArcLength(
  value: number,
  minValue: number,
  maxValue: number,
  radius: number
) {
  const ratio = (clamp(value, minValue, maxValue) - minValue) / (maxValue - minValue || 1);
  return Math.PI * radius * ratio;
}

export function getDonutLabel(
  segment: DonutSegmentV3,
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

export function buildLegendItemsFromLineSeries(series: LineSeriesConfigV3[]) {
  return series.map((item) => ({
    label: item.label,
    color: item.stroke ?? chartTokens.categorical.secondary,
    strokeColor: item.stroke ?? chartTokens.categorical.secondary,
    marker:
      item.showDots === false
        ? item.lineStyle === 'dashed'
          ? ('line-dashed' as const)
          : ('line' as const)
        : item.lineStyle === 'dashed'
          ? ('dot-line-dashed' as const)
          : ('dot-line' as const),
    active: item.active
  }));
}

export function buildLegendItemsFromBarSeries(series: BarSeriesV3[]) {
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
  series: BarSeriesV3[],
  fillStyleOverride: FillStyleModeV3 = 'inherit',
  legendMarker: LegendMarkerModeV3 = 'auto'
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
  segments: DonutSegmentV3[],
  fillStyleOverride: FillStyleModeV3 = 'inherit',
  legendMarker: LegendMarkerModeV3 = 'auto'
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
  fillStyleOverride: FillStyleModeV3 = 'inherit',
  legendMarker: LegendMarkerModeV3 = 'auto'
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

export function buildReferenceLegend(referenceLines: ReferenceLineV3[]) {
  return referenceLines.map((line, index) => ({
    label: line.label ?? `Reference ${index + 1}`,
    color: line.color ?? chartTokens.text.subtle,
    strokeColor: line.color ?? chartTokens.text.subtle,
    marker: line.lineStyle === 'dashed' ? ('line-dashed' as const) : ('line' as const)
  }));
}

export function getPointerScaleStops(ranges: PointerScaleRangeV3[]) {
  const sorted = [...ranges].sort((left, right) => left.from - right.from);
  return sorted.map((range) => ({
    ...range,
    widthPercent: Math.max(range.to - range.from, 0)
  }));
}
