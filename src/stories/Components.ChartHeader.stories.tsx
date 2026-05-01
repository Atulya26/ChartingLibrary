import type { Meta, StoryObj } from '@storybook/react';

import { ChartHeader } from '../components/ChartHeader';
import { chartActions, compactChartActions, legendMarkers, selectOptions } from './storyData';

const meta = {
  title: 'Components/Chart Header',
  component: ChartHeader,
  tags: ['autodocs'],
  args: {
    title: 'Title',
    legendItems: legendMarkers.slice(0, 2),
    selectOptions,
    selectedValue: selectOptions[0].value,
    actions: compactChartActions
  }
} satisfies Meta<typeof ChartHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullControlBar: Story = {
  args: {
    actions: chartActions,
    primaryActionLabel: 'Button',
    showMenu: true
  }
};
