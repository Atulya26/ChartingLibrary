import { chartTokens } from '../theme/tokens';
import type {
  BarSeries,
  ChartAction,
  DistributionSegment,
  DonutSegment,
  HalfDonutRange,
  HistogramBin,
  LegendItem,
  LineSeriesConfig,
  MapBubblePoint,
  PointerScaleRange,
  SankeyLink,
  SankeyNode,
  SelectOption,
  TooltipRow
} from '../types';

export const chartActions: ChartAction[] = [
  { id: 'restore', label: 'Restore' },
  { id: 'line-view', label: 'Line chart view' },
  { id: 'bar-view', label: 'Bar chart view' },
  { id: 'data-view', label: 'Data view' },
  { id: 'zoom-in', label: 'Zoom in' },
  { id: 'zoom-out', label: 'Zoom out' },
  { id: 'save-image', label: 'Save image' }
];

export const compactChartActions: ChartAction[] = [
  { id: 'zoom-in', label: 'Zoom in' },
  { id: 'zoom-out', label: 'Zoom out' },
  { id: 'save-image', label: 'Save image' }
];

export const selectOptions: SelectOption[] = [
  { label: 'Select', value: 'select' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Pipeline', value: 'pipeline' }
];

export const legendMarkers: LegendItem[] = [
  {
    label: 'Solid',
    color: chartTokens.categorical.primary,
    marker: 'solid'
  },
  {
    label: 'Texture',
    color: chartTokens.categorical.primary,
    strokeColor: chartTokens.categorical.primary,
    marker: 'solid-texture'
  },
  {
    label: 'Dot line',
    color: chartTokens.categorical.secondary,
    strokeColor: chartTokens.categorical.secondary,
    marker: 'dot-line'
  },
  {
    label: 'Dashed line',
    color: chartTokens.categorical.secondary,
    strokeColor: chartTokens.categorical.secondary,
    marker: 'line-dashed'
  }
];

export const tooltipRows: TooltipRow[] = [
  {
    label: 'Placeholder',
    value: 65,
    color: chartTokens.categorical.primary,
    marker: 'solid'
  },
  {
    label: 'Placeholder',
    value: 76,
    color: chartTokens.categorical.secondary,
    marker: 'dot-line'
  }
];

export const barCategories = ['Commercial', 'Medicaid', 'Medicare'];

export const barSeries: BarSeries[] = [
  {
    key: 'revenue-generated',
    label: 'Revenue generated',
    fill: chartTokens.categorical.primary,
    stroke: chartTokens.categorical.primary,
    data: [45, 40, 20]
  },
  {
    key: 'revenue-targeted',
    label: 'Revenue targeted',
    fill: chartTokens.neutral.surfaceTint,
    stroke: chartTokens.neutral.stoneLight,
    data: [70, 65, 30]
  }
];

export const recaptureCategories = ['18-30', '31-45', '46-60', '61-75', '75+'];

export const stackedBarSeries: BarSeries[] = [
  {
    key: 'female',
    label: 'Female',
    fill: chartTokens.sequential.pink.lighter,
    stroke: chartTokens.sequential.pink.default,
    data: [12, 15, 28, 34, 33]
  },
  {
    key: 'male',
    label: 'Male',
    fill: chartTokens.sequential.purple.light,
    stroke: chartTokens.sequential.purple.default,
    data: [10, 14, 26, 32, 31]
  }
];

export const comboCategories = ['0-20', '21-40', '41-60', '61+'];

export const comboBarSeries: BarSeries[] = [
  {
    key: 'female',
    label: 'Female',
    fill: chartTokens.sequential.pink.dark,
    stroke: chartTokens.sequential.pink.darker,
    data: [22000, 51000, 86000, 12000]
  },
  {
    key: 'male',
    label: 'Male',
    fill: chartTokens.categorical.primary,
    stroke: chartTokens.sequential.neel.darker,
    data: [28000, 57000, 74000, 18000]
  },
  {
    key: 'other',
    label: 'Other',
    fill: chartTokens.neutral.stoneLight,
    stroke: chartTokens.neutral.nightLighter,
    data: [18000, 43000, 80000, 10000]
  }
];

export const comboLineSeries: LineSeriesConfig[] = [
  {
    key: 'revenue-percent',
    label: 'Revenue %',
    data: [26, 12.3, 34.7, 27],
    stroke: chartTokens.sequential.default.dark,
    showDots: true,
    showLabels: true,
    axis: 'right'
  }
];

export const donutSegments: DonutSegment[] = [
  {
    label: 'Current',
    value: 70,
    color: chartTokens.multiHue.donutBlue
  },
  {
    label: 'Projected',
    value: 23,
    color: chartTokens.multiHue.donutBlue,
    strokeColor: chartTokens.multiHue.donutBlue,
    fillStyle: 'texture'
  },
  {
    label: 'Remaining capacity',
    value: 7,
    color: chartTokens.neutral.surfaceTint,
    showLabel: false,
    showLegendItem: false
  }
];

export const lineCategories = ["Q1 '23", "Q2 '23", "Q3 '23", "Q4 '23"];

export const lineSeries: LineSeriesConfig[] = [
  {
    key: 'current',
    label: 'Current',
    data: [1280, 1160, 1040, 960],
    stroke: chartTokens.sequential.warning.default,
    showDots: true,
    dotOutline: true,
    showLabels: true
  },
  {
    key: 'ye-projected',
    label: 'YE Projected',
    data: [1120, 980, 840, 760],
    stroke: chartTokens.sequential.warning.default,
    lineStyle: 'dashed',
    showDots: false
  }
];

export const histogramBins: HistogramBin[] = [
  {
    label: '0',
    value: 8,
    fill: chartTokens.sequential.default.lightest,
    stroke: chartTokens.sequential.default.dark,
    legendLabel: 'Observed distribution'
  },
  {
    label: '1-5',
    value: 24,
    fill: chartTokens.sequential.default.lighter,
    stroke: chartTokens.sequential.default.dark,
    legendLabel: 'Observed distribution'
  },
  {
    label: '6-10',
    value: 37,
    fill: chartTokens.sequential.default.light,
    stroke: chartTokens.sequential.default.dark,
    legendLabel: 'Observed distribution'
  },
  {
    label: '11-20',
    value: 18,
    fill: chartTokens.sequential.default.default,
    stroke: chartTokens.sequential.default.dark,
    legendLabel: 'Observed distribution'
  },
  {
    label: '21-30',
    value: 12,
    fill: chartTokens.sequential.default.dark,
    stroke: chartTokens.sequential.default.darker,
    legendLabel: 'Observed distribution'
  },
  {
    label: '31+',
    value: 9,
    fill: chartTokens.sequential.default.darker,
    stroke: chartTokens.sequential.default.darker,
    legendLabel: 'Observed distribution'
  }
];

export const sparklineValues = [1028, 1036, 1041, 1033, 1047, 1052, 1048];
export const sparklineLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

export const halfDonutRanges: HalfDonutRange[] = [
  { from: 0, to: 30, color: chartTokens.sequential.red.dark, label: 'Needs attention' },
  { from: 30, to: 50, color: chartTokens.sequential.warning.default, label: 'Watch list' },
  { from: 50, to: 100, color: chartTokens.sequential.success.dark, label: 'On track' }
];

export const pointerRanges: PointerScaleRange[] = [
  { from: 0, to: 10, color: chartTokens.sequential.success.dark, label: 'Low' },
  { from: 10, to: 20, color: chartTokens.sequential.warning.default, label: 'Medium' },
  { from: 20, to: 100, color: chartTokens.sequential.red.dark, label: 'High' }
];

const baseMapBubblePoints: MapBubblePoint[] = [
  {
    key: 'seattle',
    label: 'Seattle',
    legendLabel: 'Hospital',
    latitude: 47.6062,
    longitude: -122.3321,
    stateCode: 'WA',
    value: 20,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'san-francisco',
    label: 'San Francisco',
    legendLabel: 'Hospital',
    latitude: 37.7749,
    longitude: -122.4194,
    stateCode: 'CA',
    value: 32,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'los-angeles',
    label: 'Los Angeles',
    legendLabel: 'Hospital',
    latitude: 34.0522,
    longitude: -118.2437,
    stateCode: 'CA',
    value: 44,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'phoenix',
    label: 'Phoenix',
    legendLabel: 'Affiliated ASC',
    latitude: 33.4484,
    longitude: -112.074,
    stateCode: 'AZ',
    value: 16,
    fill: chartTokens.categorical.axisPalette[2].fill,
    stroke: chartTokens.categorical.axisPalette[2].stroke
  },
  {
    key: 'denver',
    label: 'Denver',
    legendLabel: 'Affiliated ASC',
    latitude: 39.7392,
    longitude: -104.9903,
    stateCode: 'CO',
    value: 12,
    fill: chartTokens.categorical.axisPalette[2].fill,
    stroke: chartTokens.categorical.axisPalette[2].stroke
  },
  {
    key: 'dallas',
    label: 'Dallas',
    legendLabel: 'Hospital',
    latitude: 32.7767,
    longitude: -96.797,
    stateCode: 'TX',
    value: 26,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'houston',
    label: 'Houston',
    legendLabel: 'Non-affiliated ASC',
    latitude: 29.7604,
    longitude: -95.3698,
    stateCode: 'TX',
    value: 18,
    fill: chartTokens.categorical.axisPalette[5].fill,
    stroke: chartTokens.categorical.axisPalette[5].stroke
  },
  {
    key: 'minneapolis',
    label: 'Minneapolis',
    legendLabel: 'Hospital',
    latitude: 44.9778,
    longitude: -93.265,
    stateCode: 'MN',
    value: 14,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'chicago',
    label: 'Chicago',
    legendLabel: 'Hospital',
    latitude: 41.8781,
    longitude: -87.6298,
    stateCode: 'IL',
    value: 28,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'atlanta',
    label: 'Atlanta',
    legendLabel: 'Affiliated ASC',
    latitude: 33.749,
    longitude: -84.388,
    stateCode: 'GA',
    value: 19,
    fill: chartTokens.categorical.axisPalette[2].fill,
    stroke: chartTokens.categorical.axisPalette[2].stroke
  },
  {
    key: 'new-york',
    label: 'New York',
    legendLabel: 'Hospital',
    latitude: 40.7128,
    longitude: -74.006,
    stateCode: 'NY',
    value: 38,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'boston',
    label: 'Boston',
    legendLabel: 'Affiliated ASC',
    latitude: 42.3601,
    longitude: -71.0589,
    stateCode: 'MA',
    value: 10,
    fill: chartTokens.categorical.axisPalette[2].fill,
    stroke: chartTokens.categorical.axisPalette[2].stroke
  },
  {
    key: 'miami',
    label: 'Miami',
    legendLabel: 'Hospital',
    latitude: 25.7617,
    longitude: -80.1918,
    stateCode: 'FL',
    value: 34,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'orlando',
    label: 'Orlando',
    legendLabel: 'Hospital',
    latitude: 28.5383,
    longitude: -81.3792,
    stateCode: 'FL',
    value: 22,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'jacksonville',
    label: 'Jacksonville',
    legendLabel: 'Affiliated ASC',
    latitude: 30.3322,
    longitude: -81.6557,
    stateCode: 'FL',
    value: 16,
    fill: chartTokens.categorical.axisPalette[2].fill,
    stroke: chartTokens.categorical.axisPalette[2].stroke
  },
  {
    key: 'tampa',
    label: 'Tampa',
    legendLabel: 'Hospital',
    latitude: 27.9506,
    longitude: -82.4572,
    stateCode: 'FL',
    value: 24,
    fill: chartTokens.categorical.axisPalette[0].fill,
    stroke: chartTokens.categorical.axisPalette[0].stroke
  },
  {
    key: 'west-palm-beach',
    label: 'West Palm Beach',
    legendLabel: 'Non-affiliated ASC',
    latitude: 26.7153,
    longitude: -80.0534,
    stateCode: 'FL',
    value: 12,
    fill: chartTokens.categorical.axisPalette[5].fill,
    stroke: chartTokens.categorical.axisPalette[5].stroke
  },
  {
    key: 'fort-myers',
    label: 'Fort Myers',
    legendLabel: 'Affiliated ASC',
    latitude: 26.6406,
    longitude: -81.8723,
    stateCode: 'FL',
    value: 10,
    fill: chartTokens.categorical.axisPalette[2].fill,
    stroke: chartTokens.categorical.axisPalette[2].stroke,
    fillStyle: 'texture'
  },
  {
    key: 'tallahassee',
    label: 'Tallahassee',
    legendLabel: 'Non-affiliated ASC',
    latitude: 30.4383,
    longitude: -84.2807,
    stateCode: 'FL',
    value: 8,
    fill: chartTokens.categorical.axisPalette[5].fill,
    stroke: chartTokens.categorical.axisPalette[5].stroke
  }
];

const bubbleDetailByLegendLabel: Record<string, { costBase: number; avoidableBase: number }> = {
  Hospital: { costBase: 28400000, avoidableBase: 31.2 },
  'Affiliated ASC': { costBase: 12100000, avoidableBase: 18.4 },
  'Non-affiliated ASC': { costBase: 9400000, avoidableBase: 25.1 }
};

export const mapBubblePoints: MapBubblePoint[] = baseMapBubblePoints.map((point, index) => {
  const legendLabel = point.legendLabel ?? 'Hospital';
  const detailBase = bubbleDetailByLegendLabel[legendLabel] ?? bubbleDetailByLegendLabel.Hospital;
  const surgeryCost = Math.round(detailBase.costBase + point.value * 312000 + index * 87000);
  const avoidablePercent = (detailBase.avoidableBase + index * 0.7).toFixed(1);

  return {
    ...point,
    details: [
      { label: 'Network', value: legendLabel },
      { label: 'State', value: point.stateCode ?? 'US' },
      {
        label: 'Surgery cost',
        value: `$${surgeryCost.toLocaleString('en-US')}`
      },
      {
        label: 'Potential avoidable %',
        value: `${avoidablePercent}%`
      }
    ]
  };
});

export const mapBubbleTableConfig = {
  headers: ['Facility', 'State', 'Network', 'Potential avoidable %'],
  rows: mapBubblePoints.map((point) => [
    point.label,
    point.stateCode ?? 'US',
    point.legendLabel ?? 'Hospital',
    point.details?.find((detail) => detail.label === 'Potential avoidable %')?.value ?? '0%'
  ])
};

export const distributionSegments: DistributionSegment[] = [
  { label: 'Less than $5,000', value: 55, fill: chartTokens.categorical.axisPalette[0].fill },
  { label: '$5,000 to $10,000', value: 35, fill: chartTokens.sequential.warning.default },
  { label: 'More than $10,000', value: 10, fill: chartTokens.sequential.red.dark }
];

/* ------------------------------------------------------------------ */
/* Sankey: Emergency Department patient flow                           */
/* Arrival → Triage → Disposition → Outcome                            */
/* Columns are auto-inferred from link topology.                       */
/* ------------------------------------------------------------------ */

const ax = chartTokens.categorical.axisPalette;

export const edFlowNodes: SankeyNode[] = [
  // Column 0 — Arrival
  {
    id: 'ambulance',
    label: 'Ambulance',
    category: 'Arrival',
    fill: ax[0].fill,
    stroke: ax[0].stroke
  },
  { id: 'walk-in', label: 'Walk-in', category: 'Arrival', fill: ax[0].fill, stroke: ax[0].stroke },
  {
    id: 'transfer',
    label: 'Transfer',
    category: 'Arrival',
    fill: ax[0].fill,
    stroke: ax[0].stroke
  },

  // Column 1 — Triage
  { id: 'critical', label: 'Critical', category: 'Triage', fill: ax[5].fill, stroke: ax[5].stroke },
  { id: 'urgent', label: 'Urgent', category: 'Triage', fill: ax[4].fill, stroke: ax[4].stroke },
  {
    id: 'non-urgent',
    label: 'Non-urgent',
    category: 'Triage',
    fill: ax[2].fill,
    stroke: ax[2].stroke
  },

  // Column 2 — Disposition
  {
    id: 'admitted',
    label: 'Admitted',
    category: 'Disposition',
    fill: ax[3].fill,
    stroke: ax[3].stroke
  },
  {
    id: 'discharged',
    label: 'Discharged',
    category: 'Disposition',
    fill: ax[2].fill,
    stroke: ax[2].stroke
  },
  {
    id: 'observation',
    label: 'Observation',
    category: 'Disposition',
    fill: ax[1].fill,
    stroke: ax[1].stroke
  },

  // Column 3 — Outcome
  { id: 'home', label: 'Home', category: 'Outcome', fill: ax[2].fill, stroke: ax[2].stroke },
  {
    id: 'inpatient',
    label: 'Inpatient',
    category: 'Outcome',
    fill: ax[3].fill,
    stroke: ax[3].stroke
  },
  {
    id: 'readmitted',
    label: 'Readmitted',
    category: 'Outcome',
    fill: ax[5].fill,
    stroke: ax[5].stroke
  }
];

export const edFlowLinks: SankeyLink[] = [
  // Arrival → Triage
  { source: 'ambulance', target: 'critical', value: 150 },
  { source: 'ambulance', target: 'urgent', value: 140 },
  { source: 'ambulance', target: 'non-urgent', value: 30 },
  { source: 'walk-in', target: 'critical', value: 20 },
  { source: 'walk-in', target: 'urgent', value: 330 },
  { source: 'walk-in', target: 'non-urgent', value: 230 },
  { source: 'transfer', target: 'critical', value: 10 },
  { source: 'transfer', target: 'urgent', value: 50 },
  { source: 'transfer', target: 'non-urgent', value: 40 },

  // Triage → Disposition
  { source: 'critical', target: 'admitted', value: 150 },
  { source: 'critical', target: 'observation', value: 30 },
  { source: 'urgent', target: 'admitted', value: 160 },
  { source: 'urgent', target: 'discharged', value: 320 },
  { source: 'urgent', target: 'observation', value: 40 },
  { source: 'non-urgent', target: 'discharged', value: 300 },

  // Disposition → Outcome
  { source: 'admitted', target: 'inpatient', value: 260 },
  { source: 'admitted', target: 'readmitted', value: 50 },
  { source: 'discharged', target: 'home', value: 620 },
  { source: 'observation', target: 'home', value: 70 }
];

/* ------------------------------------------------------------------ */
/* Sankey: Revenue flow (Gross → Adjustments → Net → Collected)        */
/* ------------------------------------------------------------------ */

export const revenueFlowNodes: SankeyNode[] = [
  {
    id: 'commercial',
    label: 'Commercial',
    category: 'Payer',
    fill: ax[0].fill,
    stroke: ax[0].stroke
  },
  { id: 'medicare', label: 'Medicare', category: 'Payer', fill: ax[3].fill, stroke: ax[3].stroke },
  { id: 'medicaid', label: 'Medicaid', category: 'Payer', fill: ax[2].fill, stroke: ax[2].stroke },

  {
    id: 'gross',
    label: 'Gross charges',
    category: 'Gross',
    fill: ax[1].fill,
    stroke: ax[1].stroke
  },

  {
    id: 'contractual',
    label: 'Contractual adj.',
    category: 'Adjustments',
    fill: ax[5].fill,
    stroke: ax[5].stroke
  },
  {
    id: 'bad-debt',
    label: 'Bad debt',
    category: 'Adjustments',
    fill: ax[4].fill,
    stroke: ax[4].stroke
  },
  { id: 'net', label: 'Net revenue', category: 'Net', fill: ax[2].fill, stroke: ax[2].stroke },

  {
    id: 'collected',
    label: 'Collected',
    category: 'Collected',
    fill: ax[2].fill,
    stroke: ax[2].stroke
  },
  { id: 'ar', label: 'In A/R', category: 'Collected', fill: ax[5].fill, stroke: ax[5].stroke }
];

export const revenueFlowLinks: SankeyLink[] = [
  { source: 'commercial', target: 'gross', value: 420 },
  { source: 'medicare', target: 'gross', value: 380 },
  { source: 'medicaid', target: 'gross', value: 200 },

  { source: 'gross', target: 'contractual', value: 310 },
  { source: 'gross', target: 'bad-debt', value: 40 },
  { source: 'gross', target: 'net', value: 650 },

  { source: 'net', target: 'collected', value: 540 },
  { source: 'net', target: 'ar', value: 110 }
];

export const riskDistributionSegments: DistributionSegment[] = [
  { label: 'Low', value: 40, fill: chartTokens.sequential.neel.default },
  { label: 'Medium', value: 30, fill: chartTokens.sequential.warning.lightest },
  { label: 'High', value: 20, fill: chartTokens.sequential.warning.light },
  { label: 'Very High', value: 10, fill: chartTokens.sequential.red.dark }
];
