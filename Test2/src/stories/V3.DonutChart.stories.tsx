import type { Meta, StoryObj } from '@storybook/react';

import { DonutChartV3 } from '../v3/charts/DonutChartV3';
import { v3DonutSegments } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  fillLegendMarkerLabels,
  fillLegendMarkerOptions,
  fillStyleLabels,
  fillStyleOptions,
  hiddenEventArgTypes,
  rangeArg,
  selectArg,
  surfaceArgTypes,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Donut Chart',
  component: DonutChartV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
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
    roundedCaps: booleanArg(
      'Boolean toggle for rounded donut segment ends.',
      'Style'
    ),
    showLabels: booleanArg(
      'Boolean toggle for outside segment labels.'
    ),
    size: rangeArg(
      'Numeric outer size of the donut in pixels.',
      'Layout',
      { min: 120, max: 320, step: 10 }
    ),
    thickness: rangeArg(
      'Numeric ring thickness in pixels.',
      'Layout',
      { min: 8, max: 32, step: 1 }
    )
  }
} satisfies Meta<typeof DonutChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Pie Chart Example',
    segments: v3DonutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'bottom',
    showLegend: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const LabelsHidden: Story = {
  args: {
    title: 'Care Setting Mix',
    segments: v3DonutSegments,
    showLabels: false,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    showLegend: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const LegendTop: Story = {
  args: {
    title: 'Pie Chart Example',
    segments: v3DonutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'top',
    showLegend: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};

export const LegendBottom: Story = {
  args: {
    title: 'Pie Chart Example',
    segments: v3DonutSegments,
    centerLabel: '100M',
    centerSubLabel: 'Target',
    legendPosition: 'bottom',
    showLegend: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    showMenu: true
  }
};
