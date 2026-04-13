import type { Meta, StoryObj } from '@storybook/react';

import { HistogramChartV3 } from '../v3/charts/HistogramChartV3';
import { v3HistogramBins } from './storyData';

const meta = {
  title: 'V3/Histogram',
  component: HistogramChartV3,
  tags: ['autodocs']
} satisfies Meta<typeof HistogramChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Age Distribution',
    bins: v3HistogramBins,
    legendPosition: 'bottom',
    yAxis: {
      title: 'Frequency',
      ticks: ['24', '12', '0']
    }
  }
};

export const WithOverlay: Story = {
  args: {
    title: 'Age Distribution',
    bins: v3HistogramBins,
    overlayLine: true,
    overlayDots: true,
    overlayAreaFill: true,
    overlayLegendLabel: 'Distribution curve',
    yAxis: {
      title: 'Frequency',
      ticks: ['24', '12', '0']
    }
  }
};
