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
  rangeArg,
  selectArg,
  surfaceArgTypes,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Combination Chart',
  component: ComboChartV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Combination charts are easiest to explore with ` +
          '`barLayout`, `barFillStyle`, `barLegendMarker`, and the line visibility toggles.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    categories: advancedDataArg('Advanced x-axis categories. Hidden from controls for easier day-to-day usage.'),
    barSeries: advancedDataArg('Advanced bar-series data. Use style and layout controls instead of raw JSON editing.'),
    lineSeries: advancedDataArg('Advanced line-series data. Hidden from controls because raw object editing is brittle.'),
    barLayout: selectArg(
      ['grouped', 'stacked'],
      'Finite bar layout choice for the column layer.',
      'Structure',
      undefined,
      'inline-radio',
      {
        grouped: 'Grouped',
        stacked: 'Stacked'
      }
    ),
    barFillStyle: selectArg(
      fillStyleOptions,
      'Chart-level fill override for the bar layer. This is the easiest way to test solid vs texture vs gradient.',
      'Style',
      undefined,
      'select',
      fillStyleLabels
    ),
    barLegendMarker: selectArg(
      fillLegendMarkerOptions,
      'Legend marker style for the fill-based bar series.',
      'Style',
      undefined,
      'select',
      fillLegendMarkerLabels
    ),
    showOverlayLine: booleanArg(
      'Boolean toggle for showing or hiding the line layer.'
    ),
    showSecondaryYAxis: booleanArg(
      'Boolean toggle for the right-side axis.'
    ),
    barGap: rangeArg(
      'Numeric gap in pixels between grouped bars.',
      'Layout',
      { min: 0, max: 12, step: 1 }
    ),
    categoryGapRatio: rangeArg(
      'Numeric ratio for spacing between category groups.',
      'Layout',
      { min: 0, max: 0.8, step: 0.05 }
    ),
    barCornerRadius: rangeArg(
      'Numeric bar corner radius in pixels.',
      'Layout',
      { min: 0, max: 12, step: 1 }
    ),
    plotWidth: numberArg(
      'Numeric plot width for the combined plot area.',
      'Layout',
      { min: 240, max: 700, step: 10 }
    ),
    plotHeight: numberArg(
      'Numeric plot height for the combined plot area.',
      'Layout',
      { min: 120, max: 360, step: 10 }
    ),
    yAxis: advancedDataArg('Advanced left-axis config. Hidden from controls for a cleaner UX.'),
    secondaryYAxis: advancedDataArg('Advanced right-axis config. Hidden from controls for a cleaner UX.'),
    grid: advancedDataArg('Advanced grid config for code-level tuning.')
  }
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
