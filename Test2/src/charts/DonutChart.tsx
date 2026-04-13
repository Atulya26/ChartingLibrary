import { chartTokens } from '../theme/tokens';
import type { DonutSegment, LegendItem } from '../types';
import { ChartCard } from '../components/ChartCard';
import { Legend } from '../components/Legend';
import { DonutRing } from '../primitives/DonutRing';

export interface DonutChartProps {
  title?: string;
  segments: DonutSegment[];
  width?: number | string;
  size?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  showCardBackground?: boolean;
}

function buildLegendItems(segments: DonutSegment[]): LegendItem[] {
  return segments
    .filter((segment) => segment.value > 0)
    .map((segment) => ({
      label: segment.label,
      color: segment.color,
      strokeColor: segment.strokeColor,
      marker: segment.fillStyle === 'texture' ? 'solid-texture' : 'solid',
      active: segment.active
    }));
}

export function DonutChart({
  title = 'Pie Chart Example',
  segments,
  width = 379,
  size = 180,
  centerLabel,
  centerSubLabel,
  showCardBackground = true
}: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <ChartCard width={width} surface={showCardBackground ? 'card' : 'plain'}>
      <div className="cl-donut-chart">
        <p className="cl-donut-chart__title">{title}</p>
        <div className="cl-donut-chart__body">
          <DonutRing
            segments={segments}
            size={size}
            thickness={16}
            centerLabel={centerLabel ?? `${Math.round(total)}M`}
            centerSubLabel={centerSubLabel ?? 'Target'}
          />
        </div>
        <Legend items={buildLegendItems(segments)} orientation="stacked" />
      </div>
    </ChartCard>
  );
}
