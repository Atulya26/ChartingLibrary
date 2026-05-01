# Contributing

Thanks for helping improve `@atulya_26/charting-library`.

## Setup

Use Node `20.19.0` or newer:

```bash
nvm use
npm ci
```

Run Storybook locally:

```bash
npm run storybook
```

## Validation

Before opening a pull request, run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run build-storybook
npm run size
```

`npm run size` checks brotli-compressed package artifacts. The current budgets are
50 KB for the ESM bundle and 5 KB for the CSS bundle, which gives the project a
real regression guardrail while still leaving room for Milestone 2 improvements.

## Visual Review

Storybook is the source of truth for visual review. If a pull request changes chart
appearance, interaction states, spacing, colors, or docs examples, review the Chromatic
diff before merge.

Chromatic behavior:

- `main` pushes auto-accept the baseline after review setup.
- Pull requests should fail on visual diffs once the baseline is approved.
- If `CHROMATIC_PROJECT_TOKEN` is not configured, the workflow skips safely.
- External fork pull requests do not receive repository secrets, so visual regression
  may skip there. A maintainer should rerun Chromatic from a trusted branch before merge
  when a forked PR changes visuals.

## Release Process

Releases should use the GitHub Actions `Manual Release` workflow after CI is green.
Publishing from a local laptop is discouraged once the workflow is trusted.

The release workflow validates typecheck, lint, formatting, package build,
Storybook build, and size budgets before publishing.

## Branch Protection Close-Out

After the Stability Foundation milestone lands, configure GitHub branch protection:

- Require pull requests before merge to `main`
- Require status checks: Typecheck, Lint, Format, Build Package, Build Storybook, Size Limit
- Require the branch to be up to date before merge
- Prefer squash merge or linear history

## Milestone 1 Close-Out

- [ ] Branch protection rules configured in GitHub
- [ ] First Chromatic baseline approved
- [ ] Pull request visual diffs are blocking after baseline approval
- [ ] `0.1.5` published through the `Manual Release` workflow
- [ ] `CONTRIBUTING.md` reviewed by someone other than the author

## Performance & A11y Patterns

Milestone 2 work should preserve existing chart visuals by default. Accessibility
interaction states are opt-in until the team explicitly changes that contract.

Performance patterns:

- Measure before optimizing. Update `docs/perf-baseline.md` with the exact machine,
  browser, throttling setting, run count, and averaged result.
- Use deterministic Storybook data. Stress stories should import from
  `src/stories/seededData.ts`; do not use `Math.random()` in stories.
- Memoize bottom-up: primitives first, then derived props and layout values, then chart
  containers.
- Keep consumer data references stable. Prefer data stored in state, loaded from a query
  cache, or wrapped in `useMemo` in the consuming app.
- Do not memoize tooltip position wrappers, mousemove-only hover layers, or tiny wrappers
  that render once per parent render.
- Use an rAF coalescing helper for high-frequency handlers: latest event wins, the work
  runs on the next animation frame.

Accessibility patterns:

- Keyboard chart inspection must be enabled by an explicit prop, planned as
  `interactive={true}`. The default remains `interactive={false}` so existing chart
  behavior and visuals do not change unexpectedly.
- `ariaLabel` and `ariaDescription` can be available without enabling keyboard
  interaction because screen readers still need chart context.
- Use one focus target per chart when `interactive` is enabled. Arrow keys cycle through
  data points; `Tab` leaves the chart; `Escape` dismisses the tooltip.
- Keep live regions persistent at the chart root. Do not mount `aria-live` inside a tooltip
  that appears and disappears.
- Generate ARIA IDs with React `useId()`. Do not hand-roll counters or reuse chart titles
  as IDs.
- Focus styling should use existing tokens and `:focus-visible` so pointer users do not see
  unexpected rings.
