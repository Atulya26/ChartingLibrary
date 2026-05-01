import type { CSSProperties } from 'react';

import { TooltipPopover } from './TooltipPopover';
import type { TooltipRow } from '../types';

export interface ChartHoverCardProps {
  title: string;
  rows: TooltipRow[];
  totalLabel?: string;
  totalValue?: string | number;
  left: number;
  top: number;
}

export function ChartHoverCard({
  title,
  rows,
  totalLabel,
  totalValue,
  left,
  top
}: ChartHoverCardProps) {
  const style: CSSProperties = {
    position: 'fixed',
    left,
    top,
    zIndex: 20,
    pointerEvents: 'none'
  };

  return (
    <div className="cl-chart-hover-card" style={style}>
      <TooltipPopover title={title} rows={rows} totalLabel={totalLabel} totalValue={totalValue} />
    </div>
  );
}
