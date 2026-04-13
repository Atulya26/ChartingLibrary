import type { Meta, StoryObj } from '@storybook/react';

import { MapBubbleChartV3 } from '../v3/charts/MapBubbleChartV3';
import { v3MapBubblePoints } from './storyData';

const meta = {
  title: 'V3/Map Bubble Chart',
  component: MapBubbleChartV3,
  tags: ['autodocs']
} satisfies Meta<typeof MapBubbleChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UnitedStatesView: Story = {
  args: {
    title: 'Hospital Network',
    points: v3MapBubblePoints,
    legendPosition: 'bottom'
  }
};

export const FloridaStateView: Story = {
  args: {
    title: 'Florida Network',
    points: v3MapBubblePoints,
    regionScope: 'state',
    stateCode: 'FL',
    legendPosition: 'bottom'
  }
};

export const TableView: Story = {
  args: {
    title: 'Hospital Network',
    points: v3MapBubblePoints,
    view: 'table',
    showLegend: false
  }
};
