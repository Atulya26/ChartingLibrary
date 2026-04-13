import type { Meta, StoryObj } from '@storybook/react';

import { Legend } from '../components/Legend';
import { legendMarkers } from './storyData';

const meta = {
  title: 'Components/Legend',
  component: Legend,
  tags: ['autodocs'],
  args: {
    title: 'Title',
    items: legendMarkers
  }
} satisfies Meta<typeof Legend>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Stacked: Story = {
  args: {
    orientation: 'stacked',
    title: undefined
  }
};
