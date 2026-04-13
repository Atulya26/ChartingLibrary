import type { Meta, StoryObj } from '@storybook/react';

import { LineChartV3 } from '../v3/charts/LineChartV3';
import { selectOptions, v3LineCategories, v3LineSeries } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  hiddenEventArgTypes,
  numberArg,
  surfaceArgTypes,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Line Chart',
  component: LineChartV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} For line charts, keep the live controls focused on layout and display toggles. ` +
          'Series objects, reference lines, and axis config stay hidden because they are better authored in code.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    categories: advancedDataArg('Advanced category labels. Hidden from Storybook controls for a cleaner playground.'),
    series: advancedDataArg('Advanced line-series data. Hidden from controls because raw object editing is not user-friendly.'),
    yAxis: advancedDataArg('Advanced left-axis config.'),
    secondaryYAxis: advancedDataArg('Advanced right-axis config.', { arg: 'showSecondaryYAxis', truthy: true }),
    grid: advancedDataArg('Advanced grid config.'),
    referenceLines: advancedDataArg('Advanced reference lines.'),
    showSecondaryYAxis: booleanArg(
      'Boolean toggle for the right-side axis.'
    ),
    showHoverCard: booleanArg(
      'Boolean toggle for the hover helper card.'
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
} satisfies Meta<typeof LineChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Readmission Trend',
    categories: v3LineCategories,
    series: v3LineSeries,
    selectOptions,
    selectedValue: selectOptions[1].value,
    yAxis: {
      title: 'Rate',
      ticks: ['40', '20', '0']
    },
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const DualAxis: Story = {
  args: {
    title: 'Dual Axis Trend',
    categories: v3LineCategories,
    series: [
      {
        key: 'census',
        label: 'Census',
        data: [24, 30, 28, 36, 34, 40],
        stroke: '#3bceff',
        showDots: true,
        showAreaFill: true
      },
      {
        key: 'utilization',
        label: 'Utilization',
        data: [58, 62, 60, 68, 64, 74],
        stroke: '#c93030',
        lineStyle: 'dashed',
        showDots: false,
        axis: 'right'
      }
    ],
    showSecondaryYAxis: true,
    yAxis: {
      title: 'Census',
      ticks: ['40', '20', '0']
    },
    secondaryYAxis: {
      title: 'Utilization',
      ticks: ['80', '60', '40']
    },
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const WithHoverCards: Story = {
  args: {
    title: 'Readmission Rate',
    categories: v3LineCategories,
    series: v3LineSeries,
    showHoverCard: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
