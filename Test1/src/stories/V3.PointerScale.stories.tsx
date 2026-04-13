import type { Meta, StoryObj } from '@storybook/react';

import { PointerScaleV3 } from '../v3/charts/PointerScaleV3';
import { v3PointerRanges } from './storyData';

const meta = {
  title: 'V3/Pointer Scale',
  component: PointerScaleV3,
  tags: ['autodocs']
} satisfies Meta<typeof PointerScaleV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Linear: Story = {
  args: {
    title: 'Risk Score',
    value: 58,
    target: 70,
    ranges: v3PointerRanges,
    mode: 'linear'
  }
};

export const Curved: Story = {
  args: {
    title: 'Utilization Scale',
    value: 72,
    target: 80,
    ranges: v3PointerRanges,
    mode: 'curved'
  }
};
