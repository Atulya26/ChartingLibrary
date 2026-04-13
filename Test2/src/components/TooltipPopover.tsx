import type { TooltipRow } from '../types';
import { LegendMarker } from './Legend';

export interface TooltipPopoverProps {
  title: string;
  rows: TooltipRow[];
  totalLabel?: string;
  totalValue?: string | number;
}

export function TooltipPopover({
  title,
  rows,
  totalLabel,
  totalValue
}: TooltipPopoverProps) {
  return (
    <div className="cl-tooltip">
      <div>
        <p className="cl-tooltip__title">{title}</p>
      </div>
      <div className="cl-tooltip__rows">
        {rows.map((row) => (
          <div className="cl-tooltip__row" key={`${row.label}-${row.value}`}>
            <div className="cl-legend__item">
              <LegendMarker
                color={row.color}
                strokeColor={row.strokeColor}
                marker={row.marker}
              />
              <span>{row.label}</span>
            </div>
            <div className="cl-tooltip__value">{row.value}</div>
          </div>
        ))}
        {typeof totalValue !== 'undefined' ? (
          <div className="cl-tooltip__total">
            <span>{totalLabel ?? 'Total'}</span>
            <span>{totalValue}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
