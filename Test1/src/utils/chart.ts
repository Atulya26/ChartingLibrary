export interface Point {
  x: number;
  y: number;
  value: number;
  index: number;
}

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function getValueExtent(valueGroups: number[][]) {
  const allValues = valueGroups.flat();
  const min = Math.min(...allValues, 0);
  const max = Math.max(...allValues, 0, 1);

  if (min === max) {
    return { min: 0, max: max || 1 };
  }

  return { min, max };
}

export function createYScale(
  minValue: number,
  maxValue: number,
  height: number
) {
  const range = maxValue - minValue || 1;

  return (value: number) => ((maxValue - value) / range) * height;
}

export function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  insets: Insets,
  minValue: number,
  maxValue: number
) {
  const plotWidth = Math.max(width - insets.left - insets.right, 1);
  const plotHeight = Math.max(height - insets.top - insets.bottom, 1);
  const scaleY = createYScale(minValue, maxValue, plotHeight);
  const denominator = Math.max(values.length - 1, 1);

  return values.map((value, index) => ({
    x: insets.left + (plotWidth * index) / denominator,
    y: insets.top + scaleY(value),
    value,
    index
  }));
}

export function describeLinePath(points: Point[]) {
  if (!points.length) {
    return '';
  }

  return points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(' ');
}

export function describeAreaPath(points: Point[], baseline: number) {
  if (!points.length) {
    return '';
  }

  const line = describeLinePath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${line} L ${lastPoint.x.toFixed(2)} ${baseline.toFixed(
    2
  )} L ${firstPoint.x.toFixed(2)} ${baseline.toFixed(2)} Z`;
}

export function formatNumberCompact(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `${Math.round((value / 1_000_000) * 10) / 10}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${Math.round((value / 1_000) * 10) / 10}K`;
  }

  return `${value}`;
}

export function getTickValues(minValue: number, maxValue: number, count: number) {
  if (count <= 1) {
    return [maxValue];
  }

  const step = (maxValue - minValue) / (count - 1);

  return Array.from({ length: count }, (_, index) => maxValue - step * index);
}
