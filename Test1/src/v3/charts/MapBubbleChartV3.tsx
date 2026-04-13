import { geoAlbersUsa, geoMercator, geoPath } from 'd3-geo';
import countiesAtlas from 'us-atlas/counties-10m.json';
import statesAtlas from 'us-atlas/states-10m.json';
import { feature } from 'topojson-client';

import { chartTokens } from '../../theme/tokens';
import { ChartShellV3 } from '../components/ChartShellV3';
import { getStateFipsFromCode } from '../mapMetadata';
import type {
  BubbleStyleV3,
  FillStyleModeV3,
  LegendMarkerModeV3,
  LegendPositionV3,
  MapBubblePointV3,
  TableConfigV3,
  V3HeaderProps
} from '../types';
import {
  buildLegendItemsFromBubbles,
  getSvgFillDefinition,
  resolveFillStyle
} from '../utils';

const statesCollection = feature(
  statesAtlas as any,
  (statesAtlas as any).objects.states
) as any;
const countiesCollection = feature(
  countiesAtlas as any,
  (countiesAtlas as any).objects.counties
) as any;

const mapInset = 10;

function getSortedPoints(
  points: MapBubblePointV3[],
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

export interface MapBubbleChartV3Props extends V3HeaderProps {
  title?: string;
  description?: string;
  points: MapBubblePointV3[];
  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;
  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPositionV3;
  view?: 'map' | 'table';
  tableConfig?: TableConfigV3;
  regionScope?: 'us' | 'state';
  stateCode?: string;
  bubbleSort?: 'none' | 'ascending' | 'descending';
  sizeScale?: 'linear' | 'sqrt';
  minBubbleRadius?: number;
  maxBubbleRadius?: number;
  fillStyle?: FillStyleModeV3;
  legendMarker?: LegendMarkerModeV3;
  bubbleStyle?: BubbleStyleV3;
  backgroundFill?: string;
  landFill?: string;
  borderColor?: string;
  showCountyLines?: boolean;
  showBubbleShadow?: boolean;
}

export function MapBubbleChartV3({
  title = 'Map Bubble Chart',
  description,
  points,
  width = 520,
  plotWidth = 420,
  plotHeight = 240,
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
  minBubbleRadius = 4,
  maxBubbleRadius = 20,
  fillStyle = 'inherit',
  legendMarker = 'auto',
  bubbleStyle = 'both',
  backgroundFill = chartTokens.neutral.surfaceTint,
  landFill = chartTokens.neutral.stoneLightest,
  borderColor = chartTokens.neutral.stoneLight,
  showCountyLines = true,
  showBubbleShadow = true,
  ...headerProps
}: MapBubbleChartV3Props) {
  const selectedStateFips = getStateFipsFromCode(stateCode);
  const selectedStateFeature =
    regionScope === 'state' && selectedStateFips
      ? statesCollection.features.find(
          (featureItem: any) =>
            String(featureItem.id).padStart(2, '0') === selectedStateFips
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
      ? points.filter(
          (point) => point.stateCode?.toUpperCase() === stateCode.toUpperCase()
        )
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
      {view === 'table' ? (
        <table className="cl-v3-table">
          <thead>
            <tr>
              {(tableConfig?.headers ?? ['Location', 'State', 'Dataset', 'Value']).map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <svg
          width={plotWidth}
          height={plotHeight}
          viewBox={`0 0 ${plotWidth} ${plotHeight}`}
          role="img"
          aria-label={title}
          className="cl-v3-map"
        >
          <rect
            x="1"
            y="1"
            width={plotWidth - 2}
            height={plotHeight - 2}
            rx="4"
            fill={backgroundFill}
            stroke={borderColor}
          />
          {regionScope === 'state' && selectedStateFeature ? (
            <>
              {showCountyLines
                ? visibleCounties.map((featureItem: any) => (
                    <path
                      key={String(featureItem.id)}
                      d={pathGenerator(featureItem) ?? ''}
                      fill={landFill}
                      stroke={borderColor}
                      strokeWidth="0.8"
                    />
                  ))
                : null}
              <path
                d={pathGenerator(selectedStateFeature) ?? ''}
                fill="none"
                stroke={chartTokens.text.default}
                strokeWidth="1.2"
              />
            </>
          ) : (
            statesCollection.features.map((featureItem: any) => (
              <path
                key={String(featureItem.id)}
                d={pathGenerator(featureItem) ?? ''}
                fill={landFill}
                stroke={borderColor}
                strokeWidth="0.9"
              />
            ))
          )}
          <defs>
            <filter id="map-bubble-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="1.5"
                floodColor="#1f1f1f"
                floodOpacity="0.16"
              />
            </filter>
            {renderPoints.map((point, index) => {
              const palette =
                chartTokens.categorical.axisPalette[
                  index % chartTokens.categorical.axisPalette.length
                ];
              const resolvedFillStyle = resolveFillStyle(
                point.fillStyle ?? 'solid',
                fillStyle
              );
              return getSvgFillDefinition(
                `map-bubble-fill-${point.key}`,
                resolvedFillStyle,
                point.fill ?? palette.fill,
                point.stroke ?? palette.stroke
              ).definition;
            })}
          </defs>
          {renderPoints.map((point, index) => {
            const palette =
              chartTokens.categorical.axisPalette[
                index % chartTokens.categorical.axisPalette.length
              ];
            const resolvedFillStyle = resolveFillStyle(
              point.fillStyle ?? 'solid',
              fillStyle
            );
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
                  ? [
                      (point.x / 100) * plotWidth,
                      (point.y / 100) * plotHeight
                    ]
                  : null;

            if (!projectedPoint) {
              return null;
            }

            const [x, y] = projectedPoint;
            const radius = getBubbleRadius(
              point.value,
              minValue,
              maxValue,
              minBubbleRadius,
              maxBubbleRadius,
              sizeScale
            );

            return (
              <circle
                key={point.key}
                cx={x}
                cy={y}
                r={radius}
                fill={
                  resolvedBubbleStyle === 'outlined'
                    ? '#ffffff'
                    : paint.fill
                }
                stroke={
                  resolvedBubbleStyle === 'filled'
                    ? 'none'
                    : resolvedStroke
                }
                strokeWidth={resolvedBubbleStyle === 'filled' ? 0 : 2}
                opacity={point.active === false ? 0.38 : 0.92}
                filter={showBubbleShadow ? 'url(#map-bubble-shadow)' : undefined}
              />
            );
          })}
        </svg>
      )}
    </ChartShellV3>
  );
}
