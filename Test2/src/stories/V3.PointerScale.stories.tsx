import type { Meta, StoryObj } from '@storybook/react';

import { PointerScaleV3 } from '../v3/charts/PointerScaleV3';
import { v3PointerRanges } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  hiddenEventArgTypes,
  numberArg,
  rangeArg,
  surfaceArgTypes,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Pointer Scale',
  component: PointerScaleV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
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
    )
  }
} satisfies Meta<typeof PointerScaleV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Risk Score',
    value: 58,
    target: 70,
    ranges: v3PointerRanges,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true,
    showLegend: true
  }
};
