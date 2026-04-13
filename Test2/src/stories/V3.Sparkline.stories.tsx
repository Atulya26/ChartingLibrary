import type { Meta, StoryObj } from '@storybook/react';

import { SparklineV3 } from '../v3/charts/SparklineV3';
import { v3SparklineValues } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  colorArg,
  rangeArg,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Sparkline',
  component: SparklineV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Sparkline controls should stay minimal: width, height, stroke width, and color. ` +
          'The value array is hidden because it is advanced data.'
      }
    }
  },
  argTypes: {
    values: advancedDataArg('Advanced sparkline values. Hidden from controls because raw array editing is not a good default experience.'),
    width: rangeArg('Numeric sparkline width in pixels.', 'Layout', { min: 40, max: 200, step: 4 }),
    height: rangeArg('Numeric sparkline height in pixels.', 'Layout', { min: 16, max: 80, step: 2 }),
    strokeWidth: rangeArg('Numeric line width in pixels.', 'Style', { min: 1, max: 6, step: 0.5 }),
    color: colorArg('Line color for the sparkline.')
  }
} satisfies Meta<typeof SparklineV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    values: v3SparklineValues
  }
};
