import type { Meta, StoryObj } from '@storybook/react';

import { ComboChartV3 } from '../v3/charts/ComboChartV3';
import {
  compactChartActions,
  selectOptions,
  v3ComboBarSeries,
  v3ComboCategories,
  v3ComboLineSeries,
  v3StackedBarSeries
} from './storyData';

const meta = {
  title: 'V3/Combination Chart',
  component: ComboChartV3,
  tags: ['autodocs']
} satisfies Meta<typeof ComboChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Title',
    categories: v3ComboCategories,
    barSeries: v3ComboBarSeries,
    lineSeries: v3ComboLineSeries,
    selectOptions,
    selectedValue: selectOptions[0].value,
    actions: compactChartActions,
    yAxis: {
      title: 'Header',
      ticks: ['80', '40', '0']
    },
    secondaryYAxis: {
      title: 'Header',
      ticks: ['80', '60', '40']
    }
  }
};

export const OverlayHidden: Story = {
  args: {
    title: 'Bar Only View',
    categories: v3ComboCategories,
    barSeries: v3ComboBarSeries,
    lineSeries: v3ComboLineSeries,
    showOverlayLine: false,
    showSecondaryYAxis: false
  }
};

export const StackedBars: Story = {
  args: {
    title: 'Stacked Mix with Trend',
    categories: v3ComboCategories,
    barSeries: v3StackedBarSeries,
    lineSeries: [
      {
        key: 'benchmark',
        label: 'Benchmark',
        data: [48, 50, 46, 54, 52, 56],
        stroke: '#3bceff',
        showDots: true
      }
    ],
    barLayout: 'stacked',
    showSecondaryYAxis: false,
    legendPosition: 'bottom'
  }
};
