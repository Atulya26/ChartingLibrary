import { chartTokens } from '../theme/tokens';
import type { FillStyle } from '../types';

export function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getSeriesColor(index: number) {
  const palette = chartTokens.categorical.axisPalette;
  return palette[index % palette.length];
}

export function getFillStyleBackground(
  fillStyle: FillStyle,
  color: string,
  strokeColor?: string
) {
  if (fillStyle === 'texture') {
    return `repeating-linear-gradient(135deg, ${color}, ${color} 4px, ${withAlpha(
      strokeColor ?? chartTokens.neutral.white,
      0
    )} 4px, ${withAlpha(strokeColor ?? chartTokens.neutral.white, 0)} 8px)`;
  }

  if (fillStyle === 'gradient') {
    return `linear-gradient(180deg, ${withAlpha(color, 0.92)} 0%, ${withAlpha(
      color,
      0.65
    )} 100%)`;
  }

  return color;
}
