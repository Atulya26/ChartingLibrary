import type { Meta, StoryObj } from '@storybook/react';

import { BarChartV3 } from '../v3/charts/BarChartV3';
import {
  chartActions,
  selectOptions,
  v3BarCategories,
  v3BarSeries,
  v3DistributionSegments,
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
  title: 'V3/Bar Chart',
  component: BarChartV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} For bars, the best everyday controls are ` +
          '`mode`, `layout`, `fillStyle`, `legendMarker`, and the label toggles.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    categories: advancedDataArg(
      'Advanced category labels. Hidden from controls so people do not have to edit raw arrays.',
      { arg: 'mode', neq: 'distribution' }
    ),
    series: advancedDataArg(
      'Advanced bar data. For normal exploration, use `fillStyle`, `layout`, and label toggles instead of editing raw series objects.',
      { arg: 'mode', neq: 'distribution' }
    ),
    distributionSegments: advancedDataArg(
      'Advanced segmented-distribution data. Hidden because raw object editing is not a good layman control.',
      { arg: 'mode', eq: 'distribution' }
    ),
    mode: selectArg(
      ['vertical', 'distribution'],
      'Use `vertical` for standard bar charts and `distribution` for segmented proportion bands.',
      'Structure',
      undefined,
      'inline-radio',
      {
        vertical: 'Standard bars',
        distribution: 'Distribution band'
      }
    ),
    layout: selectArg(
      ['grouped', 'stacked'],
      'Finite bar layout choice for vertical bars.',
      'Structure',
      { arg: 'mode', neq: 'distribution' },
      'inline-radio',
      {
        grouped: 'Grouped',
        stacked: 'Stacked'
      }
    ),
    fillStyle: selectArg(
      fillStyleOptions,
      'Best as a select because fill style is a closed visual set. This applies a chart-level bar fill style override.',
      'Style',
      { arg: 'mode', neq: 'distribution' },
      'select',
      fillStyleLabels
    ),
    legendMarker: selectArg(
      fillLegendMarkerOptions,
      'Best as a select because fill-based charts only need a few legend marker styles.',
      'Style',
      { arg: 'mode', neq: 'distribution' },
      'select',
      fillLegendMarkerLabels
    ),
    showSegmentLabels: booleanArg(
      'Boolean toggle for segment value labels on stacked bars.',
      'Display',
      { arg: 'mode', neq: 'distribution' }
    ),
    showTotalLabels: booleanArg(
      'Boolean toggle for top total labels on stacked bars.',
      'Display',
      { arg: 'mode', neq: 'distribution' }
    ),
    showScale: booleanArg(
      'Boolean toggle for the helper scale under distribution mode.',
      'Display',
      { arg: 'mode', eq: 'distribution' }
    ),
    barHeight: rangeArg(
      'Numeric height for the distribution band.',
      'Layout',
      { min: 12, max: 40, step: 2 },
      { arg: 'mode', eq: 'distribution' }
    ),
    groupGapRatio: rangeArg(
      'Numeric ratio for space between category groups.',
      'Layout',
      { min: 0, max: 0.8, step: 0.05 },
      { arg: 'mode', neq: 'distribution' }
    ),
    barGap: rangeArg(
      'Numeric gap in pixels between grouped bars.',
      'Layout',
      { min: 0, max: 12, step: 1 },
      { arg: 'mode', neq: 'distribution' }
    ),
    barCornerRadius: rangeArg(
      'Numeric bar corner radius in pixels.',
      'Layout',
      { min: 0, max: 12, step: 1 },
      { arg: 'mode', neq: 'distribution' }
    ),
    plotWidth: numberArg(
      'Numeric plot width for the chart area.',
      'Layout',
      { min: 240, max: 700, step: 10 },
      { arg: 'mode', neq: 'distribution' }
    ),
    plotHeight: numberArg(
      'Numeric plot height for the chart area.',
      'Layout',
      { min: 120, max: 360, step: 10 },
      { arg: 'mode', neq: 'distribution' }
    ),
    yAxis: advancedDataArg(
      'Advanced axis config. Hidden because object editing is better handled in code or story presets.',
      { arg: 'mode', neq: 'distribution' }
    ),
    grid: advancedDataArg(
      'Advanced grid config for code-level tweaking.',
      { arg: 'mode', neq: 'distribution' }
    )
  }
} satisfies Meta<typeof BarChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Grouped: Story = {
  args: {
    title: 'Bar Chart',
    categories: v3BarCategories,
    series: v3BarSeries,
    actions: chartActions.slice(0, 3),
    showMenu: true,
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
    actions: chartActions.slice(0, 3),
    showMenu: true,
    yAxis: {
      title: 'Claims',
      ticks: ['60', '40', '20']
    }
  }
};

export const Distribution: Story = {
  args: {
    title: 'Opportunity per patient',
    mode: 'distribution',
    distributionSegments: v3DistributionSegments,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const DistributionWithScale: Story = {
  args: {
    title: 'ACG Risk Distribution',
    mode: 'distribution',
    distributionSegments: v3DistributionSegments,
    showScale: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
