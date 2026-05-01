# Performance Baseline

This document is the durable measurement log for Milestone 2. Update it before
and after each performance-focused PR so performance claims stay reviewable after
the pull request is merged.

## Measurement Protocol

- Tooling: React DevTools Profiler plus Storybook stress stories.
- Browser: Chrome `TBD`.
- Machine: `TBD CPU`, `TBD RAM`, `TBD OS`.
- CPU throttling: DevTools Performance panel, `4x slowdown`.
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

Fill in `before` in PR 2A before memoization. Update `after-*` columns in the
sub-PR that changes the relevant scenario.

| Scenario | Metric                 | Before | After 2A | After 2B | After 2D | Target  |
| -------- | ---------------------- | ------ | -------- | -------- | -------- | ------- |
| S1       | Chart re-renders       | TBD    | TBD      | n/a      | n/a      | 0       |
| S1       | Actual duration avg    | TBD    | TBD      | n/a      | n/a      | >=3x    |
| S2       | Cold mount avg         | TBD    | TBD      | n/a      | n/a      | >=3x    |
| S3       | Cold render avg        | TBD    | TBD      | n/a      | n/a      | <50ms   |
| S4       | Raw cold render avg    | TBD    | n/a      | n/a      | TBD      | <2s     |
| S4       | Downsampled render avg | TBD    | n/a      | n/a      | TBD      | <500ms  |
| S5       | Long tasks in 5s drag  | TBD    | n/a      | TBD      | n/a      | <2      |
| S5       | Avg frame duration     | TBD    | n/a      | TBD      | n/a      | <16.7ms |

## Run Log

### PR 2A Baseline

- Commit: `TBD`
- Date: `TBD`
- Notes: Capture before memoization.

### PR 2A After Memoization

- Commit: `TBD`
- Date: `TBD`
- Notes: Capture after primitive and chart memoization.

### PR 2B Map Performance

- Commit: `TBD`
- Date: `TBD`
- Notes: Capture after map projection and rAF work.

### PR 2D Downsampling

- Commit: `TBD`
- Date: `TBD`
- Notes: Capture raw and downsampled large-line scenarios.
