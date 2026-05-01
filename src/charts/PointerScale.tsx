import { memo, useMemo, useRef, useState } from 'react';

import { chartTokens } from '../theme/tokens';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import type {
  ChartAccessibilityProps,
  LegendPosition,
  PointerScaleRange,
  ChartHeaderProps
} from '../types';
import {
  clamp,
  formatTooltipValue,
  getEstimatedHoverCardHeight,
  getViewportHoverCardPosition,
  getPointerScaleStops
} from '../chartUtils';
import {
  ChartLiveRegion,
  ChartRoleA11yContent,
  describeSingleValueChart,
  getChartA11yContent
} from '../utils/a11y';
import { useChartKeyboardNav } from '../utils/useChartKeyboardNav';

export interface PointerScaleProps extends ChartHeaderProps, ChartAccessibilityProps {
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
  legendPosition?: LegendPosition;
  ranges?: PointerScaleRange[];
  centerLabel?: string;
  showHoverCard?: boolean;
}

const defaultScaleRanges: PointerScaleRange[] = [
  { from: 0, to: 35, color: chartTokens.sequential.default.lightest, label: 'Low' },
  { from: 35, to: 70, color: chartTokens.sequential.default.default, label: 'Medium' },
  { from: 70, to: 100, color: chartTokens.sequential.default.darker, label: 'High' }
];

export const PointerScale = memo(function PointerScale({
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
  showHoverCard = false,
  ariaLabel,
  ariaDescription,
  enableKeyboardNavigation = false,
  ...headerProps
}: PointerScaleProps) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const a11yId = useMemo(() => title.replace(/\W+/g, '-').toLowerCase(), [title]);
  const a11yTitleId = `${a11yId || 'pointer-scale'}-title`;
  const a11yDescriptionId = `${a11yId || 'pointer-scale'}-description`;
  const stops = useMemo(() => getPointerScaleStops(ranges), [ranges]);
  const clampedValue = clamp(value, min, max);
  const clampedTarget = typeof target === 'number' ? clamp(target, min, max) : undefined;
  const a11yContent = useMemo(
    () =>
      getChartA11yContent({
        title,
        description,
        ariaLabel,
        ariaDescription,
        fallbackDescription: describeSingleValueChart({
          chartType: 'Pointer scale',
          value: clampedValue,
          min,
          max
        })
      }),
    [ariaDescription, ariaLabel, clampedValue, description, max, min, title]
  );
  const keyboardNav = useChartKeyboardNav({
    items: ranges,
    enabled: enableKeyboardNavigation,
    getAnnouncement: (range, index) =>
      `${index + 1} of ${ranges.length}: ${range.label ?? `${range.from} to ${range.to}`}. Current value ${formatTooltipValue(clampedValue)}.`,
    onDismiss: () => {
      setHovered(false);
      setMousePos(null);
    }
  });
  const showKeyboardFeedback = keyboardNav.focusedIndex !== null;
  const showInteractionFeedback = showHoverCard || showKeyboardFeedback;
  const activeRange = useMemo(
    () =>
      ranges.find((range) => clampedValue >= range.from && clampedValue <= range.to) ??
      ranges[ranges.length - 1],
    [clampedValue, ranges]
  );
  const hoverRows = useMemo(
    () => [
      {
        label: 'Current',
        value: centerLabel ?? formatTooltipValue(clampedValue),
        color: activeRange.color,
        marker: 'solid' as const
      },
      {
        label: 'Band',
        value: activeRange.label ?? `${activeRange.from}-${activeRange.to}`,
        color: activeRange.color,
        marker: 'solid' as const
      },
      ...(typeof clampedTarget === 'number'
        ? [
            {
              label: 'Target',
              value: formatTooltipValue(clampedTarget)
            }
          ]
        : []),
      {
        label: 'Scale',
        value: `${min} - ${max}`
      }
    ],
    [
      activeRange.color,
      activeRange.from,
      activeRange.label,
      activeRange.to,
      centerLabel,
      clampedTarget,
      clampedValue,
      max,
      min
    ]
  );
  const hoverCardPosition = useMemo(() => {
    if (mousePos) {
      return getViewportHoverCardPosition(
        mousePos.x,
        mousePos.y,
        196,
        getEstimatedHoverCardHeight(hoverRows.length)
      );
    }

    if (keyboardNav.focusedIndex === null || !containerRef.current) {
      return null;
    }

    const rect = containerRef.current.getBoundingClientRect();
    return getViewportHoverCardPosition(
      rect.left + rect.width / 2,
      rect.top + 36,
      196,
      getEstimatedHoverCardHeight(hoverRows.length)
    );
  }, [hoverRows.length, keyboardNav.focusedIndex, mousePos]);

  const legendItems = useMemo(
    () =>
      showLegend
        ? ranges.map((range) => ({
            label: range.label ?? `${range.from}-${range.to}`,
            marker: 'solid' as const,
            color: range.color,
            active: true
          }))
        : [],
    [ranges, showLegend]
  );

  return (
    <ChartShell
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
      {/* Chart inspection uses one focus target with role=img; arrow-key behavior is opt-in. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={containerRef}
        className="cl-chart-pointer"
        role="img"
        aria-labelledby={a11yTitleId}
        aria-describedby={a11yDescriptionId}
        {...(enableKeyboardNavigation ? { tabIndex: 0 } : {})}
        onKeyDown={keyboardNav.handlers.onKeyDown}
        onFocus={keyboardNav.handlers.onFocus}
        onBlur={keyboardNav.handlers.onBlur}
        style={{ position: 'relative' }}
        onMouseMove={
          showHoverCard
            ? (event) => {
                setHovered(true);
                setMousePos({ x: event.clientX, y: event.clientY });
              }
            : undefined
        }
        onMouseLeave={
          showHoverCard
            ? () => {
                setHovered(false);
                setMousePos(null);
              }
            : undefined
        }
      >
        <ChartRoleA11yContent
          labelId={a11yTitleId}
          descriptionId={a11yDescriptionId}
          label={a11yContent.label}
          description={a11yContent.description}
        />
        <ChartLiveRegion announcement={keyboardNav.announcement} />
        <div className="cl-chart-pointer__value">
          {centerLabel ?? `${Math.round(clampedValue)}`}
        </div>
        <div className="cl-chart-pointer__track">
          {stops.map((stop) => (
            <span
              key={`${stop.from}-${stop.to}`}
              className="cl-chart-pointer__segment"
              style={{
                width: `${((stop.to - stop.from) / (max - min || 1)) * 100}%`,
                background: stop.color
              }}
            />
          ))}
          <span
            className="cl-chart-pointer__needle"
            style={{
              left: `${((clampedValue - min) / (max - min || 1)) * 100}%`
            }}
          />
          {typeof clampedTarget === 'number' ? (
            <span
              className="cl-chart-pointer__target"
              style={{
                left: `${((clampedTarget - min) / (max - min || 1)) * 100}%`
              }}
            />
          ) : null}
        </div>
        <div
          className="cl-chart-pointer__range-labels"
          style={{ display: 'flex', marginTop: '4px' }}
        >
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
        <div className="cl-chart-pointer__labels">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        {showInteractionFeedback && (hovered || showKeyboardFeedback) ? (
          <ChartHoverCard
            title={title}
            rows={hoverRows}
            left={hoverCardPosition?.left ?? 0}
            top={hoverCardPosition?.top ?? 0}
          />
        ) : null}
      </div>
    </ChartShell>
  );
});
