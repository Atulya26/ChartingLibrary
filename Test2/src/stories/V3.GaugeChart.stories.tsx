import type { Meta, StoryObj } from '@storybook/react';

import { GaugeChartV3 } from '../v3/charts/GaugeChartV3';
import { v3GaugeRanges } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  colorArg,
  hiddenEventArgTypes,
  numberArg,
  rangeArg,
  surfaceArgTypes,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Half Donut',
  component: GaugeChartV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Gauges are easiest to tune with booleans for legend and rounded caps, ` +
          'and numbers for angles, size, and thickness.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    ranges: advancedDataArg('Advanced gauge ranges. Hidden from controls because array editing is not a good layman workflow.'),
    value: rangeArg(
      'Main gauge value.',
      'Data',
      { min: 0, max: 100, step: 1 }
    ),
    min: numberArg(
      'Minimum scale value.',
      'Data',
      { min: -100, max: 100, step: 1 }
    ),
    max: numberArg(
      'Maximum scale value.',
      'Data',
      { min: 1, max: 200, step: 1 }
    ),
    roundedCaps: booleanArg(
      'Boolean toggle for rounded arc ends.',
      'Style'
    ),
    size: rangeArg(
      'Overall gauge size in pixels.',
      'Layout',
      { min: 160, max: 340, step: 10 }
    ),
    thickness: rangeArg(
      'Arc thickness in pixels.',
      'Layout',
      { min: 8, max: 32, step: 1 }
    ),
    startAngle: rangeArg(
      'Start angle in degrees.',
      'Layout',
      { min: 0, max: 360, step: 5 }
    ),
    sweepAngle: rangeArg(
      'Sweep angle in degrees.',
      'Layout',
      { min: 90, max: 360, step: 5 }
    ),
    valueColor: colorArg('Optional override color for the active arc.', 'Style')
  }
} satisfies Meta<typeof GaugeChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Inpatient follow up',
    value: 45,
    centerLabel: '45%',
    centerSubLabel: '845 of 1,190',
    ranges: v3GaugeRanges,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const WithLegend: Story = {
  args: {
    title: 'Inpatient follow up',
    value: 45,
    centerLabel: '45%',
    centerSubLabel: '845 of 1,190',
    ranges: v3GaugeRanges,
    showLegend: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const CustomAngles: Story = {
  args: {
    title: 'Three-quarter donut',
    value: 65,
    centerLabel: '65%',
    centerSubLabel: '780 of 1,200',
    ranges: v3GaugeRanges,
    sweepAngle: 270,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
