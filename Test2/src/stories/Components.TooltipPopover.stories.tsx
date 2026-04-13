import type { Meta, StoryObj } from '@storybook/react';

import { TooltipPopover } from '../components/TooltipPopover';
import { tooltipRows } from './storyData';

const meta = {
  title: 'Components/Tooltip Popover',
  component: TooltipPopover,
  tags: ['autodocs'],
  args: {
    title: 'Title',
    rows: tooltipRows
  }
} satisfies Meta<typeof TooltipPopover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTotal: Story = {
  args: {
    totalLabel: 'Total',
    totalValue: 141
  }
};
