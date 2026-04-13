import type { CSSProperties } from 'react';

import type { ChartCardProps } from '../types';
import { cx } from '../utils/cx';

export function ChartCard({
  width = '100%',
  surface = 'card',
  padding = 16,
  className,
  children
}: ChartCardProps) {
  const style: CSSProperties = {
    width,
    padding
  };

  return (
    <section
      className={cx('cl-card', surface === 'plain' && 'cl-card--plain', className)}
      style={style}
    >
      <div className="cl-card__body">{children}</div>
    </section>
  );
}
