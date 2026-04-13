import type { Meta, StoryObj } from '@storybook/react';

import { BarChartV3 } from '../v3/charts/BarChartV3';
import {
  chartActions,
  selectOptions,
  v3BarCategories,
  v3BarSeries,
  v3StackedBarSeries
} from './storyData';

const meta = {
  title: 'V3/Bar Chart',
  component: BarChartV3,
  tags: ['autodocs']
} satisfies Meta<typeof BarChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Grouped: Story = {
  args: {
    title: 'Bar Chart',
    categories: v3BarCategories,
    series: v3BarSeries,
    actions: chartActions.slice(0, 3),
    selectOptions,
    selectedValue: selectOptions[0].value,
    yAxis: {
      title: 'Revenue',
      ticks: ['60M', '40M', '20M']
    }
  }
};

export const Stacked: Story = {
  args: {
    title: 'Payer Mix',
    categories: v3BarCategories,
    series: v3StackedBarSeries,
    layout: 'stacked',
    showSegmentLabels: true,
    showTotalLabels: true,
    legendPosition: 'bottom',
    yAxis: {
      title: 'Claims',
      ticks: ['60', '40', '20']
    }
  }
};
