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

## Visual Review

Storybook is the source of truth for visual review. If a pull request changes chart
appearance, interaction states, spacing, colors, or docs examples, review the Chromatic
diff before merge.

Chromatic behavior:

- `main` pushes auto-accept the baseline after review setup.
- Pull requests should fail on visual diffs once the baseline is approved.
- If `CHROMATIC_PROJECT_TOKEN` is not configured, the workflow skips safely.

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
