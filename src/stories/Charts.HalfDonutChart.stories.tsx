import type { Meta, StoryObj } from '@storybook/react';

import { HalfDonutChart } from '../charts/HalfDonutChart';
import { halfDonutRanges } from './storyData';
import {
  accessibilityArgTypes,
  advancedDataArg,
  baseDocNote,
  booleanArg,
  colorArg,
  hiddenEventArgTypes,
  hoverCardArg,
  numberArg,
  rangeArg,
  surfaceArgTypes,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Half Donut',
  component: HalfDonutChart,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Half-donut charts are easiest to tune with booleans for legend and rounded caps, ` +
          'and numbers for angles, size, and thickness.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    ranges: advancedDataArg(
      'Advanced half-donut ranges. Hidden from controls because array editing is not a good layman workflow.'
    ),
    value: rangeArg('Main half-donut value.', 'Data', { min: 0, max: 100, step: 1 }),
    min: numberArg('Minimum scale value.', 'Data', { min: -100, max: 100, step: 1 }),
    max: numberArg('Maximum scale value.', 'Data', { min: 1, max: 200, step: 1 }),
    roundedCaps: booleanArg('Boolean toggle for rounded arc ends.', 'Style'),
    showHoverCard: hoverCardArg(),
    size: rangeArg('Overall half-donut size in pixels.', 'Layout', {
      min: 160,
      max: 340,
      step: 10
    }),
    thickness: rangeArg('Arc thickness in pixels.', 'Layout', { min: 8, max: 32, step: 1 }),
    startAngle: rangeArg('Start angle in degrees.', 'Layout', { min: 0, max: 360, step: 5 }),
    sweepAngle: rangeArg('Sweep angle in degrees.', 'Layout', { min: 90, max: 360, step: 5 }),
    valueColor: colorArg('Optional override color for the active arc.', 'Style'),
    ...accessibilityArgTypes
  }
} satisfies Meta<typeof HalfDonutChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Inpatient follow up',
    value: 46,
    centerLabel: '46%',
    centerSubLabel: '(891 of 1,937)',
    ranges: halfDonutRanges,
    showHoverCard: false,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const WithLegend: Story = {
  args: {
    title: 'ED Outreach',
    value: 71,
    centerLabel: '71%',
    centerSubLabel: '(845 of 1,190)',
    ranges: halfDonutRanges,
    showLegend: true,
    showHoverCard: false,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const CustomAngles: Story = {
  args: {
    title: 'Diabetes A1c control',
    value: 82,
    centerLabel: '82%',
    centerSubLabel: '(600 of 731)',
    ranges: halfDonutRanges,
    showHoverCard: false,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
