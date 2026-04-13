import type { Meta, StoryObj } from '@storybook/react';

import { MapBubbleChartV3 } from '../v3/charts/MapBubbleChartV3';
import { v3MapBubblePoints } from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  colorArg,
  fillLegendMarkerLabels,
  fillLegendMarkerOptions,
  fillStyleLabels,
  fillStyleOptions,
  hiddenEventArgTypes,
  numberArg,
  rangeArg,
  selectArg,
  surfaceArgTypes,
  v3MetaParameters
} from './v3Storybook';

const meta = {
  title: 'V3/Map Bubble Chart',
  component: MapBubbleChartV3,
  tags: ['autodocs'],
  parameters: {
    ...v3MetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} For map bubbles, the simplest useful controls are scope, table vs map view, ` +
          'bubble sizing, and fill/outline behavior. Geographic point data stays advanced.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    points: advancedDataArg('Advanced geographic point data. Hidden from controls because raw lat/lon editing is not user-friendly.'),
    tableConfig: advancedDataArg('Advanced table fallback config.', { arg: 'view', eq: 'table' }),
    view: selectArg(
      ['map', 'table'],
      'Use a select because the view has two clear modes: visual map or tabular fallback.',
      'Structure',
      undefined,
      'inline-radio',
      {
        map: 'Map',
        table: 'Table'
      }
    ),
    regionScope: selectArg(
      ['us', 'state'],
      'Switch between full-country and single-state scope.',
      'Structure',
      { arg: 'view', eq: 'map' },
      'inline-radio',
      {
        us: 'United States',
        state: 'Single state'
      }
    ),
    stateCode: selectArg(
      ['AZ', 'CA', 'CO', 'FL', 'GA', 'IL', 'MA', 'MN', 'NY', 'TX', 'WA'],
      'State selector for the state-scope map view.',
      'Structure',
      { arg: 'regionScope', eq: 'state' },
      'select',
      {
        AZ: 'Arizona',
        CA: 'California',
        CO: 'Colorado',
        FL: 'Florida',
        GA: 'Georgia',
        IL: 'Illinois',
        MA: 'Massachusetts',
        MN: 'Minnesota',
        NY: 'New York',
        TX: 'Texas',
        WA: 'Washington'
      }
    ),
    bubbleSort: selectArg(
      ['none', 'ascending', 'descending'],
      'Finite bubble draw-order choice.',
      'Structure',
      { arg: 'view', eq: 'map' },
      'select',
      {
        none: 'Original order',
        ascending: 'Small to large',
        descending: 'Large to small'
      }
    ),
    sizeScale: selectArg(
      ['linear', 'sqrt'],
      'Size scaling strategy for bubble radii.',
      'Style',
      { arg: 'view', eq: 'map' },
      'inline-radio',
      {
        linear: 'Linear',
        sqrt: 'Square root'
      }
    ),
    fillStyle: selectArg(
      fillStyleOptions,
      'Chart-level fill override for bubbles.',
      'Style',
      { arg: 'view', eq: 'map' },
      'select',
      fillStyleLabels
    ),
    legendMarker: selectArg(
      fillLegendMarkerOptions,
      'Legend marker style for the fill-based bubble symbols.',
      'Style',
      { arg: 'showLegend', truthy: true },
      'select',
      fillLegendMarkerLabels
    ),
    bubbleStyle: selectArg(
      ['filled', 'outlined', 'both'],
      'Bubble rendering mode.',
      'Style',
      { arg: 'view', eq: 'map' },
      'inline-radio',
      {
        filled: 'Filled',
        outlined: 'Outlined',
        both: 'Filled + outlined'
      }
    ),
    minBubbleRadius: rangeArg(
      'Minimum bubble radius in pixels.',
      'Layout',
      { min: 2, max: 16, step: 1 },
      { arg: 'view', eq: 'map' }
    ),
    maxBubbleRadius: rangeArg(
      'Maximum bubble radius in pixels.',
      'Layout',
      { min: 8, max: 40, step: 1 },
      { arg: 'view', eq: 'map' }
    ),
    plotWidth: numberArg(
      'Numeric plot width in pixels.',
      'Layout',
      { min: 280, max: 760, step: 10 },
      { arg: 'view', eq: 'map' }
    ),
    plotHeight: numberArg(
      'Numeric plot height in pixels.',
      'Layout',
      { min: 180, max: 480, step: 10 },
      { arg: 'view', eq: 'map' }
    ),
    showCountyLines: booleanArg(
      'Boolean toggle for county boundaries in state view.',
      'Display',
      { arg: 'regionScope', eq: 'state' }
    ),
    showBubbleShadow: booleanArg(
      'Boolean toggle for bubble shadow rendering.',
      'Style',
      { arg: 'view', eq: 'map' }
    ),
    backgroundFill: colorArg(
      'Background color for the map frame.',
      'Style',
      { arg: 'view', eq: 'map' }
    ),
    landFill: colorArg(
      'Land color for states or counties.',
      'Style',
      { arg: 'view', eq: 'map' }
    ),
    borderColor: colorArg(
      'Border color for geographic outlines.',
      'Style',
      { arg: 'view', eq: 'map' }
    )
  }
} satisfies Meta<typeof MapBubbleChartV3>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UnitedStatesView: Story = {
  args: {
    title: 'Hospital Network',
    points: v3MapBubblePoints,
    legendPosition: 'bottom',
    showLegend: true,
    showHeader: true,
    showMenu: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }]
  }
};

export const FloridaStateView: Story = {
  args: {
    title: 'Florida Network',
    points: v3MapBubblePoints,
    regionScope: 'state',
    stateCode: 'FL',
    legendPosition: 'bottom',
    showLegend: true,
    showHeader: true,
    showMenu: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }]
  }
};

export const TableView: Story = {
  args: {
    title: 'Hospital Network',
    points: v3MapBubblePoints,
    view: 'table',
    showLegend: false,
    showHeader: true,
    showMenu: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }]
  }
};
