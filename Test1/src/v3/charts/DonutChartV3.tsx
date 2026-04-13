import { Fragment, useId } from 'react';
import type { ReactNode } from 'react';

import { chartTokens } from '../../theme/tokens';
import { formatNumberCompact } from '../../utils/chart';
import { ChartShellV3 } from '../components/ChartShellV3';
import type {
  DonutSegmentV3,
  FillStyleModeV3,
  LegendPositionV3,
  LegendMarkerModeV3,
  V3HeaderProps
} from '../types';
import {
  buildLegendItemsFromDonutSegments,
  getDonutLabel,
  getSvgFillDefinition,
  resolveFillStyle
} from '../utils';

export interface DonutChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  segments: DonutSegmentV3[];
  width?: number | string;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  showTitle?: boolean;
  showLabels?: boolean;
  legendPosition?: LegendPositionV3;
  labelMode?: 'value' | 'percent' | 'label' | 'label-percent';
  fillStyle?: FillStyleModeV3;
  legendMarker?: LegendMarkerModeV3;
  roundedCaps?: boolean;
}

export function DonutChartV3({
  title = 'Pie Chart Example',
  description,
  segments,
  width = 379,
  size = 180,
  thickness = 16,
  centerLabel,
  centerSubLabel,
  showCardBackground = true,
  showHeader = true,
  showLegend = true,
  showTitle = true,
  showLabels = true,
  legendPosition = 'bottom',
  labelMode = 'value',
  fillStyle = 'inherit',
  legendMarker = 'auto',
  roundedCaps = true,
  ...headerProps
}: DonutChartV3Props) {
  const total = Math.max(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    1
  );
  const svgId = useId().replace(/:/g, '');
  const legendItems = showLegend
    ? buildLegendItemsFromDonutSegments(segments, fillStyle, legendMarker)
    : [];
  const center = size / 2;
  const radius = center - thickness / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const defs: ReactNode[] = [];
  let cumulative = 0;
  const gapLength = roundedCaps ? Math.max(thickness * 0.7, 6) : 0;

  return (
    <ChartShellV3
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      legendItems={legendItems}
      legendPosition={legendPosition}
      description={description}
      {...headerProps}
    >
      <div className="cl-v3-donut">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={title}
          style={{ overflow: 'visible' }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={chartTokens.neutral.surfaceTint}
            strokeWidth={thickness}
          />
          {segments.map((segment, index) => {
            const resolvedFillStyle = resolveFillStyle(
              segment.fillStyle ?? 'solid',
              fillStyle
            );
            const paintId = `donut-v3-${svgId}-${index}`;
            const paint = getSvgFillDefinition(
              paintId,
              resolvedFillStyle,
              segment.color,
              segment.strokeColor ?? segment.color
            );
            const length = (segment.value / total) * circumference;
            const visibleLength = Math.max(length - gapLength, 0);
            const dashArray = `${visibleLength} ${Math.max(circumference - visibleLength, 0)}`;
            const dashOffset = -((cumulative / total) * circumference);
            const segmentStart = cumulative;
            const segmentMid = segmentStart + segment.value / 2;
            cumulative += segment.value;
            const angle = (segmentMid / total) * Math.PI * 2 - Math.PI / 2;
            const labelRadius = radius + thickness / 2 + 18;
            const labelX = center + Math.cos(angle) * labelRadius;
            const labelY = center + Math.sin(angle) * labelRadius;

            if (paint.definition) {
              defs.push(paint.definition);
            }

            return (
              <Fragment key={`${segment.label}-${index}`}>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={paint.fill}
                  strokeWidth={thickness}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${center} ${center})`}
                  opacity={segment.active === false ? 0.4 : 1}
                  strokeLinecap={roundedCaps ? 'round' : undefined}
                />
                {showLabels && segment.showLabel !== false ? (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor={labelX > center ? 'start' : 'end'}
                    dominantBaseline="middle"
                    fontFamily={chartTokens.fontFamily}
                    fontSize="12"
                    fontWeight="600"
                    fill="#242424"
                  >
                    {getDonutLabel(segment, total, labelMode)}
                  </text>
                ) : null}
              </Fragment>
            );
          })}
          <defs>{defs}</defs>
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="20"
            fontWeight="600"
            fill="#242424"
          >
            {centerLabel ?? `${formatNumberCompact(total)}M`}
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            fontFamily={chartTokens.fontFamily}
            fontSize="12"
            fontWeight="400"
            fill="#6a6b6d"
          >
            {centerSubLabel ?? 'Target'}
          </text>
        </svg>
      </div>
    </ChartShellV3>
  );
}
