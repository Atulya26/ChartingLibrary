import type { Meta, StoryObj } from '@storybook/react';

import { LineChartV3 } from '../v3/charts/LineChartV3';
import { selectOptions, v3LineCategories, v3LineSeries } from './storyData';

const meta = {
  title: 'V3/Line Chart',
  component: LineChartV3,
  tags: ['autodocs']
} satisfies Meta<typeof LineChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Readmission Trend',
    categories: v3LineCategories,
    series: v3LineSeries,
    selectOptions,
    selectedValue: selectOptions[1].value,
    yAxis: {
      title: 'Rate',
      ticks: ['40', '20', '0']
    }
  }
};

export const DualAxis: Story = {
  args: {
    title: 'Dual Axis Trend',
    categories: v3LineCategories,
    series: [
      {
        key: 'census',
        label: 'Census',
        data: [24, 30, 28, 36, 34, 40],
        stroke: '#3bceff',
        showDots: true,
        showAreaFill: true
      },
      {
        key: 'utilization',
        label: 'Utilization',
        data: [58, 62, 60, 68, 64, 74],
        stroke: '#c93030',
        lineStyle: 'dashed',
        showDots: false,
        axis: 'right'
      }
    ],
    showSecondaryYAxis: true,
    yAxis: {
      title: 'Census',
      ticks: ['40', '20', '0']
    },
    secondaryYAxis: {
      title: 'Utilization',
      ticks: ['80', '60', '40']
    }
  }
};
