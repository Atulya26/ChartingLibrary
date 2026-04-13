import type { Meta, StoryObj } from '@storybook/react';

import { SparklineV3 } from '../v3/charts/SparklineV3';
import { v3SparklineValues } from './storyData';

const meta = {
  title: 'V3/Sparkline',
  component: SparklineV3,
  tags: ['autodocs']
} satisfies Meta<typeof SparklineV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    values: v3SparklineValues
  }
};
