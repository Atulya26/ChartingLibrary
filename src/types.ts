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
  ticks?: Array<string | number>;
  hideMarkers?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface BarDatum {
  value: number;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  active?: boolean;
  showLabel?: boolean;
}

export interface BarSeries {
  key: string;
  label: string;
  data: Array<number | BarDatum>;
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
  active?: boolean;
}

export interface TooltipRow {
  label: string;
  value: string | number;
  color?: string;
  strokeColor?: string;
  marker?: LegendMarkerType;
}

export interface DonutSegment {
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

export type LegendPosition = 'top' | 'right' | 'bottom';
export type FillStyleMode = FillStyle | 'inherit';
export type LegendMarkerMode = LegendMarkerType | 'auto';
export type BubbleStyle = 'filled' | 'outlined' | 'both';

export interface DetailRow {
  label: string;
  value: string | number;
}

export interface GridConfig {
  show?: boolean;
  count?: number;
  color?: string;
}

export interface ReferenceLine {
  value: number;
  label?: string;
  color?: string;
  lineStyle?: 'solid' | 'dashed';
}

export interface HistogramBin {
  label: string;
  legendLabel?: string;
  value: number;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  active?: boolean;
  showLegendItem?: boolean;
}

export interface HalfDonutRange {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface PointerScaleRange {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface MapBubblePoint {
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
  bubbleStyle?: BubbleStyle;
  active?: boolean;
  details?: DetailRow[];
}

export interface DistributionSegment {
  label: string;
  value: number;
  fill?: string;
  stroke?: string;
}

export interface TableConfig {
  headers: string[];
  rows: Array<Array<string | number>>;
}

export interface SankeyNode {
  id: string;
  label: string;
  /** Optional explicit column index. If omitted, column is inferred from link topology. */
  column?: number;
  /** Optional category label used for legend grouping. */
  category?: string;
  fill?: string;
  stroke?: string;
  fillStyle?: FillStyle;
  active?: boolean;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  /** Optional explicit link color. If omitted, link color is derived via `linkColorMode`. */
  color?: string;
}

export type SankeyLinkColorMode = 'source' | 'target' | 'gradient' | 'neutral';
export type SankeyHighlightMode = 'link' | 'node' | 'path';
export type SankeyNodeAlignment = 'justify' | 'left' | 'right' | 'center';

export interface ChartHeaderProps {
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

export interface ChartShellProps extends ChartHeaderProps {
  width?: number | string;
  showCardBackground?: boolean;
  showHeader?: boolean;
  legendPosition?: LegendPosition;
  description?: string;
  legendItems?: LegendItem[];
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export interface ChartCardProps {
  width?: number | string;
  surface?: 'card' | 'plain';
  padding?: number;
  className?: string;
  children: ReactNode;
}
