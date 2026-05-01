import { memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { geoAlbersUsa, geoMercator, geoPath } from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import countiesAtlas from 'us-atlas/counties-10m.json';
import statesAtlas from 'us-atlas/states-10m.json';
import { feature } from 'topojson-client';

import { chartTokens } from '../theme/tokens';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import { getStateFipsFromCode } from '../mapMetadata';
import type {
  BubbleStyle,
  ChartAccessibilityProps,
  FillStyleMode,
  LegendMarkerMode,
  LegendPosition,
  MapBubblePoint,
  TableConfig,
  ChartHeaderProps
} from '../types';
import {
  buildLegendItemsFromBubbles,
  formatTooltipValue,
  getEstimatedHoverCardHeight,
  getViewportHoverCardPosition,
  getSvgFillDefinition,
  resolveFillLegendMarker,
  resolveFillStyle
} from '../chartUtils';
import { useRafCallback } from '../utils/useRafCallback';
import {
  ChartLiveRegion,
  ChartSvgA11y,
  describeSegmentChart,
  getChartA11yContent,
  getChartA11yProps
} from '../utils/a11y';
import { useChartKeyboardNav } from '../utils/useChartKeyboardNav';
import { useReducedMotion } from '../utils/useReducedMotion';

const statesCollection = feature(statesAtlas as any, (statesAtlas as any).objects.states) as any;
const countiesCollection = feature(
  countiesAtlas as any,
  (countiesAtlas as any).objects.counties
) as any;

const mapInset = 10;

type BubbleMarker = 'solid' | 'solid-texture';

interface ProjectedBubble {
  point: MapBubblePoint;
  x: number;
  y: number;
  radius: number;
  fill: string;
  stroke: string;
  paintFill: string;
  resolvedFillStyle: FillStyleMode;
  resolvedBubbleStyle: BubbleStyle;
  marker: BubbleMarker;
}

interface MapPathItem {
  id: string;
  path: string;
}

interface HoveredBubbleState {
  point: MapBubblePoint;
  x: number;
  y: number;
  color: string;
  stroke?: string;
  marker: BubbleMarker;
}

function getSortedPoints(
  points: MapBubblePoint[],
  bubbleSort: 'none' | 'ascending' | 'descending'
) {
  if (bubbleSort === 'none') {
    return points;
  }

  const sorted = [...points].sort((left, right) => left.value - right.value);
  return bubbleSort === 'ascending' ? sorted : sorted.reverse();
}

function getBubbleRadius(
  value: number,
  minValue: number,
  maxValue: number,
  minRadius: number,
  maxRadius: number,
  sizeScale: 'linear' | 'sqrt'
) {
  if (maxValue <= minValue) {
    return (minRadius + maxRadius) / 2;
  }

  const ratio = (value - minValue) / (maxValue - minValue);
  const scaledRatio = sizeScale === 'sqrt' ? Math.sqrt(Math.max(ratio, 0)) : ratio;

  return minRadius + scaledRatio * (maxRadius - minRadius);
}

export interface MapBubbleChartProps extends ChartHeaderProps, ChartAccessibilityProps {
  title?: string;
  description?: string;
  points: MapBubblePoint[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  view?: 'map' | 'table';
  tableConfig?: TableConfig;
  regionScope?: 'us' | 'state';
  stateCode?: string;
  bubbleSort?: 'none' | 'ascending' | 'descending';
  sizeScale?: 'linear' | 'sqrt';
  minBubbleRadius?: number;
  maxBubbleRadius?: number;
  fillStyle?: FillStyleMode;
  legendMarker?: LegendMarkerMode;
  bubbleStyle?: BubbleStyle;
  backgroundFill?: string;
  landFill?: string;
  borderColor?: string;
  showCountyLines?: boolean;
  showBubbleShadow?: boolean;
  showHoverCard?: boolean;
}

export const MapBubbleChart = memo(function MapBubbleChart({
  title = 'Map Bubble Chart',
  description,
  points,
  width = 520,
  plotWidth = 472,
  plotHeight = 260,
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  showLegend = true,
  legendPosition = 'bottom',
  view = 'map',
  tableConfig,
  regionScope = 'us',
  stateCode,
  bubbleSort = 'descending',
  sizeScale = 'sqrt',
  minBubbleRadius = 3,
  maxBubbleRadius = 14,
  fillStyle = 'inherit',
  legendMarker = 'auto',
  bubbleStyle = 'both',
  backgroundFill = chartTokens.neutral.surfaceTint,
  landFill = chartTokens.neutral.stoneLighter,
  borderColor = chartTokens.neutral.mapBorder,
  showCountyLines = true,
  showBubbleShadow = true,
  showHoverCard = false,
  ariaLabel,
  ariaDescription,
  enableKeyboardNavigation = false,
  ...headerProps
}: MapBubbleChartProps) {
  const { actions: userActions = [], ...restHeaderProps } = headerProps;

  const mapIdBase = useId().replace(/:/g, '');
  const a11yTitleId = `${mapIdBase}-title`;
  const a11yDescriptionId = `${mapIdBase}-description`;
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredBubble, setHoveredBubble] = useState<HoveredBubbleState | null>(null);
  const hoverGenerationRef = useRef(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const reducedMotion = useReducedMotion();

  const handleZoomIn = useCallback(() => setZoomLevel((z) => Math.min(z + 0.5, 4)), []);
  const handleZoomOut = useCallback(() => setZoomLevel((z) => Math.max(z - 0.5, 1)), []);
  const handleResetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (zoomLevel <= 1) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    },
    [zoomLevel, panOffset]
  );

  const updatePanOffset = useRafCallback((x: number, y: number) => {
    setPanOffset((current) => (current.x === x && current.y === y ? current : { x, y }));
  });
  const updateBubbleHover = useRafCallback(
    (
      generation: number,
      nextMousePos: { x: number; y: number },
      nextBubble: HoveredBubbleState
    ) => {
      if (generation !== hoverGenerationRef.current) {
        return;
      }

      setMousePos((current) =>
        current?.x === nextMousePos.x && current.y === nextMousePos.y ? current : nextMousePos
      );
      setHoveredBubble((current) => {
        if (
          current?.point.key === nextBubble.point.key &&
          current.x === nextBubble.x &&
          current.y === nextBubble.y
        ) {
          return current;
        }

        return nextBubble;
      });
    }
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      updatePanOffset(e.clientX - dragStart.x, e.clientY - dragStart.y);
    },
    [dragStart, isDragging, updatePanOffset]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMapMouseLeave = useCallback(() => {
    hoverGenerationRef.current += 1;
    handleMouseUp();
    setHoveredBubble(null);
    setMousePos(null);
  }, [handleMouseUp]);

  const zoomActions: typeof userActions = [
    { id: 'zoom-in', label: 'Zoom in', onClick: handleZoomIn },
    { id: 'zoom-out', label: 'Zoom out', onClick: handleZoomOut },
    { id: 'restore', label: 'Reset view', onClick: handleResetView }
  ];
  const mergedActions = [...zoomActions, ...userActions];

  const selectedStateFips = useMemo(() => getStateFipsFromCode(stateCode), [stateCode]);
  const selectedStateFeature = useMemo(
    () =>
      regionScope === 'state' && selectedStateFips
        ? statesCollection.features.find(
            (featureItem: any) => String(featureItem.id).padStart(2, '0') === selectedStateFips
          )
        : null,
    [regionScope, selectedStateFips]
  );
  const visibleCounties = useMemo(
    () =>
      regionScope === 'state' && selectedStateFips
        ? countiesCollection.features.filter((featureItem: any) =>
            String(featureItem.id).padStart(5, '0').startsWith(selectedStateFips)
          )
        : [],
    [regionScope, selectedStateFips]
  );
  const projection = useMemo<GeoProjection>(
    () =>
      regionScope === 'state' && selectedStateFeature
        ? geoMercator().fitExtent(
            [
              [mapInset, mapInset],
              [plotWidth - mapInset, plotHeight - mapInset]
            ],
            selectedStateFeature as any
          )
        : geoAlbersUsa().fitExtent(
            [
              [mapInset, mapInset],
              [plotWidth - mapInset, plotHeight - mapInset]
            ],
            statesCollection as any
          ),
    [plotHeight, plotWidth, regionScope, selectedStateFeature]
  );
  const pathGenerator = useMemo(() => geoPath(projection as any), [projection]);
  const statePaths = useMemo<MapPathItem[]>(
    () =>
      statesCollection.features.map((featureItem: any) => ({
        id: String(featureItem.id),
        path: pathGenerator(featureItem) ?? ''
      })),
    [pathGenerator]
  );
  const countyPaths = useMemo<MapPathItem[]>(
    () =>
      visibleCounties.map((featureItem: any) => ({
        id: String(featureItem.id),
        path: pathGenerator(featureItem) ?? ''
      })),
    [pathGenerator, visibleCounties]
  );
  const selectedStatePath = useMemo(
    () => (selectedStateFeature ? (pathGenerator(selectedStateFeature) ?? '') : ''),
    [pathGenerator, selectedStateFeature]
  );
  const scopedPoints = useMemo(
    () =>
      regionScope === 'state' && stateCode
        ? points.filter((point) => point.stateCode?.toUpperCase() === stateCode.toUpperCase())
        : points,
    [points, regionScope, stateCode]
  );
  const renderPoints = useMemo(
    () => getSortedPoints(scopedPoints, bubbleSort),
    [bubbleSort, scopedPoints]
  );
  const a11yContent = useMemo(
    () =>
      getChartA11yContent({
        title,
        description,
        ariaLabel,
        ariaDescription,
        fallbackDescription: describeSegmentChart({
          chartType: regionScope === 'state' ? 'State map bubble chart' : 'Map bubble chart',
          segments: renderPoints.map((point) => ({
            label: point.label,
            value: point.value
          }))
        })
      }),
    [ariaDescription, ariaLabel, description, regionScope, renderPoints, title]
  );
  const chartA11yProps = getChartA11yProps({
    titleId: a11yTitleId,
    descriptionId: a11yDescriptionId,
    enableKeyboardNavigation
  });
  const { minValue, maxValue } = useMemo(() => {
    const pointValues = renderPoints.map((point) => point.value);
    return {
      minValue: pointValues.length ? Math.min(...pointValues) : 0,
      maxValue: pointValues.length ? Math.max(...pointValues) : 1
    };
  }, [renderPoints]);
  const projectedBubbles = useMemo<ProjectedBubble[]>(
    () =>
      renderPoints.flatMap((point, index) => {
        const palette =
          chartTokens.categorical.axisPalette[index % chartTokens.categorical.axisPalette.length];
        const resolvedFillStyle = resolveFillStyle(point.fillStyle ?? 'solid', fillStyle);
        const resolvedBubbleStyle = point.bubbleStyle ?? bubbleStyle;
        const resolvedFill = point.fill ?? palette.fill;
        const resolvedStroke = point.stroke ?? palette.stroke;
        const paint = getSvgFillDefinition(
          `map-bubble-fill-${point.key}`,
          resolvedFillStyle,
          resolvedFill,
          resolvedStroke
        );
        const projectedPoint =
          typeof point.longitude === 'number' && typeof point.latitude === 'number'
            ? projection([point.longitude, point.latitude] as [number, number])
            : typeof point.x === 'number' && typeof point.y === 'number'
              ? [(point.x / 100) * plotWidth, (point.y / 100) * plotHeight]
              : null;

        if (!projectedPoint) {
          return [];
        }

        const [x, y] = projectedPoint;
        return {
          point,
          x,
          y,
          radius: getBubbleRadius(
            point.value,
            minValue,
            maxValue,
            minBubbleRadius,
            maxBubbleRadius,
            sizeScale
          ),
          fill: resolvedFill,
          stroke: resolvedStroke,
          paintFill: paint.fill,
          resolvedFillStyle,
          resolvedBubbleStyle,
          marker: resolveFillLegendMarker(resolvedFillStyle, legendMarker) as BubbleMarker
        };
      }),
    [
      bubbleStyle,
      fillStyle,
      legendMarker,
      maxBubbleRadius,
      maxValue,
      minBubbleRadius,
      minValue,
      plotHeight,
      plotWidth,
      projection,
      renderPoints,
      sizeScale
    ]
  );
  const bubbleFillDefinitions = useMemo(
    () =>
      renderPoints.map((point, index) => {
        const palette =
          chartTokens.categorical.axisPalette[index % chartTokens.categorical.axisPalette.length];
        const resolvedFillStyle = resolveFillStyle(point.fillStyle ?? 'solid', fillStyle);
        return getSvgFillDefinition(
          `map-bubble-fill-${point.key}`,
          resolvedFillStyle,
          point.fill ?? palette.fill,
          point.stroke ?? palette.stroke
        ).definition;
      }),
    [fillStyle, renderPoints]
  );
  const legendItems = useMemo(
    () =>
      showLegend
        ? buildLegendItemsFromBubbles(
            renderPoints.map((point, index) => ({
              label: point.legendLabel ?? point.label,
              color:
                point.fill ??
                chartTokens.categorical.axisPalette[
                  index % chartTokens.categorical.axisPalette.length
                ].fill,
              strokeColor:
                point.stroke ??
                chartTokens.categorical.axisPalette[
                  index % chartTokens.categorical.axisPalette.length
                ].stroke,
              fillStyle: point.fillStyle,
              active: point.active
            })),
            fillStyle,
            legendMarker
          )
        : [],
    [fillStyle, legendMarker, renderPoints, showLegend]
  );
  const tableRows = useMemo(
    () =>
      tableConfig?.rows ??
      renderPoints.map((point) => [
        point.label,
        point.stateCode ?? 'US',
        point.legendLabel ?? 'Dataset',
        point.value
      ]),
    [renderPoints, tableConfig?.rows]
  );
  const keyboardNav = useChartKeyboardNav({
    items: projectedBubbles,
    enabled: enableKeyboardNavigation,
    getAnnouncement: (bubble, index) =>
      `${index + 1} of ${projectedBubbles.length}: ${bubble.point.label}, ${formatTooltipValue(bubble.point.value)}.`,
    onDismiss: () => {
      setHoveredBubble(null);
      setMousePos(null);
    }
  });
  const keyboardFocusedBubble =
    keyboardNav.focusedIndex != null ? projectedBubbles[keyboardNav.focusedIndex] : null;
  const activeBubble = useMemo<HoveredBubbleState | null>(
    () =>
      keyboardFocusedBubble
        ? {
            point: keyboardFocusedBubble.point,
            x: keyboardFocusedBubble.x,
            y: keyboardFocusedBubble.y,
            color: keyboardFocusedBubble.fill,
            stroke: keyboardFocusedBubble.stroke,
            marker: keyboardFocusedBubble.marker
          }
        : hoveredBubble,
    [hoveredBubble, keyboardFocusedBubble]
  );
  const activeRows = useMemo(
    () =>
      activeBubble?.point.details?.length
        ? activeBubble.point.details.map((detail, index) => ({
            label: detail.label,
            value:
              typeof detail.value === 'number' ? formatTooltipValue(detail.value) : detail.value,
            ...(index === 0
              ? {
                  color: activeBubble.color,
                  strokeColor: activeBubble.stroke,
                  marker: activeBubble.marker
                }
              : {})
          }))
        : activeBubble
          ? [
              {
                label: activeBubble.point.legendLabel ?? 'Dataset',
                value: activeBubble.point.stateCode ?? 'US',
                color: activeBubble.color,
                strokeColor: activeBubble.stroke,
                marker: activeBubble.marker
              },
              {
                label: 'Value',
                value: formatTooltipValue(activeBubble.point.value)
              }
            ]
          : [],
    [activeBubble]
  );
  const hoverCardPosition = useMemo(() => {
    if (!activeBubble) {
      return null;
    }

    if (keyboardFocusedBubble && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      return getViewportHoverCardPosition(
        rect.left + keyboardFocusedBubble.x,
        rect.top + keyboardFocusedBubble.y,
        196,
        getEstimatedHoverCardHeight(activeRows.length)
      );
    }

    return mousePos
      ? getViewportHoverCardPosition(
          mousePos.x,
          mousePos.y,
          196,
          getEstimatedHoverCardHeight(activeRows.length)
        )
      : null;
  }, [activeBubble, activeRows.length, keyboardFocusedBubble, mousePos]);

  return (
    <ChartShell
      width={width}
      showCardBackground={showCardBackground}
      showHeader={showHeader}
      showTitle={showTitle}
      title={title}
      legendItems={legendItems}
      legendPosition={legendPosition}
      description={description}
      actions={mergedActions}
      {...restHeaderProps}
    >
      {view === 'table' ? (
        <table className="cl-chart-table">
          <thead>
            <tr>
              {(tableConfig?.headers ?? ['Location', 'State', 'Dataset', 'Value']).map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr
                key={index}
                style={
                  index % 2 === 1 ? { backgroundColor: chartTokens.neutral.surfaceTint } : undefined
                }
              >
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ position: 'relative', width: plotWidth }}>
          <svg
            ref={svgRef}
            width={plotWidth}
            height={plotHeight}
            viewBox={`0 0 ${plotWidth} ${plotHeight}`}
            {...chartA11yProps}
            className="cl-chart-map"
            onKeyDown={keyboardNav.handlers.onKeyDown}
            onFocus={keyboardNav.handlers.onFocus}
            onBlur={keyboardNav.handlers.onBlur}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMapMouseLeave}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <ChartSvgA11y
              titleId={a11yTitleId}
              descriptionId={a11yDescriptionId}
              label={a11yContent.label}
              description={a11yContent.description}
            />
            <defs>
              <filter
                id={`${mapIdBase}-map-bubble-shadow`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="1.5"
                  floodColor={chartTokens.text.default}
                  floodOpacity="0.16"
                />
              </filter>
              <filter
                id={`${mapIdBase}-map-bubble-hover-shadow`}
                x="-70%"
                y="-70%"
                width="240%"
                height="240%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor={chartTokens.text.default}
                  floodOpacity="0.22"
                />
              </filter>
              {bubbleFillDefinitions}
            </defs>
            <g
              transform={`translate(${plotWidth / 2 + panOffset.x}, ${plotHeight / 2 + panOffset.y}) scale(${zoomLevel}) translate(${-plotWidth / 2}, ${-plotHeight / 2})`}
            >
              <rect
                x="0"
                y="0"
                width={plotWidth}
                height={plotHeight}
                rx="4"
                fill={backgroundFill}
              />
              {regionScope === 'state' && selectedStateFeature ? (
                <>
                  {showCountyLines ? (
                    countyPaths.map((featureItem) => (
                      <path
                        key={featureItem.id}
                        d={featureItem.path}
                        fill={landFill}
                        stroke={borderColor}
                        strokeWidth="0.6"
                      />
                    ))
                  ) : (
                    <path
                      d={selectedStatePath}
                      fill={landFill}
                      stroke={borderColor}
                      strokeWidth="0.8"
                    />
                  )}
                  <path
                    d={selectedStatePath}
                    fill="none"
                    stroke={chartTokens.text.subtle}
                    strokeWidth="1"
                  />
                </>
              ) : (
                statePaths.map((featureItem) => (
                  <path
                    key={featureItem.id}
                    d={featureItem.path}
                    fill={landFill}
                    stroke={borderColor}
                    strokeWidth="0.8"
                  />
                ))
              )}
              {projectedBubbles.map((bubble) => {
                const isHovered = showHoverCard && activeBubble?.point.key === bubble.point.key;
                const shadowId = isHovered
                  ? `${mapIdBase}-map-bubble-hover-shadow`
                  : `${mapIdBase}-map-bubble-shadow`;

                return (
                  <g
                    key={bubble.point.key}
                    style={{
                      cursor: showHoverCard ? 'pointer' : undefined,
                      transform: `translate(${bubble.x}px, ${bubble.y}px) scale(${isHovered ? 1.18 : 1})`,
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      transition: reducedMotion ? undefined : 'transform 140ms ease-out'
                    }}
                    onMouseMove={
                      showHoverCard
                        ? (event) => {
                            const svgRect =
                              event.currentTarget.ownerSVGElement?.getBoundingClientRect();

                            if (!svgRect) {
                              return;
                            }

                            updateBubbleHover(
                              hoverGenerationRef.current,
                              { x: event.clientX, y: event.clientY },
                              {
                                point: bubble.point,
                                x: event.clientX - svgRect.left,
                                y: event.clientY - svgRect.top,
                                color: bubble.fill,
                                stroke: bubble.stroke,
                                marker: bubble.marker
                              }
                            );
                          }
                        : undefined
                    }
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r={bubble.radius}
                      fill={
                        bubble.resolvedBubbleStyle === 'outlined'
                          ? chartTokens.neutral.white
                          : bubble.paintFill
                      }
                      stroke={bubble.resolvedBubbleStyle === 'filled' ? 'none' : bubble.stroke}
                      strokeWidth={bubble.resolvedBubbleStyle === 'filled' ? 0 : 2}
                      opacity={bubble.point.active === false ? 0.4 : 1.0}
                      filter={showBubbleShadow ? `url(#${shadowId})` : undefined}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
          <ChartLiveRegion announcement={keyboardNav.announcement} />
          {showHoverCard && activeBubble ? (
            <ChartHoverCard
              title={activeBubble.point.label}
              rows={activeRows}
              left={hoverCardPosition?.left ?? 12}
              top={hoverCardPosition?.top ?? 12}
            />
          ) : null}
        </div>
      )}
    </ChartShell>
  );
});
