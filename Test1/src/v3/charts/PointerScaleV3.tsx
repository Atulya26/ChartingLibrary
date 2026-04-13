import { chartTokens } from '../../theme/tokens';
import { ChartShellV3 } from '../components/ChartShellV3';
import type { PointerScaleRangeV3, V3HeaderProps } from '../types';
import {
  clamp,
  describeArcSegment,
  getPointerScaleStops,
  mapValueToAngle,
  polarToCartesian
} from '../utils';

export interface PointerScaleV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  target?: number;
  mode?: 'linear' | 'curved';
  width?: number | string;
  size?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  ranges?: PointerScaleRangeV3[];
  centerLabel?: string;
}

const defaultScaleRanges: PointerScaleRangeV3[] = [
  { from: 0, to: 33.33, color: chartTokens.sequential.default.light, label: 'Low' },
  { from: 33.33, to: 66.66, color: chartTokens.sequential.default.default, label: 'Medium' },
  { from: 66.66, to: 100, color: chartTokens.sequential.default.dark, label: 'High' }
];

export function PointerScaleV3({
  title = 'Pointer Scale',
  description,
  value,
  min = 0,
  max = 100,
  target,
  mode = 'linear',
  width = 379,
  size = 240,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  ranges = defaultScaleRanges,
  centerLabel
}: PointerScaleV3Props) {
  const stops = getPointerScaleStops(ranges);
  const clampedValue = clamp(value, min, max);
  const clampedTarget =
    typeof target === 'number' ? clamp(target, min, max) : undefined;

  return (
    <ChartShellV3
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      description={description}
    >
      {mode === 'linear' ? (
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
          <div className="cl-v3-pointer__labels">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      ) : (
        <div className="cl-v3-gauge">
          <svg
            width={size}
            height={size * 0.8}
            viewBox={`0 0 ${size} ${size * 0.8}`}
            role="img"
            aria-label={title}
          >
            {(() => {
              const centerX = size / 2;
              const centerY = size * 0.74;
              const radius = size * 0.31;
              const startAngle = 270;
              const endAngle = 450;
              const angle = mapValueToAngle(clampedValue, min, max, startAngle, endAngle);
              const tip = polarToCartesian(centerX, centerY, radius - 8, angle);
              const base = polarToCartesian(centerX, centerY, 18, angle + 180);
              return (
                <>
                  <path
                    d={describeArcSegment(centerX, centerY, radius, startAngle, endAngle)}
                    fill="none"
                    stroke={chartTokens.neutral.surfaceTint}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {stops.map((stop) => {
                    const segmentStart = mapValueToAngle(
                      stop.from,
                      min,
                      max,
                      startAngle,
                      endAngle
                    );
                    const segmentEnd = mapValueToAngle(
                      stop.to,
                      min,
                      max,
                      startAngle,
                      endAngle
                    );
                    return (
                      <path
                        key={`${stop.from}-${stop.to}`}
                        d={describeArcSegment(centerX, centerY, radius, segmentStart, segmentEnd)}
                        fill="none"
                        stroke={stop.color}
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  {typeof clampedTarget === 'number' ? (
                    (() => {
                      const targetAngle = mapValueToAngle(
                        clampedTarget,
                        min,
                        max,
                        startAngle,
                        endAngle
                      );
                      const inner = polarToCartesian(
                        centerX,
                        centerY,
                        radius - 14,
                        targetAngle
                      );
                      const outer = polarToCartesian(
                        centerX,
                        centerY,
                        radius + 10,
                        targetAngle
                      );
                      return (
                        <line
                          x1={inner.x}
                          y1={inner.y}
                          x2={outer.x}
                          y2={outer.y}
                          stroke={chartTokens.text.default}
                          strokeWidth="2"
                          strokeDasharray="5 4"
                        />
                      );
                    })()
                  ) : null}
                  <line
                    x1={base.x}
                    y1={base.y}
                    x2={tip.x}
                    y2={tip.y}
                    stroke={chartTokens.text.default}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx={centerX} cy={centerY} r="5" fill={chartTokens.text.default} />
                  <text
                    x={centerX}
                    y={centerY - 34}
                    textAnchor="middle"
                    fontFamily={chartTokens.fontFamily}
                    fontSize="20"
                    fontWeight="600"
                    fill="#242424"
                  >
                    {centerLabel ?? `${Math.round(clampedValue)}`}
                  </text>
                  <text
                    x={centerX - radius}
                    y={centerY + 18}
                    textAnchor="middle"
                    fontFamily={chartTokens.fontFamily}
                    fontSize="12"
                    fontWeight="400"
                    fill={chartTokens.text.subtle}
                  >
                    {min}
                  </text>
                  <text
                    x={centerX + radius}
                    y={centerY + 18}
                    textAnchor="middle"
                    fontFamily={chartTokens.fontFamily}
                    fontSize="12"
                    fontWeight="400"
                    fill={chartTokens.text.subtle}
                  >
                    {max}
                  </text>
                </>
              );
            })()}
          </svg>
        </div>
      )}
    </ChartShellV3>
  );
}
