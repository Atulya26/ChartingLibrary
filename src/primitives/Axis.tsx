import { chartTokens } from '../theme/tokens';
import { cx } from '../utils/cx';

export interface YAxisProps {
  title?: string;
  ticks?: Array<string | number>;
  side?: 'left' | 'right';
  hideMarkers?: boolean;
  height?: number;
}

export interface XAxisProps {
  labels: string[];
}

export function YAxis({
  title,
  ticks = ['x', 'x', 'x'],
  side = 'left',
  hideMarkers = false,
  height
}: YAxisProps) {
  return (
    <div
      className={cx('cl-axis', side === 'right' && 'cl-axis--right')}
      style={height ? { height } : undefined}
    >
      {title ? (
        <div className="cl-axis__title">
          <span className="cl-axis__title-text">{title}</span>
        </div>
      ) : null}
      <div
        className="cl-axis__ticks"
        style={{
          minWidth:
            chartTokens.chart.axisValueWidth + chartTokens.chart.axisTitleWidth
        }}
      >
        {hideMarkers
          ? null
          : ticks.map((tick, index) => <span key={`${tick}-${index}`}>{tick}</span>)}
      </div>
    </div>
  );
}

export function XAxis({ labels }: XAxisProps) {
  return (
    <div
      className="cl-x-axis"
      style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
    >
      {labels.map((label, index) => (
        <div className="cl-x-axis__label" key={`${label}-${index}`}>
          {label}
        </div>
      ))}
    </div>
  );
}
