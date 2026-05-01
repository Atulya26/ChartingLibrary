import type { SankeyLink, SankeyNode, SankeyNodeAlignment } from './types';

export interface LaidOutSankeyNode extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  columnIndex: number;
}

export interface LaidOutSankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
  sourceX: number;
  targetX: number;
  sourceY0: number;
  sourceY1: number;
  targetY0: number;
  targetY1: number;
}

export interface SankeyLayoutResult {
  nodes: LaidOutSankeyNode[];
  links: LaidOutSankeyLink[];
  numColumns: number;
}

export interface SankeyLayoutOptions {
  nodes: SankeyNode[];
  links: SankeyLink[];
  plotWidth: number;
  plotHeight: number;
  nodeWidth: number;
  nodePadding: number;
  alignment?: SankeyNodeAlignment;
  /** Number of relaxation passes to reduce link crossings. 0 disables. */
  iterations?: number;
}

/**
 * Compute a Sankey layout.
 *
 * Design notes:
 * - A node's "value" is max(sum of incoming link values, sum of outgoing link values).
 *   This ensures a node is tall enough to accommodate both sides of its flow.
 * - All columns share the same vertical scale (pixels-per-unit) so ribbon widths
 *   are directly comparable across the chart.
 * - `alignment` controls whether the final column sits flush right, left, centered
 *   within its column bounds, or distributes ("justify") — mirrors d3-sankey's nodeAlign.
 * - A small relaxation loop nudges node y-positions toward the weighted center of
 *   their connected nodes to reduce visual link crossings.
 */
export function layoutSankey({
  nodes,
  links,
  plotWidth,
  plotHeight,
  nodeWidth,
  nodePadding,
  alignment = 'justify',
  iterations = 6
}: SankeyLayoutOptions): SankeyLayoutResult {
  if (!nodes.length) {
    return { nodes: [], links: [], numColumns: 0 };
  }

  const nodeIndex = new Map(nodes.map((n) => [n.id, n]));

  // Filter out links that reference missing nodes so we don't crash on bad data.
  const validLinks = links.filter(
    (l) => nodeIndex.has(l.source) && nodeIndex.has(l.target) && l.value > 0
  );

  // Per-node adjacency lists.
  const incoming = new Map<string, SankeyLink[]>();
  const outgoing = new Map<string, SankeyLink[]>();
  nodes.forEach((n) => {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  });
  validLinks.forEach((l) => {
    outgoing.get(l.source)!.push(l);
    incoming.get(l.target)!.push(l);
  });

  // --- 1. Assign column indices ---------------------------------------------
  const columnOf = new Map<string, number | null>();
  nodes.forEach((n) => columnOf.set(n.id, n.column ?? null));

  // Iterative forward sweep: a node's column = max(source columns) + 1.
  let changed = true;
  let safety = 0;
  while (changed && safety < nodes.length + 8) {
    changed = false;
    safety += 1;
    for (const n of nodes) {
      if (columnOf.get(n.id) != null) continue;
      const sources = incoming.get(n.id)!.map((l) => columnOf.get(l.source));
      if (sources.length === 0) {
        columnOf.set(n.id, 0);
        changed = true;
        continue;
      }
      if (sources.every((c) => c != null)) {
        const max = Math.max(...(sources as number[]));
        columnOf.set(n.id, max + 1);
        changed = true;
      }
    }
  }
  // Any remaining (disconnected) fallback to 0.
  nodes.forEach((n) => {
    if (columnOf.get(n.id) == null) columnOf.set(n.id, 0);
  });

  const numColumns = Math.max(...Array.from(columnOf.values()).map((v) => v as number)) + 1;

  // Apply alignment: optionally push unconstrained nodes toward left/right/center.
  if (alignment !== 'justify') {
    // Compute, for each node, the longest path-to-sink (downstream depth).
    const downstreamDepth = new Map<string, number>();
    const computeDepth = (id: string): number => {
      if (downstreamDepth.has(id)) return downstreamDepth.get(id)!;
      const outs = outgoing.get(id)!;
      if (outs.length === 0) {
        downstreamDepth.set(id, 0);
        return 0;
      }
      const d = 1 + Math.max(...outs.map((l) => computeDepth(l.target)));
      downstreamDepth.set(id, d);
      return d;
    };
    nodes.forEach((n) => computeDepth(n.id));

    nodes.forEach((n) => {
      if (n.column != null) return;
      const incomingLen = incoming.get(n.id)!.length;
      const outgoingLen = outgoing.get(n.id)!.length;
      if (alignment === 'right' && outgoingLen === 0) {
        columnOf.set(n.id, numColumns - 1);
      } else if (alignment === 'left' && incomingLen === 0) {
        columnOf.set(n.id, 0);
      } else if (alignment === 'center') {
        const col = columnOf.get(n.id) as number;
        const depth = downstreamDepth.get(n.id) ?? 0;
        const centered = Math.round((col + (numColumns - 1 - depth)) / 2);
        columnOf.set(n.id, centered);
      }
    });
  }

  // --- 2. Group nodes by column ---------------------------------------------
  const columns: string[][] = Array.from({ length: numColumns }, () => []);
  nodes.forEach((n) => {
    columns[columnOf.get(n.id) as number].push(n.id);
  });

  // --- 3. Node values --------------------------------------------------------
  const nodeValue = new Map<string, number>();
  nodes.forEach((n) => {
    const inSum = incoming.get(n.id)!.reduce((s, l) => s + l.value, 0);
    const outSum = outgoing.get(n.id)!.reduce((s, l) => s + l.value, 0);
    nodeValue.set(n.id, Math.max(inSum, outSum, 0.0001));
  });

  // --- 4. Vertical scale (shared across columns) ----------------------------
  // For each column, determine the available usable height after padding.
  const columnScale = columns.map((col) => {
    const totalValue = col.reduce((s, id) => s + nodeValue.get(id)!, 0);
    const gaps = Math.max(col.length - 1, 0);
    const usableHeight = Math.max(plotHeight - gaps * nodePadding, 10);
    return totalValue > 0 ? usableHeight / totalValue : 0;
  });
  const scale = Math.min(...columnScale.filter((s) => s > 0));

  // --- 5. Column x positions ------------------------------------------------
  const xStep = numColumns > 1 ? (plotWidth - nodeWidth) / (numColumns - 1) : 0;

  // --- 6. Initial y positions: stack + vertical-center within column --------
  type NodeRect = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  const rects = new Map<string, NodeRect>();
  columns.forEach((col, colIdx) => {
    const x = numColumns > 1 ? colIdx * xStep : (plotWidth - nodeWidth) / 2;
    const heights = col.map((id) => nodeValue.get(id)! * scale);
    const totalHeight =
      heights.reduce((s, h) => s + h, 0) + nodePadding * Math.max(col.length - 1, 0);
    let y = (plotHeight - totalHeight) / 2;
    col.forEach((id, i) => {
      rects.set(id, { id, x, y, width: nodeWidth, height: heights[i] });
      y += heights[i] + nodePadding;
    });
  });

  // --- 7. Relax node y positions to reduce link crossings -------------------
  const resolveCollisions = (colIds: string[]) => {
    const sorted = [...colIds].sort((a, b) => rects.get(a)!.y - rects.get(b)!.y);
    // Push down overlaps from top.
    let y = 0;
    sorted.forEach((id) => {
      const r = rects.get(id)!;
      if (r.y < y) r.y = y;
      y = r.y + r.height + nodePadding;
    });
    // If overflowed below plotHeight, push up.
    if (y - nodePadding > plotHeight) {
      y = plotHeight;
      [...sorted].reverse().forEach((id) => {
        const r = rects.get(id)!;
        if (r.y + r.height > y) r.y = y - r.height;
        y = r.y - nodePadding;
      });
    }
  };

  const weightedCenter = (ids: string[]) => {
    if (!ids.length) return 0;
    let total = 0;
    let weight = 0;
    ids.forEach((lid, i) => {
      // `ids` here represent the connected node ids; use their y-center and value as weight.
      const r = rects.get(lid);
      const w = nodeValue.get(lid) ?? 1;
      if (!r) return;
      total += (r.y + r.height / 2) * w;
      weight += w;
      // `i` kept for future weighting tweaks (e.g. positional decay).
      void i;
    });
    return weight > 0 ? total / weight : 0;
  };

  for (let iter = 0; iter < iterations; iter += 1) {
    const alpha = Math.pow(0.99, iter);
    // Forward pass: each column shifts toward the weighted center of its sources.
    for (let c = 1; c < numColumns; c += 1) {
      columns[c].forEach((id) => {
        const sourceIds = incoming.get(id)!.map((l) => l.source);
        if (!sourceIds.length) return;
        const target = weightedCenter(sourceIds);
        const r = rects.get(id)!;
        const currentCenter = r.y + r.height / 2;
        r.y += (target - currentCenter) * alpha;
      });
      resolveCollisions(columns[c]);
    }
    // Backward pass.
    for (let c = numColumns - 2; c >= 0; c -= 1) {
      columns[c].forEach((id) => {
        const targetIds = outgoing.get(id)!.map((l) => l.target);
        if (!targetIds.length) return;
        const target = weightedCenter(targetIds);
        const r = rects.get(id)!;
        const currentCenter = r.y + r.height / 2;
        r.y += (target - currentCenter) * alpha;
      });
      resolveCollisions(columns[c]);
    }
  }

  // --- 8. Assign link y-offsets at source/target edges ----------------------
  // For each node, sort outgoing by target y and incoming by source y so ribbons
  // enter/leave in the right visual order.
  const linkSourceY = new Map<SankeyLink, [number, number]>();
  const linkTargetY = new Map<SankeyLink, [number, number]>();

  nodes.forEach((n) => {
    const r = rects.get(n.id)!;

    const outs = [...outgoing.get(n.id)!].sort((a, b) => {
      const ra = rects.get(a.target)!;
      const rb = rects.get(b.target)!;
      return ra.y + ra.height / 2 - (rb.y + rb.height / 2);
    });
    let yOut = r.y;
    outs.forEach((l) => {
      const h = l.value * scale;
      linkSourceY.set(l, [yOut, yOut + h]);
      yOut += h;
    });

    const ins = [...incoming.get(n.id)!].sort((a, b) => {
      const ra = rects.get(a.source)!;
      const rb = rects.get(b.source)!;
      return ra.y + ra.height / 2 - (rb.y + rb.height / 2);
    });
    let yIn = r.y;
    ins.forEach((l) => {
      const h = l.value * scale;
      linkTargetY.set(l, [yIn, yIn + h]);
      yIn += h;
    });
  });

  // --- 9. Emit output --------------------------------------------------------
  const laidOutNodes: LaidOutSankeyNode[] = nodes.map((n) => {
    const r = rects.get(n.id)!;
    return {
      ...n,
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      value: nodeValue.get(n.id)!,
      columnIndex: columnOf.get(n.id) as number
    };
  });

  const laidOutLinks: LaidOutSankeyLink[] = validLinks.map((l) => {
    const src = rects.get(l.source)!;
    const tgt = rects.get(l.target)!;
    const [sy0, sy1] = linkSourceY.get(l)!;
    const [ty0, ty1] = linkTargetY.get(l)!;
    return {
      source: l.source,
      target: l.target,
      value: l.value,
      color: l.color,
      sourceX: src.x + src.width,
      targetX: tgt.x,
      sourceY0: sy0,
      sourceY1: sy1,
      targetY0: ty0,
      targetY1: ty1
    };
  });

  return { nodes: laidOutNodes, links: laidOutLinks, numColumns };
}

/**
 * Build an SVG path describing a Sankey ribbon (a filled cubic-bezier band).
 * The ribbon has a horizontal midpoint control-line: this creates the
 * characteristic S-curve that defines the Sankey aesthetic.
 */
export function describeSankeyRibbon(
  sx: number,
  sy0: number,
  sy1: number,
  tx: number,
  ty0: number,
  ty1: number
): string {
  const mx = (sx + tx) / 2;
  return [
    `M ${sx.toFixed(2)} ${sy0.toFixed(2)}`,
    `C ${mx.toFixed(2)} ${sy0.toFixed(2)}, ${mx.toFixed(2)} ${ty0.toFixed(2)}, ${tx.toFixed(2)} ${ty0.toFixed(2)}`,
    `L ${tx.toFixed(2)} ${ty1.toFixed(2)}`,
    `C ${mx.toFixed(2)} ${ty1.toFixed(2)}, ${mx.toFixed(2)} ${sy1.toFixed(2)}, ${sx.toFixed(2)} ${sy1.toFixed(2)}`,
    'Z'
  ].join(' ');
}
