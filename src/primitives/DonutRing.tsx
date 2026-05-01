import { memo, useId } from 'react';

import { chartTokens } from '../theme/tokens';
import type { DonutSegment } from '../types';
import { formatNumberCompact } from '../utils/chart';

export interface DonutRingProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  showOutsideLabels?: boolean;
}

export const DonutRing = memo(function DonutRing({
  segments,
  size = 150,
  thickness = 16,
  centerLabel,
  centerSubLabel,
  showOutsideLabels = true
}: DonutRingProps) {
  const id = useId().replace(/:/g, '');
  const center = size / 2;
  const radius = center - thickness / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    1
  );

  let cumulative = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {segments.map((segment, index) =>
          segment.fillStyle === 'texture' ? (
            <pattern
              id={`texture-${id}-${index}`}
              key={`texture-${index}`}
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <rect width="8" height="8" fill={chartTokens.neutral.white} fillOpacity="0" />
              <line x1="0" y1="0" x2="0" y2="8" stroke={segment.color} strokeWidth="4" />
            </pattern>
          ) : null
        )}
      </defs>
      {segments.map((segment, index) => {
        const length = (segment.value / total) * circumference;
        const dashArray = `${length} ${circumference - length}`;
        const dashOffset = -((cumulative / total) * circumference);
        const segmentStart = cumulative;
        const segmentMid = segmentStart + segment.value / 2;
        cumulative += segment.value;
        const angle = (segmentMid / total) * Math.PI * 2 - Math.PI / 2;
        const labelRadius = radius + thickness / 2 + 18;
        const labelX = center + Math.cos(angle) * labelRadius;
        const labelY = center + Math.sin(angle) * labelRadius;
        const stroke =
          segment.fillStyle === 'texture' ? `url(#texture-${id}-${index})` : segment.color;

        return (
          <g key={`${segment.label}-${index}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth={thickness}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${center} ${center})`}
              opacity={segment.active === false ? 0.4 : 1}
            />
            {showOutsideLabels && segment.showLabel !== false ? (
              <text
                x={labelX}
                y={labelY}
                fontFamily={chartTokens.fontFamily}
                fontSize="12"
                fontWeight="600"
                fill={chartTokens.text.chartLabel}
                textAnchor={labelX > center ? 'start' : 'end'}
                dominantBaseline="middle"
              >
                {formatNumberCompact(segment.value)}
              </text>
            ) : null}
          </g>
        );
      })}
      {centerLabel ? (
        <>
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="20"
            fontWeight="600"
            fill={chartTokens.text.chartLabel}
          >
            {centerLabel}
          </text>
          {centerSubLabel ? (
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              fontFamily={chartTokens.fontFamily}
              fontSize="12"
              fontWeight="400"
              fill={chartTokens.text.chartHelper}
            >
              {centerSubLabel}
            </text>
          ) : null}
        </>
      ) : null}
    </svg>
  );
});
