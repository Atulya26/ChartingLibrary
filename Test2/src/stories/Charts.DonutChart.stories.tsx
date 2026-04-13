import type { Meta, StoryObj } from '@storybook/react';

import { DonutChart } from '../charts/DonutChart';
import { donutSegments } from './storyData';

const meta = {
  title: 'Charts/Donut Chart',
  component: DonutChart,
  tags: ['autodocs'],
  args: {
    title: 'Pie Chart Example',
    segments: donutSegments
  }
} satisfies Meta<typeof DonutChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
