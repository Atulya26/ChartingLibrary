# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 - 2026-05-01

### Added

- First stable release of `@atulya_26/charting-library`.
- CI foundation for typecheck, lint, format, package build, Storybook build, and size checks.
- Chromatic workflow scaffolding for visual regression review.
- Manual release workflow scaffold for validated npm publishes.
- Contribution guide, pull request template, Dependabot config, and branch-protection checklist.
- Public API inventory and migration guide for the `1.0.0` package surface.
- Shared accessibility props for chart graphics: `ariaLabel`, `ariaDescription`, and opt-in
  `enableKeyboardNavigation`.
- Keyboard data-item navigation, live screen-reader announcements, and focus-driven hover cards for
  charts with `enableKeyboardNavigation`.
- Axe accessibility checks in CI through the Storybook test runner.
- WCAG AA color contrast audit documentation for the default chart tokens.
- Optional `downsample` prop on `LineChart`, `Sparkline`, and `ComboChart` line
  series. Uses LTTB to preserve visual shape, stays off by default, and keeps
  hover and keyboard interactions on the original dataset.
- Public `downsampleLttb` utility for upstream line-data preprocessing.
- Large-data Storybook stress stories for raw and downsampled line-like charts.

### Changed

- Memoized chart and primitive exports for re-render avoidance. Pass stable data and config
  references for the optimization to take effect.
- Memoized derived line, sparkline, and Sankey calculations so stable chart props avoid
  rebuilding paths, ticks, legends, gradients, and hover geometry.
- Memoized remaining chart-derived work across bar, combo, donut, half-donut,
  histogram, and pointer scale internals where it can be done without visual changes.
- Optimized MapBubbleChart projection, geography paths, bubble render data, and rAF-coalesced
  drag and hover updates for smoother map interaction.
- Honored `prefers-reduced-motion` across loading skeleton animation and inline chart hover
  transitions.
- Raised the ESM bundle budget from `50 KB` to `55 KB` brotli for `1.0.x` patch headroom while
  keeping the current package at `48.15 KB`.
- Relaxed consumer Node engine support to `>=18.0.0` while keeping Node `20.19.0` as the local
  development baseline.

## 2026-04-30

### Visual alignment and chart state polish

- Aligned distribution bars and scale variants with the documented 3px corner treatment
- Added a single-axis line chart story and tuned the line chart area gradient, target placement, dot treatment, and story naming
- Updated map bubble hover interactions with an opt-in hover card, bubble scale-up, and soft shadow treatment
- Brought donut and half-donut cap behavior closer to the Figma direction, including subtle cap curvature and segment spacing
- Matched stacked combo and histogram segment styling with the stacked bar chart visual language
- Replaced empty and error chart-state illustrations with the provided product illustrations
- Tightened token usage across pointer scale, legends, fills, and chart primitives so colors stay closer to the defined palette

## 2026-04-24

### Chart sizing and polish pass

- Aligned cartesian chart frame heights with the `plotHeight` prop so taller and shorter chart settings resize axes, plot area, and x-axis together
- Let cartesian and distribution plot widths derive from the chart card width unless `plotWidth` is explicitly set
- Added a dedicated horizontal bar chart mode with left category labels, horizontal value scale, grouped/stacked support, and Storybook coverage
- Added safer line-chart endpoint inset so first and last dots do not sit on axis labels
- Tightened bar distribution Storybook behavior, combo line contrast, donut rounded-cap paint order, and removed the unfinished Florida map story
- Added small shell, legend, tooltip, and numeric text polish to reduce clipping and layout jitter in dashboard-sized containers
- Kept Sankey node labels inside the plot bounds so bottom-edge values do not collide with the legend area

## 2026-04-16

### Final package promotion and cleanup

- Removed the `Test1` and `Test2` wrapper folders
- Promoted the active chart package to the repo root
- Renamed the final chart implementation so it is now the default surface instead of a `V3`-named layer
- Cleaned Storybook story names and helper references to match the final chart surface
- Updated the repo documentation to describe the single-package structure

## 2026-04-14

### Test2 cleanup: remove old V1 chart layer

- Removed the legacy `V1` chart source files from `Test2`
- Removed the old `V1` chart stories from `Test2`
- Kept `Test1` as the place to reference preserved `V1` chart behavior
- Simplified `Test2` so it stays focused on the active `V3` implementation

### Test2 V3: Hover interactions and Storybook control cleanup

- Added shared hover-card support for `V3` charts in `Test2`
- Expanded hover interaction coverage across line, bar, combo, donut, histogram, gauge, pointer scale, map bubble, and sparkline charts
- Improved hover-card placement so cards are less likely to cover the active mark
- Updated `showHoverCard` handling in Storybook controls and restored it as a visible prop with a default value of `false`
- Refreshed sample chart data to better reflect practical product-style scenarios
- Rebuilt `Test2/storybook-static` so local static previews reflect current source changes

## 2026-04-13

### Initial workspace repo setup

- Added the top-level git repo for the full workspace
- Tracked both `Test1` and `Test2`
- Preserved the split workflow:
  - `Test1` for reference work
  - `Test2` for active iteration
