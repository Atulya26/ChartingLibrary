import type { Meta, StoryObj } from '@storybook/react';

import { HistogramChartV3 } from '../v3/charts/HistogramChartV3';
import { v3HistogramBins } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  fillLegendMarkerLabels,
  fillLegendMarkerOptions,
  fillStyleLabels,
  fillStyleOptions,
  hiddenEventArgTypes,
  numberArg,
  selectArg,
  surfaceArgTypes,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Histogram',
  component: HistogramChartV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
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
    bins: advancedDataArg('Advanced histogram bins. Hidden because raw object editing is not suitable for basic control exploration.'),
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
    showTopLabels: booleanArg(
      'Boolean toggle for values above each bin.'
    ),
    overlayLine: booleanArg(
      'Boolean toggle for the overlay line.'
    ),
    overlayDots: booleanArg(
      'Boolean toggle for dots on the overlay line.',
      'Display',
      { arg: 'overlayLine', truthy: true }
    ),
    overlayAreaFill: booleanArg(
      'Boolean toggle for area fill under the overlay line.',
      'Display',
      { arg: 'overlayLine', truthy: true }
    ),
    overlayLegendLabel: advancedDataArg(
      'Advanced legend label for the overlay line.',
      { arg: 'overlayLine', truthy: true }
    ),
    plotWidth: numberArg(
      'Numeric plot width in pixels.',
      'Layout',
      { min: 240, max: 700, step: 10 }
    ),
    plotHeight: numberArg(
      'Numeric plot height in pixels.',
      'Layout',
      { min: 120, max: 360, step: 10 }
    )
  }
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
