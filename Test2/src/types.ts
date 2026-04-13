import type { ReactNode } from 'react';

export type FillStyle = 'solid' | 'texture' | 'gradient';

export type LegendMarkerType =
  | 'solid'
  | 'solid-texture'
  | 'dot-line'
  | 'dot-line-dashed'
  | 'line'
  | 'line-dashed';

export type ChartActionId =
  | 'save-image'
  | 'restore'
  | 'line-view'
  | 'bar-view'
  | 'data-view'
  | 'zoom-in'
  | 'zoom-out';

export type DotSize = 'small' | 'medium' | 'large';

export interface LegendItem {
  label: string;
  color: string;
  strokeColor?: string;
  marker?: LegendMarkerType;
  active?: boolean;
}

export interface ChartAction {
  id: ChartActionId;
  label?: string;
  onClick?: () => void;
}

export interface AxisConfig {
  title?: string;
  ticks?: string[];
  hideMarkers?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface BarSeries {
  key: string;
  label: string;
  data: number[];
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  active?: boolean;
}

export interface LineSeriesConfig {
  key: string;
  label: string;
  data: number[];
  stroke?: string;
  marker?: LegendMarkerType;
  lineStyle?: 'solid' | 'dashed';
  strokeWidth?: number;
  dotSize?: DotSize;
  dotOutline?: boolean;
  showDots?: boolean;
  showAreaFill?: boolean;
  showLabels?: boolean;
  labelPosition?: 'top' | 'bottom-left';
  axis?: 'left' | 'right';
}

export interface TooltipRow {
  label: string;
  value: string | number;
  color: string;
  strokeColor?: string;
  marker?: LegendMarkerType;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  strokeColor?: string;
  fillStyle?: FillStyle;
  active?: boolean;
  showLabel?: boolean;
}

export interface ChartCardProps {
  width?: number | string;
  surface?: 'card' | 'plain';
  padding?: number;
  className?: string;
  children: ReactNode;
}
