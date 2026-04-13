import type { Meta, StoryObj } from '@storybook/react';

import { GaugeChartV3 } from '../v3/charts/GaugeChartV3';
import { v3GaugeRanges } from './storyData';

const meta = {
  title: 'V3/Half Donut Gauge',
  component: GaugeChartV3,
  tags: ['autodocs']
} satisfies Meta<typeof GaugeChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Inpatient follow up',
    value: 45,
    centerLabel: '45%',
    centerSubLabel: '845 of 1,190',
    ranges: v3GaugeRanges
  }
};
