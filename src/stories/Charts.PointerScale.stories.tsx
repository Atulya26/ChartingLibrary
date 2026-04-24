import type { Meta, StoryObj } from '@storybook/react';

import { PointerScale } from '../charts/PointerScale';
import { pointerRanges } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  hiddenEventArgTypes,
  hoverCardArg,
  numberArg,
  rangeArg,
  surfaceArgTypes,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Pointer Scale',
  component: PointerScale,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} Pointer scales are best explored with numeric controls for ` +
          '`value`, `target`, and range limits, while the underlying range bands remain advanced data.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    ranges: advancedDataArg('Advanced pointer-band ranges. Hidden from controls because raw array editing is not friendly.'),
    value: rangeArg(
      'Current pointer value.',
      'Data',
      { min: 0, max: 100, step: 1 }
    ),
    target: rangeArg(
      'Optional target marker value.',
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
    showHoverCard: hoverCardArg()
  }
} satisfies Meta<typeof PointerScale>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'HHSCC Risk Score',
    value: 30,
    target: 66,
    centerLabel: '0.23',
    ranges: pointerRanges,
    showHoverCard: false,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true,
    showLegend: true
  }
};
