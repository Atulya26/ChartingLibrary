import type { Meta, StoryObj } from '@storybook/react';

import { BarChart } from '../charts/BarChart';
import {
  chartActions,
  groupedBarSeries,
  groupedCategories,
  selectOptions,
  sequentialBarSeries,
  sequentialCategories
} from './storyData';

const meta = {
  title: 'Charts/Bar Chart',
  component: BarChart,
  tags: ['autodocs']
} satisfies Meta<typeof BarChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GroupedCategorical: Story = {
  args: {
    title: 'Bar Chart',
    categories: groupedCategories,
    series: groupedBarSeries,
    actions: chartActions.slice(0, 3),
    selectOptions,
    selectedValue: selectOptions[0].value,
    yAxis: {
      title: 'Revenue',
      ticks: ['10M', '5M', '0']
    }
  }
};

export const ColorLogicExamples: Story = {
  args: {
    title: 'Application Patterns',
    categories: sequentialCategories,
    series: sequentialBarSeries,
    layout: 'grouped',
    yAxis: {
      title: 'Value',
      ticks: ['80', '40', '0']
    },
    actions: chartActions.slice(4, 7),
    showMenu: true
  }
};
