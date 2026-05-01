import seedrandom from 'seedrandom';

import { chartTokens } from '../theme/tokens';
import type { BarSeries, LineSeriesConfig, MapBubblePoint } from '../types';

const US_BOUNDS = {
  minLat: 25.1,
  maxLat: 49.2,
  minLng: -124.7,
  maxLng: -66.9
};

const STATE_CODES = ['AZ', 'CA', 'CO', 'FL', 'GA', 'IL', 'MA', 'MN', 'NY', 'TX', 'WA'];
const NETWORKS = ['Hospital', 'Affiliated ASC', 'Non-affiliated ASC'] as const;

function round(value: number, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createRng(seed: string) {
  return seedrandom(seed);
}

export function generateLineCategories(count: number, prefix = 'P') {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
}

export function generateLineSeries(seed: string, count: number): LineSeriesConfig[] {
  const rng = createRng(seed);
  let current = 920 + rng() * 180;
  let projected = current * 0.92;

  const currentData = Array.from({ length: count }, (_, index) => {
    const seasonal = Math.sin(index / 18) * 38;
    const drift = index * 0.025;
    current += (rng() - 0.48) * 22;
    return round(current + seasonal - drift);
  });

  const projectedData = Array.from({ length: count }, (_, index) => {
    const seasonal = Math.cos(index / 22) * 28;
    const drift = index * 0.018;
    projected += (rng() - 0.5) * 18;
    return round(projected + seasonal - drift);
  });

  return [
    {
      key: `${seed}-current`,
      label: 'Current',
      data: currentData,
      stroke: chartTokens.sequential.warning.default,
      showDots: count <= 100,
      showAreaFill: count <= 100
    },
    {
      key: `${seed}-projected`,
      label: 'YE Projected',
      data: projectedData,
      stroke: chartTokens.sequential.warning.default,
      lineStyle: 'dashed',
      showDots: false
    }
  ];
}

export function generateBarSeries(seed: string, categories: string[]): BarSeries[] {
  const rng = createRng(seed);

  return [
    {
      key: `${seed}-observed`,
      label: 'Observed',
      fill: chartTokens.categorical.primary,
      stroke: chartTokens.categorical.primary,
      data: categories.map((_, index) => round(24 + index * 7 + rng() * 36))
    },
    {
      key: `${seed}-target`,
      label: 'Target',
      fill: chartTokens.neutral.surfaceTint,
      stroke: chartTokens.neutral.stoneLight,
      data: categories.map((_, index) => round(44 + index * 8 + rng() * 42))
    }
  ];
}

export function generateMapPoints(seed: string, count: number): MapBubblePoint[] {
  const rng = createRng(seed);
  const palette = chartTokens.categorical.axisPalette;

  return Array.from({ length: count }, (_, index) => {
    const network = NETWORKS[index % NETWORKS.length];
    const paletteItem = palette[index % palette.length];
    const value = round(8 + rng() * 62);
    const stateCode = STATE_CODES[index % STATE_CODES.length];
    const latitude = round(US_BOUNDS.minLat + rng() * (US_BOUNDS.maxLat - US_BOUNDS.minLat), 4);
    const longitude = round(US_BOUNDS.minLng + rng() * (US_BOUNDS.maxLng - US_BOUNDS.minLng), 4);
    const surgeryCost = Math.round(9000000 + value * 410000 + index * 17500);
    const avoidablePercent = round(12 + rng() * 34, 1);

    return {
      key: `${seed}-site-${index + 1}`,
      label: `Site ${index + 1}`,
      legendLabel: network,
      latitude,
      longitude,
      stateCode,
      value,
      fill: paletteItem.fill,
      stroke: paletteItem.stroke,
      details: [
        { label: 'Network', value: network },
        { label: 'State', value: stateCode },
        { label: 'Surgery cost', value: `$${surgeryCost.toLocaleString('en-US')}` },
        { label: 'Potential avoidable %', value: `${avoidablePercent}%` }
      ]
    };
  });
}
