import { memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { chartTokens } from '../theme/tokens';
import { ChartHoverCard } from '../components/ChartHoverCard';
import type { ChartAccessibilityProps } from '../types';
import {
  buildLinePoints,
  describeAreaPath,
  describeLinePath,
  formatTooltipValue,
  getDotRadius,
  getEstimatedHoverCardHeight,
  getHoverIndex,
  getViewportHoverCardPosition
} from '../chartUtils';
import {
  ChartLiveRegion,
  ChartSvgA11y,
  describeSingleValueChart,
  getChartA11yContent,
  getChartA11yProps
} from '../utils/a11y';
import { useChartKeyboardNav } from '../utils/useChartKeyboardNav';

export interface SparklineProps extends ChartAccessibilityProps {
  title?: string;
  values: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showHoverCard?: boolean;
  /** Render a translucent area fill under the line. */
  showAreaFill?: boolean;
  /** Render a dot at the final data point — useful for "latest value" emphasis. */
  showEndDot?: boolean;
  /** Render a small dot at every data point. */
  showDots?: boolean;
}

/**
 * Sparkline-local extent. Unlike line charts, sparklines do not include 0 in the
 * y-scale — that would flatten any realistic KPI trend (e.g. 1028→1052) into a
 * single row of pixels. This uses the natural min/max of the values so the curve
 * fills the canvas. A tiny padding is added to avoid a perfectly flat bottom
 * when values are identical.
 */
function getSparklineExtent(values: number[]) {
  if (!values.length) {
    return { min: 0, max: 1 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }
  return { min, max };
}

export const Sparkline = memo(function Sparkline({
  title = 'Sparkline',
  values,
  labels,
  width = 84,
  height = 28,
  color = chartTokens.sequential.default.dark,
  strokeWidth = 1.5,
  showHoverCard = false,
  showAreaFill = false,
  showEndDot = false,
  showDots = false,
  ariaLabel,
  ariaDescription,
  enableKeyboardNavigation = false
}: SparklineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgId = useId().replace(/:/g, '');
  const a11yTitleId = `${svgId}-title`;
  const a11yDescriptionId = `${svgId}-description`;
  const extent = useMemo(() => getSparklineExtent(values), [values]);
  const points = useMemo(
    () => buildLinePoints(values, width, height, extent.min, extent.max, 2),
    [extent.max, extent.min, height, values, width]
  );
  const lastPoint = useMemo(() => (points.length ? points[points.length - 1] : null), [points]);
  const a11yContent = useMemo(
    () =>
      getChartA11yContent({
        title,
        ariaLabel,
        ariaDescription,
        fallbackDescription: describeSingleValueChart({
          chartType: 'Sparkline',
          value: values[values.length - 1] ?? 0
        })
      }),
    [ariaDescription, ariaLabel, title, values]
  );
  const chartA11yProps = getChartA11yProps({
    titleId: a11yTitleId,
    descriptionId: a11yDescriptionId,
    enableKeyboardNavigation
  });
  const keyboardNav = useChartKeyboardNav({
    items: points,
    enabled: enableKeyboardNavigation,
    getAnnouncement: (point, index) =>
      `${index + 1} of ${points.length}: ${labels?.[index] ?? `Point ${index + 1}`}, ${formatTooltipValue(point.value)}.`,
    onDismiss: () => {
      setHoveredIndex(null);
      setMousePos(null);
    }
  });
  const activeIndex = keyboardNav.focusedIndex ?? hoveredIndex;
  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const showKeyboardFeedback = keyboardNav.focusedIndex !== null;
  const showInteractionFeedback = showHoverCard || showKeyboardFeedback;
  const hoverCardPosition = useMemo(() => {
    if (mousePos) {
      return getViewportHoverCardPosition(
        mousePos.x,
        mousePos.y,
        196,
        getEstimatedHoverCardHeight(1)
      );
    }

    if (!activePoint || keyboardNav.focusedIndex === null || !containerRef.current) {
      return null;
    }

    const rect = containerRef.current.getBoundingClientRect();
    return getViewportHoverCardPosition(
      rect.left + activePoint.x,
      rect.top + activePoint.y,
      196,
      getEstimatedHoverCardHeight(1)
    );
  }, [activePoint, keyboardNav.focusedIndex, mousePos]);
  const areaGradientId = `cl-sparkline-area-${svgId}`;
  const linePath = useMemo(() => describeLinePath(points), [points]);
  const areaPath = useMemo(() => describeAreaPath(points, height), [height, points]);
  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoveredIndex(getHoverIndex(event.clientX - rect.left, width, values.length));
      setMousePos({ x: event.clientX, y: event.clientY });
    },
    [values.length, width]
  );
  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setMousePos(null);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width, height }}
      onMouseMove={showHoverCard ? handleMouseMove : undefined}
      onMouseLeave={showHoverCard ? handleMouseLeave : undefined}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        {...chartA11yProps}
        onKeyDown={keyboardNav.handlers.onKeyDown}
        onFocus={keyboardNav.handlers.onFocus}
        onBlur={keyboardNav.handlers.onBlur}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <ChartSvgA11y
          titleId={a11yTitleId}
          descriptionId={a11yDescriptionId}
          label={a11yContent.label}
          description={a11yContent.description}
        />
        {showAreaFill ? (
          <defs>
            <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
        ) : null}
        {showAreaFill && points.length ? (
          <path d={areaPath} fill={`url(#${areaGradientId})`} stroke="none" />
        ) : null}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots
          ? points.map((point, index) => (
              <circle
                key={`dot-${index}`}
                cx={point.x}
                cy={point.y}
                r={getDotRadius('small')}
                fill={color}
              />
            ))
          : null}
        {showEndDot && lastPoint ? (
          <>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={getDotRadius('small') + 1.5}
              fill={chartTokens.neutral.white}
              stroke={color}
              strokeWidth={1.5}
            />
            <circle cx={lastPoint.x} cy={lastPoint.y} r={getDotRadius('small')} fill={color} />
          </>
        ) : null}
        {showInteractionFeedback && activePoint ? (
          <>
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={getDotRadius('small') + 2}
              fill={chartTokens.neutral.white}
              stroke={color}
              strokeWidth={2}
            />
            <circle cx={activePoint.x} cy={activePoint.y} r={getDotRadius('small')} fill={color} />
          </>
        ) : null}
      </svg>
      <ChartLiveRegion announcement={keyboardNav.announcement} />
      {showInteractionFeedback && activePoint && activeIndex !== null ? (
        <ChartHoverCard
          title={labels?.[activeIndex] ?? `Point ${activeIndex + 1}`}
          rows={[
            {
              label: 'Value',
              value: formatTooltipValue(activePoint.value),
              color,
              strokeColor: color,
              marker: 'line'
            }
          ]}
          left={hoverCardPosition?.left ?? 12}
          top={hoverCardPosition?.top ?? 12}
        />
      ) : null}
    </div>
  );
});
