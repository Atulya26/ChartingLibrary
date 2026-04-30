import type { Meta, StoryObj } from '@storybook/react';

import { LineChart } from '../charts/LineChart';
import { chartTokens } from '../theme/tokens';
import { selectOptions, lineCategories, lineSeries } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  colorArg,
  hiddenEventArgTypes,
  hoverCardArg,
  numberArg,
  rangeArg,
  selectArg,
  surfaceArgTypes,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Line Chart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
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
    showHoverCard: hoverCardArg(),
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
} satisfies Meta<typeof LineChart>;

export default meta;

type Story = StoryObj<typeof meta>;

type SingleLineControls = {
  lineColor: string;
  lineStyle: 'solid' | 'dashed';
  lineThickness: number;
  showAreaFill: boolean;
  showLineLabels: boolean;
  labelPosition: 'top' | 'bottom-left';
  showDots: boolean;
  dotSize: 'small' | 'medium' | 'large';
  dotOutline: boolean;
  showTargetLine: boolean;
};

export const Default: Story = {
  args: {
    title: 'Average PMPM Trend',
    categories: lineCategories,
    series: lineSeries,
    selectOptions,
    selectedValue: selectOptions[1].value,
    showHoverCard: false,
    referenceLines: [
      {
        value: 900,
        label: 'Target',
        color: chartTokens.categorical.primary
      }
    ],
    yAxis: {
      title: 'PMPM',
      ticks: ['$1,300', '$1,100', '$900']
    },
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const SingleLinePlayground: Story = {
  name: 'Single Axis',
  args: {
    title: 'Title',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    series: [],
    width: 502,
    plotHeight: 206,
    showHoverCard: false,
    showLegend: true,
    showMenu: true,
    yAxis: {
      ticks: ['100%', '50%', '0%'],
      min: 0,
      max: 100
    },
    grid: {
      count: 3
    },
    lineColor: chartTokens.sequential.purple.default,
    lineStyle: 'solid',
    lineThickness: 2,
    showAreaFill: true,
    showLineLabels: true,
    labelPosition: 'top',
    showDots: true,
    dotSize: 'medium',
    dotOutline: true,
    showTargetLine: true
  } as any,
  argTypes: {
    lineColor: colorArg(
      'Color applied to the single line, dots, legend marker, and labels.',
      'Line style'
    ),
    lineStyle: selectArg(
      ['solid', 'dashed'],
      'Choose a solid or dashed line style.',
      'Line style',
      undefined,
      'inline-radio',
      {
        solid: 'Solid',
        dashed: 'Dashed'
      }
    ),
    lineThickness: rangeArg(
      'Line thickness in pixels.',
      'Line style',
      { min: 1, max: 6, step: 1 }
    ),
    showAreaFill: booleanArg(
      'Toggle the soft area fill under the line.',
      'Area fill'
    ),
    showLineLabels: booleanArg(
      'Toggle numeric labels on each point.',
      'Line labels'
    ),
    labelPosition: selectArg(
      ['top', 'bottom-left'],
      'Position labels above the point or bottom-left of the point.',
      'Line labels',
      { arg: 'showLineLabels', truthy: true },
      'inline-radio',
      {
        top: 'Top',
        'bottom-left': 'Bottom left'
      }
    ),
    showDots: booleanArg(
      'Toggle point dots.',
      'Dots'
    ),
    dotSize: selectArg(
      ['small', 'medium', 'large'],
      'Finite dot size choice.',
      'Dots',
      { arg: 'showDots', truthy: true },
      'inline-radio',
      {
        small: 'Small',
        medium: 'Medium',
        large: 'Large'
      }
    ),
    dotOutline: booleanArg(
      'Use an outlined dot instead of a filled dot.',
      'Dots',
      { arg: 'showDots', truthy: true }
    ),
    showTargetLine: booleanArg(
      'Toggle a target reference line.',
      'Reference line'
    )
  } as any,
  render: (args) => {
    const {
      lineColor,
      lineStyle,
      lineThickness,
      showAreaFill,
      showLineLabels,
      labelPosition,
      showDots,
      dotSize,
      dotOutline,
      showTargetLine,
      ...chartArgs
    } = args as typeof args & SingleLineControls;

    return (
      <LineChart
        {...chartArgs}
        series={[
          {
            key: 'current',
            label: 'Current',
            data: [58, 56, 68, 50, 65, 36, 31, 36],
            stroke: lineColor,
            lineStyle,
            strokeWidth: lineThickness,
            showAreaFill,
            showLabels: showLineLabels,
            labelPosition,
            showDots,
            dotSize,
            dotOutline,
            marker: lineStyle === 'dashed' ? 'dot-line-dashed' : 'dot-line'
          }
        ]}
        referenceLines={
          showTargetLine
            ? [
                {
                  value: 28,
                  label: 'Target',
                  color: chartTokens.text.subtle
                }
              ]
            : []
        }
      />
    );
  }
};

export const DualAxis: Story = {
  args: {
    title: 'Monthly census and utilization',
    categories: lineCategories,
    series: [
      {
        key: 'census',
        label: 'Census',
        data: [24, 30, 28, 36],
        stroke: chartTokens.categorical.secondary,
        showDots: true,
        showAreaFill: true
      },
      {
        key: 'utilization',
        label: 'Utilization',
        data: [58, 62, 60, 68],
        stroke: chartTokens.sequential.red.dark,
        lineStyle: 'dashed',
        showDots: false,
        axis: 'right'
      }
    ],
    showSecondaryYAxis: true,
    showHoverCard: false,
    yAxis: {
      title: 'Census',
      ticks: ['40', '20', '0'],
      min: 0,
      max: 40
    },
    secondaryYAxis: {
      title: 'Utilization',
      ticks: ['80', '60', '40'],
      min: 40,
      max: 80
    },
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
