# API Inventory

This file records the public exports intentionally shipped for `1.0.0`.

Classification:

- **Stable**: supported public API. Breaking changes require a future major version.
- **Advanced stable**: public API for advanced composition or layout usage. Supported, but more
  likely to evolve through additive helpers than the primary chart components.
- **Internal**: not exported from the package root.

## Package Root

| Export                 | Kind         | Source                                    | Classification   | Notes                                                                                       |
| ---------------------- | ------------ | ----------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `BarChart`             | Component    | `src/charts/BarChart.tsx`                 | Stable           | Primary chart component.                                                                    |
| `ComboChart`           | Component    | `src/charts/ComboChart.tsx`               | Stable           | Primary chart component.                                                                    |
| `DonutChart`           | Component    | `src/charts/DonutChart.tsx`               | Stable           | Primary chart component.                                                                    |
| `HalfDonutChart`       | Component    | `src/charts/HalfDonutChart.tsx`           | Stable           | Gauge-style half donut component; package keeps the existing exported name for 1.0.         |
| `HistogramChart`       | Component    | `src/charts/HistogramChart.tsx`           | Stable           | Primary chart component.                                                                    |
| `LineChart`            | Component    | `src/charts/LineChart.tsx`                | Stable           | Primary chart component.                                                                    |
| `MapBubbleChart`       | Component    | `src/charts/MapBubbleChart.tsx`           | Stable           | Primary chart component.                                                                    |
| `PointerScale`         | Component    | `src/charts/PointerScale.tsx`             | Stable           | Primary chart component.                                                                    |
| `SankeyChart`          | Component    | `src/charts/SankeyChart.tsx`              | Stable           | Primary chart component; exact node positioning is deterministic but not a public contract. |
| `Sparkline`            | Component    | `src/charts/Sparkline.tsx`                | Stable           | Primary chart component.                                                                    |
| `ChartCard`            | Component    | `src/components/ChartCard.tsx`            | Stable           | Shared chart chrome.                                                                        |
| `ChartHeader`          | Component    | `src/components/ChartHeader.tsx`          | Stable           | Shared chart chrome.                                                                        |
| `ChartHoverCard`       | Component    | `src/components/ChartHoverCard.tsx`       | Stable           | Shared hover-card renderer.                                                                 |
| `ChartLoadingSkeleton` | Component    | `src/components/ChartLoadingSkeleton.tsx` | Stable           | Shared loading state.                                                                       |
| `ChartShell`           | Component    | `src/components/ChartShell.tsx`           | Stable           | Shared chart layout shell.                                                                  |
| `ChartStateCard`       | Component    | `src/components/ChartStateCard.tsx`       | Stable           | Empty/error state renderer.                                                                 |
| `ChartToolbar`         | Component    | `src/components/ChartToolbar.tsx`         | Stable           | Header toolbar helper.                                                                      |
| `Legend`               | Component    | `src/components/Legend.tsx`               | Stable           | Shared legend renderer.                                                                     |
| `LegendMarker`         | Component    | `src/components/Legend.tsx`               | Stable           | Shared legend marker renderer.                                                              |
| `TooltipPopover`       | Component    | `src/components/TooltipPopover.tsx`       | Stable           | Shared tooltip container.                                                                   |
| `XAxis`, `YAxis`       | Primitive    | `src/primitives/Axis.tsx`                 | Advanced stable  | Exposed for advanced custom chart composition.                                              |
| `BarMark`              | Primitive    | `src/primitives/BarMark.tsx`              | Advanced stable  | Exposed for advanced custom chart composition.                                              |
| `DonutRing`            | Primitive    | `src/primitives/DonutRing.tsx`            | Advanced stable  | Exposed for advanced custom chart composition.                                              |
| `GridLines`            | Primitive    | `src/primitives/GridLines.tsx`            | Advanced stable  | Exposed for advanced custom chart composition.                                              |
| `LineSeries`           | Primitive    | `src/primitives/LineSeries.tsx`           | Advanced stable  | Exposed for advanced custom chart composition.                                              |
| `chartTokens`          | Token object | `src/theme/tokens.ts`                     | Stable read-only | Public for matching chart colors and examples. Do not mutate at runtime.                    |
| `getSequentialPalette` | Utility      | `src/theme/tokens.ts`                     | Stable           | Palette helper.                                                                             |
| `getSequentialScale`   | Utility      | `src/theme/tokens.ts`                     | Stable           | Palette helper.                                                                             |
| `formatNumberCompact`  | Utility      | `src/utils/chart.ts`                      | Stable           | Formatting helper used in examples.                                                         |
| `downsampleLttb`       | Utility      | `src/utils/downsample.ts`                 | Stable           | Public line-data preprocessing helper.                                                      |
| `layoutSankey`         | Utility      | `src/sankeyLayout.ts`                     | Advanced stable  | Supported for advanced Sankey usage. Layout internals may receive additive improvements.    |
| `describeSankeyRibbon` | Utility      | `src/sankeyLayout.ts`                     | Advanced stable  | Supported for advanced Sankey usage.                                                        |

## Types

The package root exports the public data and prop-support types used by the chart components:

- `AxisConfig`
- `BarDatum`
- `BarSeries`
- `BubbleStyle`
- `ChartAccessibilityProps`
- `ChartAction`
- `ChartActionId`
- `ChartHeaderProps`
- `ChartLoadingSkeletonProps`
- `ChartLoadingType`
- `ChartShellProps`
- `ChartStateCardProps`
- `ChartStateVariant`
- `DonutSegment`
- `DotSize`
- `DownsamplePoint`
- `FillStyle`
- `FillStyleMode`
- `GridConfig`
- `HalfDonutRange`
- `HistogramBin`
- `LaidOutSankeyLink`
- `LaidOutSankeyNode`
- `LegendItem`
- `LegendMarkerMode`
- `LegendMarkerType`
- `LegendPosition`
- `LineSeriesConfig`
- `MapBubblePoint`
- `PointerScaleRange`
- `ReferenceLine`
- `SankeyHighlightMode`
- `SankeyLayoutOptions`
- `SankeyLayoutResult`
- `SankeyLink`
- `SankeyLinkColorMode`
- `SankeyNode`
- `SankeyNodeAlignment`
- `SelectOption`
- `TableConfig`
- `TooltipRow`

## Internal Surface

The following are intentionally not exported from the package root:

- Storybook-only stress helpers and seeded data utilities.
- Accessibility implementation helpers from `src/utils/a11y.tsx`.
- React hooks from `src/utils/useChartKeyboardNav.ts`, `src/utils/useDebouncedValue.ts`,
  `src/utils/useRafCallback.ts`, and `src/utils/useReducedMotion.ts`.
- General chart geometry helpers from `src/chartUtils.tsx`.
- Map metadata and map internals.

If a consumer needs one of these internal utilities, open an issue with the use case so it can be
promoted through a documented public API instead of imported from private paths.
