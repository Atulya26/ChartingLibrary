import type { Meta, StoryObj } from '@storybook/react';

import { DonutChart } from '../charts/DonutChart';
import { donutSegments } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  fillLegendMarkerLabels,
  fillLegendMarkerOptions,
  fillStyleLabels,
  fillStyleOptions,
  hiddenEventArgTypes,
  hoverCardArg,
  rangeArg,
  selectArg,
  surfaceArgTypes,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Donut Chart',
  component: DonutChart,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} For donut charts, the most useful everyday props are ` +
          '`fillStyle`, `legendMarker`, `labelMode`, `roundedCaps`, and the size controls.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    segments: advancedDataArg(
      'Advanced donut segment data. Hidden from controls because raw segment editing is not a layman-friendly playground.'
    ),
    fillStyle: selectArg(
      fillStyleOptions,
      'Chart-level fill override for all segments. Use this to quickly compare solid, texture, and gradient rendering.',
      'Style',
      undefined,
      'select',
      fillStyleLabels
    ),
    legendMarker: selectArg(
      fillLegendMarkerOptions,
      'Legend marker style for this fill-based chart.',
      'Style',
      { arg: 'showLegend', truthy: true },
      'select',
      fillLegendMarkerLabels
    ),
    showHoverCard: hoverCardArg(),
    labelMode: selectArg(
      ['value', 'percent', 'label', 'label-percent'],
      'Finite label content choice for outside labels.',
      'Display',
      undefined,
      'select',
      {
        value: 'Value only',
        percent: 'Percent only',
        label: 'Label only',
        'label-percent': 'Label + percent'
      }
    ),
    roundedCaps: booleanArg('Boolean toggle for rounded donut segment ends.', 'Style'),
    showLabels: booleanArg('Boolean toggle for outside segment labels.'),
    size: rangeArg('Numeric outer size of the donut in pixels.', 'Layout', {
      min: 120,
      max: 320,
      step: 10
    }),
    thickness: rangeArg('Numeric ring thickness in pixels.', 'Layout', { min: 8, max: 32, step: 1 })
  }
} satisfies Meta<typeof DonutChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Revenue Goal',
    segments: donutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'bottom',
    showLegend: true,
    showHoverCard: false,
    roundedCaps: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const LabelsHidden: Story = {
  args: {
    title: 'Revenue Goal',
    segments: donutSegments,
    showLabels: false,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    showLegend: true,
    showHoverCard: false,
    roundedCaps: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const LegendTop: Story = {
  args: {
    title: 'Revenue Goal',
    segments: donutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'top',
    showLegend: true,
    showHoverCard: false,
    roundedCaps: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const LegendBottom: Story = {
  args: {
    title: 'Revenue Goal',
    segments: donutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'bottom',
    showLegend: true,
    showHoverCard: false,
    roundedCaps: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const FlatCaps: Story = {
  args: {
    title: 'Revenue Goal',
    segments: donutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'bottom',
    showLegend: true,
    showHoverCard: false,
    roundedCaps: false,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
