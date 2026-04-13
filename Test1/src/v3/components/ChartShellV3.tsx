import { Legend } from '../../components/Legend';
import type { LegendItem } from '../../types';
import { ChartCard } from '../../components/ChartCard';
import { cx } from '../../utils/cx';
import type { ChartShellV3Props } from '../types';
import { ChartToolbarV3 } from './ChartToolbarV3';

export function ChartShellV3({
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
}: ChartShellV3Props) {
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
      className={cx('cl-v3-card', className)}
    >
      <figure className="cl-v3-shell" aria-label={title ?? description}>
        {description ? <figcaption className="cl-v3-shell__sr">{description}</figcaption> : null}
        {showHeader ? (
          <ChartToolbarV3
            title={title}
            showTitle={showTitle}
            legendItems={showTopLegend ? (legendItems as LegendItem[]) : []}
            {...toolbarProps}
          />
        ) : showTitle && title ? (
          <h3 className="cl-header__title">{title}</h3>
        ) : null}
        <div
          className={cx(
            'cl-v3-shell__body',
            showSideLegend && 'cl-v3-shell__body--split'
          )}
        >
          <div className="cl-v3-shell__main">{children}</div>
          {showSideLegend ? (
            <aside className="cl-v3-shell__aside">{sideLegend}</aside>
          ) : null}
        </div>
        {showBottomLegend ? (
          <div className="cl-v3-shell__legend">{bottomLegend}</div>
        ) : null}
        {footer ? <div className="cl-v3-shell__footer">{footer}</div> : null}
      </figure>
    </ChartCard>
  );
}
