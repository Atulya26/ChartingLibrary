import { Fragment } from 'react';

import { chartTokens } from '../../theme/tokens';
import { ChartShellV3 } from '../components/ChartShellV3';
import type { GaugeRangeV3, V3HeaderProps } from '../types';
import {
  clamp,
  describeArcSegment,
  mapValueToAngle,
  polarToCartesian
} from '../utils';

export interface GaugeChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  target?: number;
  width?: number | string;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  leftLabel?: string;
  rightLabel?: string;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  ranges?: GaugeRangeV3[];
  valueColor?: string;
  showPointer?: boolean;
  showTargetMark?: boolean;
  roundedCaps?: boolean;
}

const defaultGaugeRanges: GaugeRangeV3[] = [
  { from: 0, to: 60, color: chartTokens.sequential.red.dark },
  { from: 60, to: 80, color: chartTokens.sequential.warning.default },
  { from: 80, to: 100, color: chartTokens.sequential.success.dark }
];

export function GaugeChartV3({
  title = 'Half Donut Gauge',
  description,
  value,
  min = 0,
  max = 100,
  target,
  width = 379,
  size = 220,
  thickness = 16,
  centerLabel,
  centerSubLabel,
  leftLabel,
  rightLabel,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  ranges = defaultGaugeRanges,
  valueColor,
  showPointer = false,
  showTargetMark = true,
  roundedCaps = true
}: GaugeChartV3Props) {
  const centerX = size / 2;
  const centerY = size * 0.74;
  const radius = size * 0.31;
  const startAngle = 270;
  const endAngle = 450;
  const clampedValue = clamp(value, min, max);
  const valueAngle = mapValueToAngle(clampedValue, min, max, startAngle, endAngle);
  const pointerTip = polarToCartesian(
    centerX,
    centerY,
    radius - thickness / 2,
    valueAngle
  );
  const pointerBase = polarToCartesian(centerX, centerY, 14, valueAngle + 180);
  const activeRange =
    ranges.find((range) => clampedValue >= range.from && clampedValue <= range.to) ??
    ranges[ranges.length - 1];
  const progressPath =
    clampedValue <= min
      ? null
      : describeArcSegment(centerX, centerY, radius, startAngle, valueAngle);

  return (
    <ChartShellV3
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      description={description}
    >
      <div className="cl-v3-gauge">
        <svg
          width={size}
          height={size * 0.78}
          viewBox={`0 0 ${size} ${size * 0.78}`}
          role="img"
          aria-label={title}
          style={{ overflow: 'visible' }}
        >
          <path
            d={describeArcSegment(centerX, centerY, radius, startAngle, endAngle)}
            fill="none"
            stroke={chartTokens.neutral.surfaceTint}
            strokeWidth={thickness}
            strokeLinecap={roundedCaps ? 'round' : undefined}
          />
          {progressPath ? (
            <path
              d={progressPath}
              fill="none"
              stroke={valueColor ?? activeRange.color}
              strokeWidth={thickness}
              strokeLinecap={roundedCaps ? 'round' : undefined}
            />
          ) : null}
          {typeof target === 'number' && showTargetMark ? (
            <Fragment>
              {(() => {
                const angle = mapValueToAngle(target, min, max, startAngle, endAngle);
                const outer = polarToCartesian(centerX, centerY, radius + thickness / 2 + 4, angle);
                const inner = polarToCartesian(centerX, centerY, radius - thickness / 2 - 4, angle);
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
              })()}
            </Fragment>
          ) : null}
          {showPointer ? (
            <Fragment>
              <line
                x1={pointerBase.x}
                y1={pointerBase.y}
                x2={pointerTip.x}
                y2={pointerTip.y}
                stroke={chartTokens.text.default}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx={centerX} cy={centerY} r="5" fill={chartTokens.text.default} />
            </Fragment>
          ) : null}
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
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="12"
            fontWeight="400"
            fill="#6a6b6d"
          >
            {centerSubLabel ?? 'Target'}
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
            {leftLabel ?? `${min}`}
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
            {rightLabel ?? `${max}`}
          </text>
        </svg>
      </div>
    </ChartShellV3>
  );
}
