import type { Meta, StoryObj } from '@storybook/react';

import { BarMark } from '../primitives/BarMark';
import { DonutRing } from '../primitives/DonutRing';
import { LineSeries } from '../primitives/LineSeries';
import { chartTokens } from '../theme/tokens';
import { donutSegments } from './storyData';

const meta = {
  title: 'Primitives/Chart Building Blocks',
  tags: ['autodocs']
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="cl-story-stack">
      <section className="cl-section">
        <h2 className="cl-section__title">Bars</h2>
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-end',
            padding: 16,
            background: chartTokens.neutral.white,
            border: `1px solid ${chartTokens.neutral.stoneLight}`,
            borderRadius: 8
          }}
        >
          <BarMark
            value={78}
            maxValue={100}
            label="Solid"
            fill={chartTokens.categorical.primary}
          />
          <BarMark
            value={61}
            maxValue={100}
            label="Texture"
            fill={chartTokens.categorical.axisPalette[3].fill}
            stroke={chartTokens.categorical.axisPalette[3].stroke}
            fillStyle="texture"
          />
          <BarMark
            value={42}
            maxValue={100}
            label="Gradient"
            fill={chartTokens.categorical.axisPalette[2].fill}
            stroke={chartTokens.categorical.axisPalette[2].stroke}
            fillStyle="gradient"
          />
        </div>
      </section>
      <section className="cl-section">
        <h2 className="cl-section__title">Line and Dots</h2>
        <div
          style={{
            width: 390,
            height: 117,
            padding: 12,
            background: chartTokens.neutral.white,
            border: `1px solid ${chartTokens.neutral.stoneLight}`,
            borderRadius: 8
          }}
        >
          <LineSeries
            values={[53, 50, 63, 44, 60, 28, 23, 28]}
            width={366}
            height={93}
            minValue={0}
            maxValue={80}
            stroke={chartTokens.categorical.secondary}
            showDots
          />
        </div>
      </section>
      <section className="cl-section">
        <h2 className="cl-section__title">Donut</h2>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 220,
            padding: 16,
            background: chartTokens.neutral.white,
            border: `1px solid ${chartTokens.neutral.stoneLight}`,
            borderRadius: 8
          }}
        >
          <DonutRing
            segments={donutSegments}
            size={160}
            centerLabel="100M"
            centerSubLabel="Target"
          />
        </div>
      </section>
    </div>
  )
};
