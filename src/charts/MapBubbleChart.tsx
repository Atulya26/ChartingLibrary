import { useState, useCallback, useId } from 'react';
import type { MouseEvent } from 'react';
import { geoAlbersUsa, geoMercator, geoPath } from 'd3-geo';
import countiesAtlas from 'us-atlas/counties-10m.json';
import statesAtlas from 'us-atlas/states-10m.json';
import { feature } from 'topojson-client';

import { chartTokens } from '../theme/tokens';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import { getStateFipsFromCode } from '../mapMetadata';
import type {
  BubbleStyle,
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

const statesCollection = feature(statesAtlas as any, (statesAtlas as any).objects.states) as any;
const countiesCollection = feature(
  countiesAtlas as any,
  (countiesAtlas as any).objects.counties
) as any;

const mapInset = 10;

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

export interface MapBubbleChartProps extends ChartHeaderProps {
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

export function MapBubbleChart({
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
  ...headerProps
}: MapBubbleChartProps) {
  const { actions: userActions = [], ...restHeaderProps } = headerProps;

  const mapIdBase = useId().replace(/:/g, '');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredBubble, setHoveredBubble] = useState<{
    point: MapBubblePoint;
    x: number;
    y: number;
    color: string;
    stroke?: string;
    marker: 'solid' | 'solid-texture';
  } | null>(null);

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

  const handleMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const zoomActions: typeof userActions = [
    { id: 'zoom-in', label: 'Zoom in', onClick: handleZoomIn },
    { id: 'zoom-out', label: 'Zoom out', onClick: handleZoomOut },
    { id: 'restore', label: 'Reset view', onClick: handleResetView }
  ];
  const mergedActions = [...zoomActions, ...userActions];

  const selectedStateFips = getStateFipsFromCode(stateCode);
  const selectedStateFeature =
    regionScope === 'state' && selectedStateFips
      ? statesCollection.features.find(
          (featureItem: any) => String(featureItem.id).padStart(2, '0') === selectedStateFips
        )
      : null;
  const visibleCounties =
    regionScope === 'state' && selectedStateFips
      ? countiesCollection.features.filter((featureItem: any) =>
          String(featureItem.id).padStart(5, '0').startsWith(selectedStateFips)
        )
      : [];
  const projection =
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
        );
  const pathGenerator = geoPath(projection as any);
  const scopedPoints =
    regionScope === 'state' && stateCode
      ? points.filter((point) => point.stateCode?.toUpperCase() === stateCode.toUpperCase())
      : points;
  const renderPoints = getSortedPoints(scopedPoints, bubbleSort);
  const pointValues = renderPoints.map((point) => point.value);
  const minValue = pointValues.length ? Math.min(...pointValues) : 0;
  const maxValue = pointValues.length ? Math.max(...pointValues) : 1;
  const legendItems = showLegend
    ? buildLegendItemsFromBubbles(
        renderPoints.map((point, index) => ({
          label: point.legendLabel ?? point.label,
          color:
            point.fill ??
            chartTokens.categorical.axisPalette[index % chartTokens.categorical.axisPalette.length]
              .fill,
          strokeColor:
            point.stroke ??
            chartTokens.categorical.axisPalette[index % chartTokens.categorical.axisPalette.length]
              .stroke,
          fillStyle: point.fillStyle,
          active: point.active
        })),
        fillStyle,
        legendMarker
      )
    : [];
  const tableRows =
    tableConfig?.rows ??
    renderPoints.map((point) => [
      point.label,
      point.stateCode ?? 'US',
      point.legendLabel ?? 'Dataset',
      point.value
    ]);
  const hoveredRows = hoveredBubble?.point.details?.length
    ? hoveredBubble.point.details.map((detail, index) => ({
        label: detail.label,
        value: typeof detail.value === 'number' ? formatTooltipValue(detail.value) : detail.value,
        ...(index === 0
          ? {
              color: hoveredBubble.color,
              strokeColor: hoveredBubble.stroke,
              marker: hoveredBubble.marker
            }
          : {})
      }))
    : hoveredBubble
      ? [
          {
            label: hoveredBubble.point.legendLabel ?? 'Dataset',
            value: hoveredBubble.point.stateCode ?? 'US',
            color: hoveredBubble.color,
            strokeColor: hoveredBubble.stroke,
            marker: hoveredBubble.marker
          },
          {
            label: 'Value',
            value: formatTooltipValue(hoveredBubble.point.value)
          }
        ]
      : [];
  const hoverCardPosition =
    hoveredBubble && mousePos
      ? getViewportHoverCardPosition(
          mousePos.x,
          mousePos.y,
          196,
          getEstimatedHoverCardHeight(hoveredRows.length)
        )
      : null;

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
            width={plotWidth}
            height={plotHeight}
            viewBox={`0 0 ${plotWidth} ${plotHeight}`}
            role="img"
            aria-label={title}
            className="cl-chart-map"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              handleMouseUp();
              setHoveredBubble(null);
              setMousePos(null);
            }}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
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
              {renderPoints.map((point, index) => {
                const palette =
                  chartTokens.categorical.axisPalette[
                    index % chartTokens.categorical.axisPalette.length
                  ];
                const resolvedFillStyle = resolveFillStyle(point.fillStyle ?? 'solid', fillStyle);
                return getSvgFillDefinition(
                  `map-bubble-fill-${point.key}`,
                  resolvedFillStyle,
                  point.fill ?? palette.fill,
                  point.stroke ?? palette.stroke
                ).definition;
              })}
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
                    visibleCounties.map((featureItem: any) => (
                      <path
                        key={String(featureItem.id)}
                        d={pathGenerator(featureItem) ?? ''}
                        fill={landFill}
                        stroke={borderColor}
                        strokeWidth="0.6"
                      />
                    ))
                  ) : (
                    <path
                      d={pathGenerator(selectedStateFeature) ?? ''}
                      fill={landFill}
                      stroke={borderColor}
                      strokeWidth="0.8"
                    />
                  )}
                  <path
                    d={pathGenerator(selectedStateFeature) ?? ''}
                    fill="none"
                    stroke={chartTokens.text.subtle}
                    strokeWidth="1"
                  />
                </>
              ) : (
                statesCollection.features.map((featureItem: any) => (
                  <path
                    key={String(featureItem.id)}
                    d={pathGenerator(featureItem) ?? ''}
                    fill={landFill}
                    stroke={borderColor}
                    strokeWidth="0.8"
                  />
                ))
              )}
              {renderPoints.map((point, index) => {
                const palette =
                  chartTokens.categorical.axisPalette[
                    index % chartTokens.categorical.axisPalette.length
                  ];
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
                  return null;
                }

                const [x, y] = projectedPoint;
                const isHovered = showHoverCard && hoveredBubble?.point.key === point.key;
                const shadowId = isHovered
                  ? `${mapIdBase}-map-bubble-hover-shadow`
                  : `${mapIdBase}-map-bubble-shadow`;
                const radius = getBubbleRadius(
                  point.value,
                  minValue,
                  maxValue,
                  minBubbleRadius,
                  maxBubbleRadius,
                  sizeScale
                );

                return (
                  <g
                    key={point.key}
                    style={{
                      cursor: showHoverCard ? 'pointer' : undefined,
                      transform: `translate(${x}px, ${y}px) scale(${isHovered ? 1.18 : 1})`,
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      transition: 'transform 140ms ease-out'
                    }}
                    onMouseMove={
                      showHoverCard
                        ? (event) => {
                            const svgRect =
                              event.currentTarget.ownerSVGElement?.getBoundingClientRect();

                            if (!svgRect) {
                              return;
                            }

                            setMousePos({ x: event.clientX, y: event.clientY });
                            setHoveredBubble({
                              point,
                              x: event.clientX - svgRect.left,
                              y: event.clientY - svgRect.top,
                              color: resolvedFill,
                              stroke: resolvedStroke,
                              marker: resolveFillLegendMarker(resolvedFillStyle, legendMarker) as
                                | 'solid'
                                | 'solid-texture'
                            });
                          }
                        : undefined
                    }
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r={radius}
                      fill={
                        resolvedBubbleStyle === 'outlined' ? chartTokens.neutral.white : paint.fill
                      }
                      stroke={resolvedBubbleStyle === 'filled' ? 'none' : resolvedStroke}
                      strokeWidth={resolvedBubbleStyle === 'filled' ? 0 : 2}
                      opacity={point.active === false ? 0.4 : 1.0}
                      filter={showBubbleShadow ? `url(#${shadowId})` : undefined}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
          {showHoverCard && hoveredBubble ? (
            <ChartHoverCard
              title={hoveredBubble.point.label}
              rows={hoveredRows}
              left={hoverCardPosition?.left ?? 12}
              top={hoverCardPosition?.top ?? 12}
            />
          ) : null}
        </div>
      )}
    </ChartShell>
  );
}
