import type { ReactNode } from 'react';

import type {
  ChartAction,
  DotSize,
  FillStyle,
  LegendMarkerType,
  SelectOption
} from '../types';

export type LegendPositionV3 = 'top' | 'right' | 'bottom';
export type FillStyleModeV3 = FillStyle | 'inherit';
export type LegendMarkerModeV3 = LegendMarkerType | 'auto';
export type BubbleStyleV3 = 'filled' | 'outlined' | 'both';

export interface AxisConfigV3 {
  title?: string;
  ticks?: Array<string | number>;
  hideMarkers?: boolean;
}

export interface GridConfigV3 {
  show?: boolean;
  count?: number;
  color?: string;
}

export interface ReferenceLineV3 {
  value: number;
  label?: string;
  color?: string;
  lineStyle?: 'solid' | 'dashed';
}

export interface BarDatumV3 {
  value: number;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  active?: boolean;
  showLabel?: boolean;
}

export interface BarSeriesV3 {
  key: string;
  label: string;
  data: Array<number | BarDatumV3>;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  active?: boolean;
}

export interface LineSeriesConfigV3 {
  key: string;
  label: string;
  data: number[];
  stroke?: string;
  lineStyle?: 'solid' | 'dashed';
  strokeWidth?: number;
  dotSize?: DotSize;
  dotOutline?: boolean;
  showDots?: boolean;
  showAreaFill?: boolean;
  showLabels?: boolean;
  axis?: 'left' | 'right';
  active?: boolean;
}

export interface DonutSegmentV3 {
  label: string;
  legendLabel?: string;
  value: number;
  color: string;
  strokeColor?: string;
  fillStyle?: FillStyle;
  active?: boolean;
  showLabel?: boolean;
  showLegendItem?: boolean;
}

export interface HistogramBinV3 {
  label: string;
  legendLabel?: string;
  value: number;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  active?: boolean;
  showLegendItem?: boolean;
}

export interface GaugeRangeV3 {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface PointerScaleRangeV3 {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface MapBubblePointV3 {
  key: string;
  label: string;
  legendLabel?: string;
  latitude?: number;
  longitude?: number;
  x?: number;
  y?: number;
  stateCode?: string;
  value: number;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  bubbleStyle?: BubbleStyleV3;
  active?: boolean;
}

export interface DistributionSegmentV3 {
  label: string;
  value: number;
  fill?: string;
  stroke?: string;
}

export interface TableConfigV3 {
  headers: string[];
  rows: Array<Array<string | number>>;
}

export interface V3HeaderProps {
  title?: string;
  showTitle?: boolean;
  selectOptions?: SelectOption[];
  selectedValue?: string;
  onSelectChange?: (value: string) => void;
  actions?: ChartAction[];
  primaryActionLabel?: string;
  onPrimaryActionClick?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export interface ChartShellV3Props extends V3HeaderProps {
  width?: number | string;
  showCardBackground?: boolean;
  showHeader?: boolean;
  legendPosition?: LegendPositionV3;
  description?: string;
  legendItems?: Array<{
    label: string;
    color: string;
    strokeColor?: string;
    marker?: 'solid' | 'solid-texture' | 'dot-line' | 'dot-line-dashed' | 'line' | 'line-dashed';
    active?: boolean;
  }>;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}
