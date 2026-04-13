import { chartTokens } from '../../theme/tokens';
import { ChartShellV3 } from '../components/ChartShellV3';
import type { LegendPositionV3, PointerScaleRangeV3, V3HeaderProps } from '../types';
import { clamp, getPointerScaleStops } from '../utils';

export interface PointerScaleV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  target?: number;
  width?: number | string;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPositionV3;
  ranges?: PointerScaleRangeV3[];
  centerLabel?: string;
}

const defaultScaleRanges: PointerScaleRangeV3[] = [
  { from: 0, to: 33.33, color: chartTokens.sequential.red.dark, label: 'Low' },
  { from: 33.33, to: 66.66, color: chartTokens.sequential.warning.default, label: 'Medium' },
  { from: 66.66, to: 100, color: chartTokens.sequential.success.dark, label: 'High' }
];

export function PointerScaleV3({
  title = 'Pointer Scale',
  description,
  value,
  min = 0,
  max = 100,
  target,
  width = 379,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  showLegend = true,
  legendPosition = 'bottom',
  ranges = defaultScaleRanges,
  centerLabel,
  ...headerProps
}: PointerScaleV3Props) {
  const stops = getPointerScaleStops(ranges);
  const clampedValue = clamp(value, min, max);
  const clampedTarget =
    typeof target === 'number' ? clamp(target, min, max) : undefined;

  const legendItems = showLegend ? ranges.map(range => ({
    label: range.label ?? `${range.from}-${range.to}`,
    marker: 'solid' as const,
    color: range.color,
    active: true
  })) : [];

  return (
    <ChartShellV3
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      description={description}
      legendItems={legendItems}
      legendPosition={legendPosition}
      {...headerProps}
    >
      <div className="cl-v3-pointer">
        <div className="cl-v3-pointer__value">{centerLabel ?? `${Math.round(clampedValue)}`}</div>
        <div className="cl-v3-pointer__track">
          {stops.map((stop) => (
            <span
              key={`${stop.from}-${stop.to}`}
              className="cl-v3-pointer__segment"
              style={{
                width: `${((stop.to - stop.from) / (max - min || 1)) * 100}%`,
                background: stop.color
              }}
            />
          ))}
          <span
            className="cl-v3-pointer__needle"
            style={{
              left: `${((clampedValue - min) / (max - min || 1)) * 100}%`
            }}
          />
          {typeof clampedTarget === 'number' ? (
            <span
              className="cl-v3-pointer__target"
              style={{
                left: `${((clampedTarget - min) / (max - min || 1)) * 100}%`
              }}
            />
          ) : null}
        </div>
        <div className="cl-v3-pointer__range-labels" style={{ display: 'flex', marginTop: '4px' }}>
          {stops.map((stop) => (
            <span
              key={`label-${stop.from}-${stop.to}`}
              style={{
                width: `${((stop.to - stop.from) / (max - min || 1)) * 100}%`,
                textAlign: 'center',
                fontSize: '11px',
                color: chartTokens.text.subtle,
                fontFamily: chartTokens.fontFamily
              }}
            >
              {stop.label}
            </span>
          ))}
        </div>
        <div className="cl-v3-pointer__labels">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </ChartShellV3>
  );
}
