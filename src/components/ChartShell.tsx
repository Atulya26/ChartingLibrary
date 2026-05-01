import { Legend } from './Legend';
import type { LegendItem } from '../types';
import { ChartCard } from './ChartCard';
import { cx } from '../utils/cx';
import type { ChartShellProps } from '../types';
import { ChartToolbar } from './ChartToolbar';

export function ChartShell({
  width = '100%',
  showCardBackground = true,
  showHeader = true,
  showTitle = true,
  title,
  legendItems = [],
  legendPosition = 'top',
  description,
  footer,
  className,
  children,
  ...toolbarProps
}: ChartShellProps) {
  const showTopLegend = legendItems.length > 0 && legendPosition === 'top';
  const showSideLegend = legendItems.length > 0 && legendPosition === 'right';
  const showBottomLegend = legendItems.length > 0 && legendPosition === 'bottom';
  const sideLegend = showSideLegend ? (
    <Legend items={legendItems as LegendItem[]} orientation="stacked" />
  ) : null;
  const bottomLegend = showBottomLegend ? (
    <Legend items={legendItems as LegendItem[]} orientation="horizontal" />
  ) : null;

  return (
    <ChartCard
      width={width}
      surface={showCardBackground ? 'card' : 'plain'}
      className={cx('cl-chart-card', className)}
    >
      <figure className="cl-chart-shell" aria-label={title ?? description}>
        {description ? <figcaption className="cl-chart-shell__sr">{description}</figcaption> : null}
        {showHeader ? (
          <ChartToolbar
            title={title}
            showTitle={showTitle}
            legendItems={showTopLegend ? (legendItems as LegendItem[]) : []}
            {...toolbarProps}
          />
        ) : showTitle && title ? (
          <h3 className="cl-header__title">{title}</h3>
        ) : null}
        <div
          className={cx('cl-chart-shell__body', showSideLegend && 'cl-chart-shell__body--split')}
        >
          <div className="cl-chart-shell__main">{children}</div>
          {showSideLegend ? <aside className="cl-chart-shell__aside">{sideLegend}</aside> : null}
        </div>
        {showBottomLegend ? <div className="cl-chart-shell__legend">{bottomLegend}</div> : null}
        {footer ? <div className="cl-chart-shell__footer">{footer}</div> : null}
      </figure>
    </ChartCard>
  );
}
