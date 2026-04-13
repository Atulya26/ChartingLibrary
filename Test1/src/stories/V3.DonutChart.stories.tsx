import type { Meta, StoryObj } from '@storybook/react';

import { DonutChartV3 } from '../v3/charts/DonutChartV3';
import { v3DonutSegments } from './storyData';

const meta = {
  title: 'V3/Donut Chart',
  component: DonutChartV3,
  tags: ['autodocs']
} satisfies Meta<typeof DonutChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Pie Chart Example',
    segments: v3DonutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'bottom'
  }
};

export const LabelsHidden: Story = {
  args: {
    title: 'Care Setting Mix',
    segments: v3DonutSegments,
    showLabels: false,
    centerLabel: '100M',
    centerSubLabel: 'Target'
  }
};
