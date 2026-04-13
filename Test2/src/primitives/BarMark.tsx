import type { CSSProperties } from 'react';

import { chartTokens } from '../theme/tokens';
import type { FillStyle } from '../types';
import { getFillStyleBackground } from '../utils/color';

export interface BarMarkProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  width?: number;
  height?: number;
  label?: string;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  showLabel?: boolean;
}

export function BarMark({
  value,
  minValue = 0,
  maxValue = 100,
  width = 44,
  height = chartTokens.chart.plotHeight,
  label,
  fill = chartTokens.categorical.primary,
  stroke = 'rgba(0, 0, 0, 0.1)',
  fillStyle = 'solid',
  showLabel = true
}: BarMarkProps) {
  const range = maxValue - minValue || 1;
  const scale = height / range;
  const zeroY = maxValue <= 0 ? 0 : minValue >= 0 ? height : maxValue * scale;
  const magnitude = Math.max(Math.abs(value) * scale, 1);
  const isPositive = value >= 0;
  const top = isPositive ? Math.max(zeroY - magnitude, 0) : zeroY;

  const surfaceStyle: CSSProperties = {
    top,
    height: magnitude,
    background:
      fillStyle === 'solid'
        ? fill
        : getFillStyleBackground(fillStyle, fill, stroke),
    borderColor: stroke,
    borderRadius: isPositive
      ? `${chartTokens.radii.card}px ${chartTokens.radii.card}px 0 0`
      : `0 0 ${chartTokens.radii.card}px ${chartTokens.radii.card}px`
  };

  return (
    <div className="cl-bar-mark" style={{ width }}>
      <div className="cl-bar-mark__plot" style={{ width, height }}>
        <div className="cl-bar-mark__surface" style={surfaceStyle} />
      </div>
      {showLabel ? <p className="cl-bar-mark__label">{label}</p> : null}
    </div>
  );
}
