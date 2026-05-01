import { Fragment, memo, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { chartTokens } from '../theme/tokens';
import { ChartHoverCard } from '../components/ChartHoverCard';
import { ChartShell } from '../components/ChartShell';
import { formatNumberCompact } from '../utils/chart';
import type {
  ChartHeaderProps,
  LegendItem,
  LegendPosition,
  SankeyHighlightMode,
  SankeyLink,
  SankeyLinkColorMode,
  SankeyNode,
  SankeyNodeAlignment
} from '../types';
import {
  formatTooltipValue,
  getEstimatedHoverCardHeight,
  getViewportHoverCardPosition
} from '../chartUtils';
import { describeSankeyRibbon, layoutSankey } from '../sankeyLayout';

export interface SankeyChartProps extends ChartHeaderProps {
  title?: string;
  description?: string;
  nodes: SankeyNode[];
  links: SankeyLink[];

  width?: number | string;
  plotWidth?: number;
  plotHeight?: number;

  showCardBackground?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;

  /** Width of each node rectangle in pixels. */
  nodeWidth?: number;
  /** Vertical pixel gap between nodes in the same column. */
  nodePadding?: number;
  /** Corner radius on node rectangles. */
  nodeCornerRadius?: number;
  /** Controls how unconstrained nodes align horizontally. */
  nodeAlignment?: SankeyNodeAlignment;
  /** Show a 1-line label next to each node. */
  showNodeLabels?: boolean;
  /** Show the node's value below its label. */
  showNodeValues?: boolean;

  /** How link colors are resolved. `source` uses the source node's color, `target` the target's, `gradient` fades source→target, `neutral` uses a single soft gray. */
  linkColorMode?: SankeyLinkColorMode;
  /** Base link fill opacity when no hover is active. */
  linkOpacity?: number;
  /** Opacity applied to unrelated links when something is hovered. */
  linkDimmedOpacity?: number;
  /** What gets highlighted on hover: the hovered ribbon only, all ribbons touching a node, or the full upstream+downstream flow. */
  highlightMode?: SankeyHighlightMode;

  /** Neutral fallback color for `linkColorMode: 'neutral'`. */
  neutralLinkColor?: string;

  showHoverCard?: boolean;

  onLinkClick?: (link: SankeyLink) => void;
  onNodeClick?: (node: SankeyNode) => void;
}

const DEFAULT_PALETTE = chartTokens.categorical.axisPalette;

function resolveNodeColor(node: SankeyNode, index: number): string {
  return node.fill ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length].fill;
}

function resolveNodeStroke(node: SankeyNode, index: number): string {
  return node.stroke ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length].stroke;
}

export const SankeyChart = memo(function SankeyChart({
  title = 'Sankey Chart',
  description,
  nodes,
  links,

  width = 640,
  plotWidth = 560,
  plotHeight = 320,

  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  showLegend = true,
  legendPosition = 'bottom',

  nodeWidth = 6,
  nodePadding = 32,
  nodeCornerRadius = 0,
  nodeAlignment = 'center',
  showNodeLabels = true,
  showNodeValues = false,

  linkColorMode = 'gradient',
  linkOpacity = 0.42,
  linkDimmedOpacity = 0.08,
  highlightMode = 'link',
  neutralLinkColor = chartTokens.neutral.stoneLight,

  showHoverCard = false,
  onLinkClick,
  onNodeClick,
  ...headerProps
}: SankeyChartProps) {
  const svgId = useId().replace(/:/g, '');
  const [hoveredLinkIdx, setHoveredLinkIdx] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const layout = useMemo(
    () =>
      layoutSankey({
        nodes,
        links,
        plotWidth,
        plotHeight,
        nodeWidth,
        nodePadding,
        alignment: nodeAlignment
      }),
    [nodes, links, plotWidth, plotHeight, nodeWidth, nodePadding, nodeAlignment]
  );

  const nodeIndexById = useMemo(() => {
    const m = new Map<string, number>();
    nodes.forEach((n, i) => m.set(n.id, i));
    return m;
  }, [nodes]);

  // Pre-resolve colors so rendering is cheap.
  const nodeColors = useMemo(
    () =>
      nodes.map((n, i) => ({
        fill: resolveNodeColor(n, i),
        stroke: resolveNodeStroke(n, i)
      })),
    [nodes]
  );

  // Compute the set of "active" link indices given the current hover state.
  const activeLinkIndices = useMemo<Set<number> | null>(() => {
    if (hoveredLinkIdx != null) {
      if (highlightMode === 'link') {
        return new Set([hoveredLinkIdx]);
      }
      if (highlightMode === 'node') {
        const link = layout.links[hoveredLinkIdx];
        const result = new Set<number>();
        layout.links.forEach((l, i) => {
          if (l.source === link.source || l.target === link.target) result.add(i);
        });
        return result;
      }
      // path: trace full upstream + downstream
      const result = new Set<number>([hoveredLinkIdx]);
      const hovered = layout.links[hoveredLinkIdx];
      const traceUpstream = (nodeId: string) => {
        layout.links.forEach((l, i) => {
          if (l.target === nodeId && !result.has(i)) {
            result.add(i);
            traceUpstream(l.source);
          }
        });
      };
      const traceDownstream = (nodeId: string) => {
        layout.links.forEach((l, i) => {
          if (l.source === nodeId && !result.has(i)) {
            result.add(i);
            traceDownstream(l.target);
          }
        });
      };
      traceUpstream(hovered.source);
      traceDownstream(hovered.target);
      return result;
    }
    if (hoveredNodeId != null) {
      const result = new Set<number>();
      if (highlightMode === 'path') {
        const trace = (nodeId: string, dir: 'up' | 'down') => {
          layout.links.forEach((l, i) => {
            const hit = dir === 'up' ? l.target === nodeId : l.source === nodeId;
            if (hit && !result.has(i)) {
              result.add(i);
              trace(dir === 'up' ? l.source : l.target, dir);
            }
          });
        };
        trace(hoveredNodeId, 'up');
        trace(hoveredNodeId, 'down');
      } else {
        layout.links.forEach((l, i) => {
          if (l.source === hoveredNodeId || l.target === hoveredNodeId) result.add(i);
        });
      }
      return result;
    }
    return null;
  }, [hoveredLinkIdx, hoveredNodeId, highlightMode, layout.links]);

  // Gradient defs for link color interpolation.
  const gradientDefs: ReactNode[] = [];
  if (linkColorMode === 'gradient') {
    layout.links.forEach((link, i) => {
      const srcIdx = nodeIndexById.get(link.source);
      const tgtIdx = nodeIndexById.get(link.target);
      if (srcIdx == null || tgtIdx == null) return;
      const srcColor = nodeColors[srcIdx].fill;
      const tgtColor = nodeColors[tgtIdx].fill;
      gradientDefs.push(
        <linearGradient
          key={`grad-${i}`}
          id={`sankey-grad-${svgId}-${i}`}
          gradientUnits="userSpaceOnUse"
          x1={link.sourceX}
          x2={link.targetX}
          y1={0}
          y2={0}
        >
          <stop offset="0%" stopColor={srcColor} />
          <stop offset="100%" stopColor={tgtColor} />
        </linearGradient>
      );
    });
  }

  const resolveLinkFill = (linkIdx: number): string => {
    const link = layout.links[linkIdx];
    if (link.color) return link.color;
    if (linkColorMode === 'neutral') return neutralLinkColor;
    if (linkColorMode === 'gradient') return `url(#sankey-grad-${svgId}-${linkIdx})`;
    const ref = linkColorMode === 'source' ? link.source : link.target;
    const idx = nodeIndexById.get(ref);
    return idx != null ? nodeColors[idx].fill : neutralLinkColor;
  };

  // Legend: group nodes by category if provided, otherwise show each node.
  const legendItems: LegendItem[] = useMemo(() => {
    if (!showLegend) return [];
    const seen = new Map<string, LegendItem>();
    nodes.forEach((n, i) => {
      const key = n.category ?? n.label;
      if (seen.has(key)) return;
      seen.set(key, {
        label: key,
        color: nodeColors[i].fill,
        strokeColor: nodeColors[i].stroke,
        marker: 'solid',
        active: n.active !== false
      });
    });
    return Array.from(seen.values());
  }, [showLegend, nodes, nodeColors]);

  // Hover card copy.
  const hoveredLink = hoveredLinkIdx != null ? layout.links[hoveredLinkIdx] : null;
  const hoveredSource =
    hoveredLink != null ? nodes[nodeIndexById.get(hoveredLink.source) ?? -1] : null;
  const hoveredTarget =
    hoveredLink != null ? nodes[nodeIndexById.get(hoveredLink.target) ?? -1] : null;
  const hoveredNode = hoveredNodeId != null ? nodes[nodeIndexById.get(hoveredNodeId) ?? -1] : null;
  const hoveredNodeLayout =
    hoveredNodeId != null ? (layout.nodes.find((n) => n.id === hoveredNodeId) ?? null) : null;

  const hoverCardPosition = mousePos
    ? getViewportHoverCardPosition(
        mousePos.x,
        mousePos.y,
        220,
        getEstimatedHoverCardHeight(2, true)
      )
    : null;

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
      <div style={{ position: 'relative', width: plotWidth }}>
        <svg
          width={plotWidth}
          height={plotHeight}
          viewBox={`0 0 ${plotWidth} ${plotHeight}`}
          role="img"
          aria-label={title}
          style={{ overflow: 'visible', display: 'block' }}
          onMouseLeave={() => {
            setHoveredLinkIdx(null);
            setHoveredNodeId(null);
            setMousePos(null);
          }}
        >
          <defs>{gradientDefs}</defs>

          {/* Links first so nodes render on top. */}
          <g>
            {layout.links.map((link, i) => {
              const path = describeSankeyRibbon(
                link.sourceX,
                link.sourceY0,
                link.sourceY1,
                link.targetX,
                link.targetY0,
                link.targetY1
              );
              const isActive = activeLinkIndices == null ? true : activeLinkIndices.has(i);
              const opacity = isActive ? linkOpacity : linkDimmedOpacity;
              const hoverOpacity = hoveredLinkIdx === i ? Math.min(linkOpacity + 0.25, 1) : opacity;
              return (
                <path
                  key={`link-${i}`}
                  d={path}
                  fill={resolveLinkFill(i)}
                  stroke="none"
                  opacity={hoverOpacity}
                  style={{
                    transition: 'opacity 120ms ease-out',
                    cursor: onLinkClick ? 'pointer' : 'default'
                  }}
                  onMouseMove={(event) => {
                    setHoveredLinkIdx(i);
                    setHoveredNodeId(null);
                    setMousePos({ x: event.clientX, y: event.clientY });
                  }}
                  onClick={onLinkClick ? () => onLinkClick(links[i]) : undefined}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {layout.nodes.map((n) => {
              const idx = nodeIndexById.get(n.id)!;
              const colors = nodeColors[idx];
              const isHovered = hoveredNodeId === n.id;
              return (
                <Fragment key={n.id}>
                  <rect
                    x={n.x}
                    y={n.y}
                    width={n.width}
                    height={Math.max(n.height, 1)}
                    rx={nodeCornerRadius}
                    ry={nodeCornerRadius}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={1}
                    opacity={n.active === false ? 0.45 : 1}
                    style={{
                      cursor: onNodeClick ? 'pointer' : 'default',
                      transition: 'filter 120ms ease-out'
                    }}
                    filter={isHovered ? chartTokens.shadow.chartHoverFilter : undefined}
                    onMouseMove={(event) => {
                      setHoveredNodeId(n.id);
                      setHoveredLinkIdx(null);
                      setMousePos({ x: event.clientX, y: event.clientY });
                    }}
                    onClick={onNodeClick ? () => onNodeClick(n) : undefined}
                  />
                </Fragment>
              );
            })}
          </g>

          {/* Labels — drawn last so they sit above everything. */}
          {showNodeLabels ? (
            <g style={{ pointerEvents: 'none' }}>
              {layout.nodes.map((n) => {
                const isFirstColumn = n.columnIndex === 0;
                const isLastColumn = n.columnIndex === layout.numColumns - 1;
                // Middle columns: anchor label to whichever side has more room.
                const rightOfNode = isFirstColumn || (!isLastColumn && n.x < plotWidth / 2);
                const labelX = rightOfNode ? n.x + n.width + 6 : n.x - 6;
                const textAnchor = rightOfNode ? 'start' : 'end';
                const labelY = Math.min(
                  Math.max(n.y + n.height / 2, showNodeValues ? 10 : 8),
                  plotHeight - (showNodeValues ? 22 : 8)
                );
                return (
                  <Fragment key={`label-${n.id}`}>
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      fontFamily={chartTokens.fontFamily}
                      fontSize="12"
                      fontWeight="600"
                      fill={chartTokens.text.default}
                    >
                      {n.label}
                    </text>
                    {showNodeValues ? (
                      <text
                        x={labelX}
                        y={labelY + 14}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        fontFamily={chartTokens.fontFamily}
                        fontSize="11"
                        fontWeight="400"
                        fill={chartTokens.text.subtle}
                      >
                        {formatNumberCompact(n.value)}
                      </text>
                    ) : null}
                  </Fragment>
                );
              })}
            </g>
          ) : null}
        </svg>

        {showHoverCard && hoveredLink && hoveredSource && hoveredTarget ? (
          <ChartHoverCard
            title={`${hoveredSource.label} → ${hoveredTarget.label}`}
            rows={[
              {
                label: hoveredSource.label,
                value: 'Source',
                color: nodeColors[nodeIndexById.get(hoveredSource.id) ?? 0].fill,
                strokeColor: nodeColors[nodeIndexById.get(hoveredSource.id) ?? 0].stroke,
                marker: 'solid'
              },
              {
                label: hoveredTarget.label,
                value: 'Target',
                color: nodeColors[nodeIndexById.get(hoveredTarget.id) ?? 0].fill,
                strokeColor: nodeColors[nodeIndexById.get(hoveredTarget.id) ?? 0].stroke,
                marker: 'solid'
              }
            ]}
            totalLabel="Flow"
            totalValue={formatTooltipValue(hoveredLink.value)}
            left={hoverCardPosition?.left ?? 12}
            top={hoverCardPosition?.top ?? 12}
          />
        ) : null}

        {showHoverCard && hoveredNode && hoveredNodeLayout && !hoveredLink ? (
          <ChartHoverCard
            title={hoveredNode.label}
            rows={[
              ...(hoveredNode.category
                ? [
                    {
                      label: 'Category',
                      value: hoveredNode.category
                    }
                  ]
                : []),
              {
                label: 'Throughput',
                value: formatTooltipValue(hoveredNodeLayout.value),
                color: nodeColors[nodeIndexById.get(hoveredNode.id) ?? 0].fill,
                strokeColor: nodeColors[nodeIndexById.get(hoveredNode.id) ?? 0].stroke,
                marker: 'solid'
              }
            ]}
            left={hoverCardPosition?.left ?? 12}
            top={hoverCardPosition?.top ?? 12}
          />
        ) : null}
      </div>
    </ChartShell>
  );
});
