import type { Meta, StoryObj } from '@storybook/react';

import { ChartStateCard } from '../components/ChartStateCard';
import { booleanArg, chartMetaParameters, numberArg } from './chartStorybook';

const meta = {
  title: 'States/Empty',
  component: ChartStateCard,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          'Empty state for a chart card — used when there is no data to render. Same card chrome as the loading skeleton so consumers can swap between async states without layout shift. Tone is neutral; empty is not a failure.'
      }
    }
  },
  argTypes: {
    variant: { table: { disable: true } },
    width: numberArg('Card width.', 'Layout', { min: 280, max: 800, step: 10 }),
    bodyHeight: numberArg(
      'Plot-area min-height. Match this to the chart it replaces to avoid layout shift.',
      'Layout',
      { min: 120, max: 360, step: 10 }
    ),
    showCardBackground: booleanArg('Toggle the card surface.', 'Display'),
    title: { control: { type: 'text' }, table: { category: 'Content' } },
    headline: { control: { type: 'text' }, table: { category: 'Content' } },
    description: { control: { type: 'text' }, table: { category: 'Content' } },
    primaryActionLabel: {
      control: { type: 'text' },
      table: { category: 'Actions' }
    },
    secondaryActionLabel: {
      control: { type: 'text' },
      table: { category: 'Actions' }
    },
    onPrimaryAction: { table: { disable: true } },
    onSecondaryAction: { table: { disable: true } }
  }
} satisfies Meta<typeof ChartStateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'empty',
    title: 'Active sessions'
  }
};

export const WithResetFilters: Story = {
  name: 'With "Reset filters" action',
  args: {
    variant: 'empty',
    title: 'Active sessions',
    headline: 'No sessions match these filters',
    description: 'Try widening the date range or clearing one of the filters above.',
    primaryActionLabel: 'Reset filters'
  }
};

export const NewEntity: Story = {
  name: 'Brand-new entity',
  args: {
    variant: 'empty',
    title: 'Cohort engagement',
    headline: 'No data yet',
    description: 'Once members start completing activities this chart will populate automatically.'
  }
};
