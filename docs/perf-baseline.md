# Performance Baseline

This document is the durable measurement log for Milestone 2. Update it before
and after each performance-focused PR so performance claims stay reviewable after
the pull request is merged.

## Measurement Protocol

- Tooling: React DevTools Profiler plus Storybook stress stories.
- Browser: Chrome `147.0.7727.138`.
- Machine: Apple M4, 16 GB RAM, macOS Darwin `25.3.0` arm64.
- CPU throttling: DevTools Performance panel or Playwright CDP, `4x slowdown`.
- Sampling: run each scenario 5 times, drop best and worst, average the middle 3.
- Data: all stress data must come from deterministic seeded helpers.
- Visual baseline: Chromatic should show no unintended design diffs.

## Scenarios

| ID  | Scenario       | How to Measure                                                      | Target                                     |
| --- | -------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| S1  | Stress 12      | 12 charts on screen, click `Re-render parent` 10 times              | 0 chart re-renders with stable props       |
| S2  | Stress 12 cold | Initial mount of the Stress 12 story                                | >=3x faster after memoization              |
| S3  | Line 1k        | Initial render of a single LineChart with 1,000 points              | <50ms cold render                          |
| S4  | Line 10k       | Initial render of a single LineChart with 10,000 points             | <500ms downsampled, <2s acceptable raw     |
| S5  | Map drag       | Drag MapBubbleChart with 200+ bubbles at roughly 60Hz for 5 seconds | <2 long tasks over 50ms; <16.7ms avg frame |

## Results

Milestone 2 landed the instrumentation and stress stories after the original
prototype code had already moved on, so S1/S2/S3/S5 historical before/after
numbers were not captured with enough rigor to publish as release evidence.
Those rows are intentionally marked as deferred rather than left as placeholders.
S4 has supporting automated Storybook smoke data because it was captured during
the downsampling slice.

| Scenario | Metric                 | Before   | After 2A | After 2B | After 2D                                        | Target  |
| -------- | ---------------------- | -------- | -------- | -------- | ----------------------------------------------- | ------- |
| S1       | Chart re-renders       | Deferred | Deferred | n/a      | n/a                                             | 0       |
| S1       | Actual duration avg    | Deferred | Deferred | n/a      | n/a                                             | >=3x    |
| S2       | Cold mount avg         | Deferred | Deferred | n/a      | n/a                                             | >=3x    |
| S3       | Cold render avg        | Deferred | Deferred | n/a      | n/a                                             | <50ms   |
| S4       | Raw cold render avg    | Deferred | n/a      | n/a      | 3237.1ms story-ready smoke                      | <2s     |
| S4       | Downsampled render avg | Deferred | n/a      | n/a      | 2906.7ms story-ready smoke, ~90% path reduction | <500ms  |
| S5       | Long tasks in 5s drag  | Deferred | n/a      | Deferred | n/a                                             | <2      |
| S5       | Avg frame duration     | Deferred | n/a      | Deferred | n/a                                             | <16.7ms |

> Note: React Profiler measurements are still required before merging this milestone
> to validate the S1/S2/S3 headline claims. The automated smoke measurements below
> are useful supporting evidence, but they include Storybook iframe and page-load
> overhead and should not be treated as the React cold-render targets.

## Run Log

### PR 2A Baseline

- Commit: Not captured before the memoization work landed.
- Date: `2026-05-01`
- Notes: Deferred to post-1.0 performance observation. No placeholder values are published for
  this scenario because the branch history no longer has a clean pre-instrumentation measurement
  point.

### PR 2A After Memoization

- Commit: Not captured with the full React Profiler protocol.
- Date: `2026-05-01`
- Notes: Deferred to post-1.0 performance observation. CI, size checks, visual regression, and
  Storybook a11y coverage all passed, but S1/S2/S3 profiler numbers should be collected in a
  dedicated follow-up before making quantified memoization claims.

### PR 2B Map Performance

- Commit: Not captured with the full drag-frame protocol.
- Date: `2026-05-01`
- Notes: Deferred to post-1.0 performance observation. The map implementation now memoizes
  projection/geography paths and coalesces drag/hover updates with `requestAnimationFrame`, but
  S5 frame metrics should be collected in a dedicated follow-up before publishing numeric claims.

### PR 2D Downsampling

- Commit: `03f545f`
- Date: `2026-05-01`
- Notes: Optional downsampling merged through PR #17.
- Local validation:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run format:check`
  - `npm run size` (`48.15 KB` ESM brotli / `55 KB` budget, `3.52 KB` CSS brotli / `5 KB` budget)
  - `npm run build-storybook`
  - `npm run test-storybook` (`19` suites / `69` stories passed)
- GitHub validation on PR #17 and integration PR #10:
  - Typecheck, Lint, Format, Build Package, Build Storybook, Size Limit, Visual Regression, and A11y (axe) all passed.
- Automated Storybook smoke under 4x CPU throttle on built `storybook-static`:
  - S3 Line 1k story-ready time, 5 runs, drop best/worst: `643.9ms`.
  - S4 Line 10k raw story-ready time, 5 runs, drop best/worst: `3237.1ms`.
  - S4 Line 10k downsampled story-ready time, 5 runs, drop best/worst: `2906.7ms`.
  - S4 raw SVG line path data: `315,954` total `d` characters.
  - S4 downsampled SVG line path data: `31,591` total `d` characters.
  - Path data reduction: ~`90%`.
