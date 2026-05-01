import type { Meta, StoryObj } from '@storybook/react';

import { Sparkline } from '../charts/Sparkline';
import { chartTokens } from '../theme/tokens';
import { sparklineLabels, sparklineValues } from './storyData';
import {
  accessibilityArgTypes,
  advancedDataArg,
  baseDocNote,
  booleanArg,
  colorArg,
  hoverCardArg,
  rangeArg,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Sparkline controls should stay minimal: width, height, stroke width, and color. ` +
          'Use `showAreaFill`, `showEndDot`, and `showDots` to add visual emphasis. The value array is hidden because it is advanced data.'
      }
    }
  },
  argTypes: {
    values: advancedDataArg(
      'Advanced sparkline values. Hidden from controls because raw array editing is not a good default experience.'
    ),
    labels: advancedDataArg('Advanced sparkline labels used by the hover helper card.'),
    showHoverCard: hoverCardArg(),
    showAreaFill: booleanArg('Boolean toggle for a soft gradient fill under the curve.', 'Style'),
    showEndDot: booleanArg(
      'Boolean toggle for the latest-value dot at the end of the line.',
      'Style'
    ),
    showDots: booleanArg('Boolean toggle for dots at every data point.', 'Style'),
    width: rangeArg('Numeric sparkline width in pixels.', 'Layout', { min: 40, max: 240, step: 4 }),
    height: rangeArg('Numeric sparkline height in pixels.', 'Layout', {
      min: 16,
      max: 80,
      step: 2
    }),
    strokeWidth: rangeArg('Numeric line width in pixels.', 'Style', { min: 1, max: 6, step: 0.5 }),
    color: colorArg('Line color for the sparkline.'),
    ...accessibilityArgTypes
  }
} satisfies Meta<typeof Sparkline>;

export default meta;

type Story = StoryObj<typeof meta>;

const trendingUp = [8, 12, 18, 22, 26, 33, 38, 47];
const trendingDown = [48, 46, 41, 39, 34, 30, 27, 22];
const volatile = [22, 38, 18, 44, 26, 51, 20, 42];
const flat = [30, 31, 29, 30, 31, 30, 29, 30];

export const Default: Story = {
  args: {
    values: sparklineValues,
    labels: sparklineLabels,
    showHoverCard: false
  }
};

export const WithAreaFill: Story = {
  args: {
    values: trendingUp,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    width: 140,
    height: 44,
    strokeWidth: 2,
    showAreaFill: true,
    showEndDot: true,
    color: chartTokens.sequential.success.dark,
    showHoverCard: false
  }
};

export const TrendingUp: Story = {
  args: {
    values: trendingUp,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    width: 140,
    height: 44,
    strokeWidth: 2,
    showEndDot: true,
    color: chartTokens.sequential.success.dark,
    showHoverCard: false
  }
};

export const TrendingDown: Story = {
  args: {
    values: trendingDown,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    width: 140,
    height: 44,
    strokeWidth: 2,
    showEndDot: true,
    color: chartTokens.sequential.red.dark,
    showHoverCard: false
  }
};

export const Volatile: Story = {
  args: {
    values: volatile,
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    width: 140,
    height: 44,
    strokeWidth: 2,
    showDots: true,
    color: chartTokens.categorical.primary,
    showHoverCard: false
  }
};

export const Flat: Story = {
  args: {
    values: flat,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    width: 140,
    height: 44,
    strokeWidth: 2,
    color: chartTokens.text.subtle,
    showHoverCard: false
  }
};

export const LargeKpi: Story = {
  args: {
    values: trendingUp,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    width: 200,
    height: 60,
    strokeWidth: 2.5,
    showAreaFill: true,
    showEndDot: true,
    color: chartTokens.sequential.success.dark,
    showHoverCard: true
  }
};
