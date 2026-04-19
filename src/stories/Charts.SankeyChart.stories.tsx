import type { Meta, StoryObj } from '@storybook/react';

import { SankeyChart } from '../charts/SankeyChart';
import {
  edFlowLinks,
  edFlowNodes,
  revenueFlowLinks,
  revenueFlowNodes
} from './storyData';
import {
  advancedDataArg,
  baseDocNote,
  booleanArg,
  colorArg,
  hiddenEventArgTypes,
  hoverCardArg,
  numberArg,
  rangeArg,
  selectArg,
  surfaceArgTypes,
  chartMetaParameters
} from './chartStorybook';

const meta = {
  title: 'Charts/Sankey Chart',
  component: SankeyChart,
  tags: ['autodocs'],
  parameters: {
    ...chartMetaParameters,
    docs: {
      description: {
        component:
          `${baseDocNote} For Sankey charts, the most useful day-to-day controls are ` +
          '`linkColorMode`, `highlightMode`, `nodeWidth`, `nodePadding`, and the label toggles. ' +
          'Node colors follow the categorical palette by default (per the color-logic rule: ' +
          '"Multiple series → categorical palette"), and light fills ship with a darker ' +
          'companion stroke for WCAG compliance.'
      }
    }
  },
  argTypes: {
    ...surfaceArgTypes,
    ...hiddenEventArgTypes,
    nodes: advancedDataArg(
      'Advanced Sankey node data. Hidden because raw array editing is not a good layman workflow.'
    ),
    links: advancedDataArg(
      'Advanced Sankey link data. Hidden because raw array editing is not a good layman workflow.'
    ),
    linkColorMode: selectArg(
      ['gradient', 'source', 'target', 'neutral'],
      'How link ribbons are colored: a source→target gradient (most Sankey-like), a single source color, a single target color, or a neutral gray.',
      'Style',
      undefined,
      'inline-radio',
      {
        gradient: 'Source → target gradient',
        source: 'Source color',
        target: 'Target color',
        neutral: 'Neutral gray'
      }
    ),
    highlightMode: selectArg(
      ['link', 'node', 'path'],
      'What gets highlighted on hover. `link` = just the ribbon. `node` = every ribbon touching the node. `path` = the full upstream + downstream flow.',
      'Interaction',
      undefined,
      'inline-radio',
      {
        link: 'Single link',
        node: 'Connected to node',
        path: 'Full upstream + downstream'
      }
    ),
    nodeAlignment: selectArg(
      ['justify', 'left', 'right', 'center'],
      'Horizontal alignment for unconstrained nodes. `justify` distributes evenly; `center` pulls intermediate nodes toward the middle.',
      'Layout',
      undefined,
      'inline-radio',
      {
        justify: 'Justify',
        left: 'Left',
        right: 'Right',
        center: 'Center'
      }
    ),
    showHoverCard: hoverCardArg(),
    showNodeLabels: booleanArg('Boolean toggle for label text next to each node.', 'Display'),
    showNodeValues: booleanArg('Boolean toggle for showing the node throughput value under the label.', 'Display'),
    nodeWidth: rangeArg(
      'Width of each node rectangle in pixels.',
      'Layout',
      { min: 6, max: 28, step: 1 }
    ),
    nodePadding: rangeArg(
      'Vertical gap between nodes in the same column.',
      'Layout',
      { min: 4, max: 40, step: 1 }
    ),
    nodeCornerRadius: rangeArg(
      'Corner radius on node rectangles.',
      'Layout',
      { min: 0, max: 8, step: 1 }
    ),
    linkOpacity: rangeArg(
      'Base link opacity when idle.',
      'Style',
      { min: 0.15, max: 0.8, step: 0.01 }
    ),
    linkDimmedOpacity: rangeArg(
      'Opacity applied to unrelated links during hover.',
      'Style',
      { min: 0, max: 0.4, step: 0.01 }
    ),
    neutralLinkColor: colorArg(
      'Fallback link color for `linkColorMode: neutral`.',
      'Style',
      { arg: 'linkColorMode', eq: 'neutral' }
    ),
    plotWidth: numberArg(
      'Numeric plot width in pixels.',
      'Layout',
      { min: 320, max: 900, step: 10 }
    ),
    plotHeight: numberArg(
      'Numeric plot height in pixels.',
      'Layout',
      { min: 160, max: 520, step: 10 }
    )
  }
} satisfies Meta<typeof SankeyChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PatientFlow: Story = {
  args: {
    title: 'ED patient flow',
    description: 'Arrival mode → triage acuity → disposition → 30-day outcome',
    nodes: edFlowNodes,
    links: edFlowLinks,
    width: 720,
    plotWidth: 640,
    plotHeight: 340,
    linkColorMode: 'gradient',
    highlightMode: 'path',
    showNodeLabels: true,
    showNodeValues: true,
    showHoverCard: true,
    showMenu: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    nodeAlignment: "center",
    nodeCornerRadius: 0,
    nodePadding: 32,
    nodeWidth: 6
  }
};

export const RevenueFlow: Story = {
  args: {
    title: 'Revenue flow',
    description: 'Payer mix → gross charges → adjustments → collected',
    nodes: revenueFlowNodes,
    links: revenueFlowLinks,
    width: 680,
    plotWidth: 600,
    plotHeight: 300,
    linkColorMode: 'gradient',
    highlightMode: 'node',
    showNodeLabels: true,
    showNodeValues: true,
    showHoverCard: true,
    showMenu: true,
    actions: [{ id: 'save-image', label: 'Save', onClick: () => {} }],
    nodeWidth: 6,
    nodePadding: 32,
    nodeCornerRadius: 0
  }
};

export const SourceColoredLinks: Story = {
  args: {
    title: 'ED patient flow — source-colored ribbons',
    description:
      'Ribbons inherit the color of where the flow started. Useful when the story is about where volume originates.',
    nodes: edFlowNodes,
    links: edFlowLinks,
    width: 720,
    plotWidth: 640,
    plotHeight: 340,
    linkColorMode: 'source',
    highlightMode: 'path',
    showNodeLabels: true,
    showNodeValues: false,
    showHoverCard: true
  }
};

export const NeutralLinks: Story = {
  args: {
    title: 'ED patient flow — neutral ribbons',
    description:
      'A single soft gray for every ribbon puts all the visual weight on the nodes. Good for dense flows where color would overwhelm.',
    nodes: edFlowNodes,
    links: edFlowLinks,
    width: 720,
    plotWidth: 640,
    plotHeight: 340,
    linkColorMode: 'neutral',
    highlightMode: 'node',
    showNodeLabels: true,
    showNodeValues: true,
    showHoverCard: true
  }
};

export const CompactNoLabels: Story = {
  args: {
    title: 'ED patient flow',
    nodes: edFlowNodes,
    links: edFlowLinks,
    width: 560,
    plotWidth: 520,
    plotHeight: 260,
    nodeWidth: 10,
    nodePadding: 10,
    linkColorMode: 'gradient',
    showNodeLabels: false,
    showNodeValues: false,
    showLegend: true,
    legendPosition: 'bottom',
    showHoverCard: true,
    highlightMode: 'link'
  }
};
