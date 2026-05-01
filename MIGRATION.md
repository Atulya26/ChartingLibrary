# Migration Guide

## 0.1.x to 1.0.0

`1.0.0` is the first stable release of `@atulya_26/charting-library`. The release is intentionally
additive for existing prototype consumers: the main chart imports, CSS import, and existing story
examples continue to work.

### Package Install

No import path changes are required.

```tsx
import '@atulya_26/charting-library/styles.css';
import { BarChart, LineChart, DonutChart } from '@atulya_26/charting-library';
```

### New Stable APIs

The following APIs were added before the `1.0.0` freeze:

- `ariaLabel` and `ariaDescription` on chart components for accessible naming.
- `enableKeyboardNavigation` for opt-in keyboard inspection of chart marks.
- `downsample` on `LineChart`, `ComboChart`, and `Sparkline`.
- `downsampleLttb` and `DownsamplePoint` for upstream line-data preprocessing.

### API Surface

The public exports for `1.0.0` are listed in [`docs/api-inventory.md`](./docs/api-inventory.md).
Avoid importing from private source paths such as `src/utils/*`, `src/stories/*`, or
`src/chartUtils.tsx`; those files are implementation details and may change without a major version.

### Chart Tokens

`chartTokens` remains public for `1.0.0` so existing examples and consumers can align custom chart
colors with the library. Treat it as a read-only token object. Runtime token mutation is not a
supported theming API.

### Sankey Layout

`SankeyChart` and the exported Sankey layout helpers remain available. Exact node coordinates and
ribbon routing are deterministic for a given input, but positioning is not part of the semver
contract. This allows future layout-quality improvements without requiring a major version.

### Node Engines

The package supports consumer installs on Node `>=18.0.0`. Local library development is tested with
Node `20.19.0` through `.nvmrc`.

## Future Major Versions

Breaking changes after `1.0.0` will be documented here with:

- What changed.
- Why it changed.
- Before/after examples.
- Replacement APIs where available.
