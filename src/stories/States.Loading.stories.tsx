import type { Meta, StoryObj } from '@storybook/react';

import { ChartLoadingSkeleton } from '../components/ChartLoadingSkeleton';
import {
  booleanArg,
  chartMetaParameters,
  numberArg,
  selectArg
} from './chartStorybook';

const chartTypeLabels = {
  bar: 'Bar chart',
  combo: 'Combination chart',
  line: 'Line chart',
  donut: 'Donut chart',
  'half-donut': 'Half donut',
  histogram: 'Histogram',
  sparkline: 'Sparkline',
  'pointer-scale': 'Pointer scale',
  'map-bubble': 'Map bubble',
  sankey: 'Sankey chart'
} as const;

const meta = {
  title: 'States/Loading',
  component: ChartLoadingSkeleton,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          'Chart-aware loading state. Renders the silhouette of the upcoming chart in gray with a single one-time animation. The header is intentionally minimal — only the chart title is shown; no menu, legend, select, or actions.'
      }
    }
  },
  argTypes: {
    width: numberArg(
      'Card width.',
      'Layout',
      { min: 280, max: 800, step: 10 }
    ),
    showCardBackground: booleanArg(
      'Toggle the chart card surface.',
      'Display'
    ),
    chartType: selectArg(
      [
        'bar',
        'combo',
        'line',
        'donut',
        'half-donut',
        'histogram',
        'sparkline',
        'pointer-scale',
        'map-bubble',
        'sankey'
      ],
      'Finite chart skeleton variant. Picks the silhouette and the default plot dimensions to mirror the real chart.',
      'Structure',
      undefined,
      'select',
      chartTypeLabels
    ),
    animate: booleanArg(
      'Run the one-time draw-in animation when the skeleton mounts.',
      'Interaction'
    ),
    plotWidth: numberArg(
      'Plot area width override.',
      'Layout',
      { min: 200, max: 700, step: 10 }
    ),
    plotHeight: numberArg(
      'Plot area height override.',
      'Layout',
      { min: 80, max: 360, step: 10 }
    ),
    title: {
      control: { type: 'text' },
      table: {
        category: 'Content',
        type: { summary: 'string' }
      }
    }
  }
} satisfies Meta<typeof ChartLoadingSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    chartType: 'bar',
    showCardBackground: true,
    animate: true
  }
};

export const Bar: Story = { args: { chartType: 'bar', animate: true } };
export const Combination: Story = { args: { chartType: 'combo', animate: true } };
export const Line: Story = { args: { chartType: 'line', animate: true } };
export const Histogram: Story = { args: { chartType: 'histogram', animate: true } };
export const Donut: Story = { args: { chartType: 'donut', animate: true } };
export const HalfDonut: Story = { args: { chartType: 'half-donut', animate: true } };
export const Sparkline: Story = { args: { chartType: 'sparkline', animate: true } };
export const PointerScaleStory: Story = {
  name: 'Pointer scale',
  args: { chartType: 'pointer-scale', animate: true }
};
export const MapBubble: Story = {
  name: 'Map bubble',
  args: { chartType: 'map-bubble', animate: true }
};
export const Sankey: Story = { args: { chartType: 'sankey', animate: true } };
