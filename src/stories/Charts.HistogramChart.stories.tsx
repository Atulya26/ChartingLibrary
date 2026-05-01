import type { Meta, StoryObj } from '@storybook/react';

import { HistogramChart } from '../charts/HistogramChart';
import { histogramBins } from './storyData';
import {
  accessibilityArgTypes,
  advancedDataArg,
  baseDocNote,
  booleanArg,
  fillLegendMarkerLabels,
  fillLegendMarkerOptions,
  fillStyleLabels,
  fillStyleOptions,
  hiddenEventArgTypes,
  hoverCardArg,
  numberArg,
  selectArg,
  surfaceArgTypes,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Histogram',
  component: HistogramChart,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Histograms work best with a simple control model: ` +
          'booleans for overlays and labels, selects for fill style and legend marker, and numbers for size.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    bins: advancedDataArg(
      'Advanced histogram bins. Hidden because raw object editing is not suitable for basic control exploration.'
    ),
    yAxis: advancedDataArg('Advanced y-axis config. Hidden from controls for cleaner UX.'),
    grid: advancedDataArg('Advanced grid config for code-level tuning.'),
    fillStyle: selectArg(
      fillStyleOptions,
      'Chart-level fill override for histogram bars.',
      'Style',
      undefined,
      'select',
      fillStyleLabels
    ),
    legendMarker: selectArg(
      fillLegendMarkerOptions,
      'Legend marker style for the fill-based histogram bars.',
      'Style',
      { arg: 'showLegend', truthy: true },
      'select',
      fillLegendMarkerLabels
    ),
    showHoverCard: hoverCardArg(),
    showTopLabels: booleanArg('Boolean toggle for values above each bin.'),
    overlayLine: booleanArg('Boolean toggle for the overlay line.'),
    overlayDots: booleanArg('Boolean toggle for dots on the overlay line.', 'Display', {
      arg: 'overlayLine',
      truthy: true
    }),
    overlayAreaFill: booleanArg('Boolean toggle for area fill under the overlay line.', 'Display', {
      arg: 'overlayLine',
      truthy: true
    }),
    overlayLegendLabel: advancedDataArg('Advanced legend label for the overlay line.', {
      arg: 'overlayLine',
      truthy: true
    }),
    plotWidth: numberArg('Numeric plot width in pixels.', 'Layout', {
      min: 240,
      max: 700,
      step: 10
    }),
    plotHeight: numberArg('Numeric plot height in pixels.', 'Layout', {
      min: 120,
      max: 360,
      step: 10
    }),
    ...accessibilityArgTypes
  }
} satisfies Meta<typeof HistogramChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'PCP Visits Distribution',
    bins: histogramBins,
    legendPosition: 'bottom',
    showHoverCard: false,
    yAxis: {
      title: 'Members',
      ticks: ['40', '20', '0']
    }
  }
};

export const WithOverlay: Story = {
  args: {
    title: 'PCP Visits Distribution',
    bins: histogramBins,
    overlayLine: true,
    overlayDots: true,
    overlayAreaFill: true,
    overlayLegendLabel: 'Expected distribution',
    showHoverCard: false,
    yAxis: {
      title: 'Members',
      ticks: ['40', '20', '0']
    }
  }
};
