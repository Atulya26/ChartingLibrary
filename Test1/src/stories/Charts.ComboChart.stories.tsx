import type { Meta, StoryObj } from '@storybook/react';

import { ComboChart } from '../charts/ComboChart';
import {
  comboBarSeries,
  comboCategories,
  comboLineSeries,
  compactChartActions,
  selectOptions
} from './storyData';

const meta = {
  title: 'Charts/Combination Chart',
  component: ComboChart,
  tags: ['autodocs'],
  args: {
    title: 'Title',
    categories: comboCategories,
    barSeries: comboBarSeries,
    lineSeries: comboLineSeries,
    selectOptions,
    selectedValue: selectOptions[0].value,
    actions: compactChartActions,
    yAxis: {
      title: 'Header',
      ticks: ['x', 'x', 'x']
    },
    secondaryYAxis: {
      title: 'Header',
      ticks: ['x', 'x', 'x']
    }
  }
} satisfies Meta<typeof ComboChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullHeaderVariant: Story = {
  args: {
    actions: compactChartActions,
    primaryActionLabel: 'Button',
    showMenu: true
  }
};
