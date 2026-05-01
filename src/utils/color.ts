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

function getRgbChannels(hex: string) {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  if (value.length !== 6) {
    return null;
  }

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ] as const;
}

function getRelativeLuminance(hex: string) {
  const channels = getRgbChannels(hex);
  if (!channels) {
    return null;
  }

  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function getContrastRatio(foreground: string, background: string) {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);

  if (foregroundLuminance == null || backgroundLuminance == null) {
    return 0;
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function getAccessibleTextColor(background: string) {
  const inverseContrast = getContrastRatio(chartTokens.text.inverse, background);
  const defaultContrast = getContrastRatio(chartTokens.text.default, background);

  if (inverseContrast >= 4.5) {
    return chartTokens.text.inverse;
  }

  if (defaultContrast >= 4.5) {
    return chartTokens.text.default;
  }

  return '#000000';
}

export function getAccessibleSeriesTextColor(color: string) {
  return getContrastRatio(color, chartTokens.neutral.white) >= 4.5
    ? color
    : chartTokens.text.default;
}

export function getSeriesColor(index: number) {
  const palette = chartTokens.categorical.axisPalette;
  return palette[index % palette.length];
}

export function getFillStyleBackground(fillStyle: FillStyle, color: string, strokeColor?: string) {
  if (fillStyle === 'texture') {
    return `repeating-linear-gradient(135deg, ${color}, ${color} 4px, ${withAlpha(
      strokeColor ?? chartTokens.neutral.white,
      0
    )} 4px, ${withAlpha(strokeColor ?? chartTokens.neutral.white, 0)} 8px)`;
  }

  if (fillStyle === 'gradient') {
    return `linear-gradient(180deg, ${withAlpha(color, 0.92)} 0%, ${withAlpha(color, 0.65)} 100%)`;
  }

  return color;
}
