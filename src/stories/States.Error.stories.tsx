import type { Meta, StoryObj } from '@storybook/react';

import { ChartStateCard } from '../components/ChartStateCard';
import { booleanArg, chartMetaParameters, numberArg } from './chartStorybook';

const meta = {
  title: 'States/Error',
  component: ChartStateCard,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          'Error state for a chart card — used when data fetching or rendering has failed. Card chrome matches the loading and empty states. Always provide a Retry action when the failure is transient.'
      }
    }
  },
  argTypes: {
    variant: { table: { disable: true } },
    width: numberArg('Card width.', 'Layout', { min: 280, max: 800, step: 10 }),
    bodyHeight: numberArg(
      'Plot-area min-height.',
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
    variant: 'error',
    title: 'Active sessions'
  }
};

export const WithRetry: Story = {
  name: 'With Retry + Report',
  args: {
    variant: 'error',
    title: 'Active sessions',
    headline: 'Couldn’t load this chart',
    description: 'A network timeout interrupted the request. Retry, or report the issue if it keeps happening.',
    primaryActionLabel: 'Retry',
    secondaryActionLabel: 'Report issue'
  }
};

export const PermissionDenied: Story = {
  name: 'Permission denied',
  args: {
    variant: 'error',
    title: 'Cohort engagement',
    headline: 'You don’t have access to this chart',
    description: 'Ask an administrator for the “Analytics viewer” role and try again.',
    primaryActionLabel: 'Contact admin'
  }
};
