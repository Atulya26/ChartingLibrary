import type { CSSProperties } from 'react';

import { chartTokens } from '../theme/tokens';
import type { LegendItem, LegendMarkerType } from '../types';
import { getFillStyleBackground } from '../utils/color';
import { cx } from '../utils/cx';

export interface LegendProps {
  items: LegendItem[];
  title?: string;
  orientation?: 'horizontal' | 'stacked';
  className?: string;
}

interface LegendMarkerProps {
  color: string;
  strokeColor?: string;
  marker?: LegendMarkerType;
  active?: boolean;
}

export function LegendMarker({
  color,
  strokeColor,
  marker = 'solid',
  active = true
}: LegendMarkerProps) {
  const baseStyle: CSSProperties = {
    width: 24,
    height: 12,
    display: 'inline-flex',
    flexShrink: 0,
    opacity: active ? 1 : 0.45
  };

  if (marker === 'solid' || marker === 'solid-texture') {
    return (
      <span
        className="cl-legend__marker"
        style={{
          ...baseStyle,
          borderRadius: chartTokens.radii.marker,
          background:
            marker === 'solid-texture'
              ? getFillStyleBackground('texture', color, strokeColor ?? color)
              : color,
          border: `1px solid ${strokeColor ?? color}`
        }}
      />
    );
  }

  const dashed = marker === 'line-dashed' || marker === 'dot-line-dashed' ? '4 3' : undefined;
  const hasDot = marker === 'dot-line' || marker === 'dot-line-dashed';

  return (
    <svg
      className="cl-legend__marker"
      width="24"
      height="12"
      viewBox="0 0 24 12"
      aria-hidden="true"
      style={{ opacity: active ? 1 : 0.45 }}
    >
      <line
        x1="1"
        y1="6"
        x2="23"
        y2="6"
        stroke={strokeColor ?? color}
        strokeWidth="2"
        strokeDasharray={dashed}
        strokeLinecap="round"
      />
      {hasDot && (
        <circle
          cx="12"
          cy="6"
          r="3"
          fill={chartTokens.neutral.white}
          stroke={strokeColor ?? color}
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

export function Legend({ items, title, orientation = 'horizontal', className }: LegendProps) {
  return (
    <div className={cx('cl-legend', orientation === 'stacked' && 'cl-legend--stacked', className)}>
      {title ? <p className="cl-legend__title">{title}</p> : null}
      <div className="cl-legend__items">
        {items.map((item) => (
          <div
            key={`${item.label}-${item.marker ?? 'solid'}`}
            className={cx('cl-legend__item', item.active === false && 'cl-legend__item--inactive')}
          >
            <LegendMarker
              color={item.color}
              strokeColor={item.strokeColor}
              marker={item.marker}
              active={item.active}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
