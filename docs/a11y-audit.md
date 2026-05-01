# Accessibility Audit

Date: 2026-05-01

Scope: default chart tokens, Storybook chart examples, generated chart labels/descriptions, opt-in
keyboard chart inspection, and reduced-motion behavior.

## Summary

- Text tokens used for chart titles, labels, legends, tooltips, and axis labels meet WCAG AA text
  contrast on the default white and tinted chart surfaces.
- `enableKeyboardNavigation` remains opt-in. When enabled, each chart exposes one keyboard focus
  target and uses arrow keys to inspect the chart data.
- Live regions are mounted outside SVG/tooltip content so screen readers receive stable focused-item
  announcements.
- Loading skeleton animations and inline chart hover transitions honor `prefers-reduced-motion`.
- Axe is enforced in CI for serious and critical WCAG 2.1 A/AA violations through Storybook.
- The Storybook axe context excludes the MDS `Select` wrapper selector
  `[data-test="DesignSystem-Select"]` because the upstream component renders an unsupported ARIA
  attribute on its wrapper. The exception is intentionally narrow and should be removed when MDS
  fixes that markup.

## Token Contrast Notes

Contrast ratios below are measured against `chartTokens.neutral.white` (`#ffffff`) unless noted.

| Token                         | Color     |   Ratio | Result                             |
| ----------------------------- | --------- | ------: | ---------------------------------- |
| `text.default`                | `#1f1f1f` | 16.48:1 | Pass for text                      |
| `text.subtle` / axis text     | `#707070` |  4.95:1 | Pass for text                      |
| `action.primary` / focus ring | `#0b69ff` |  4.69:1 | Pass for text and focus indicators |
| `categorical.primary`         | `#394cc7` |  6.93:1 | Pass for graphical objects         |
| `categorical.axisPalette[1]`  | `#0181a1` |  4.51:1 | Pass for graphical objects         |
| `categorical.axisPalette[3]`  | `#8d459d` |  6.05:1 | Pass for graphical objects         |
| `sequential.success.dark`     | `#168666` |  4.53:1 | Pass for graphical objects         |
| `sequential.warning.dark`     | `#b65d21` |  4.59:1 | Pass for graphical objects         |
| `sequential.red.dark`         | `#c93030` |  5.32:1 | Pass for graphical objects         |

## Known Limitations

Some lighter categorical and sequential fills are intentionally soft to match the Figma chart
language. Used alone on white, they do not always reach the WCAG 3:1 graphical-object contrast
target:

| Token                             | Color     |  Ratio | Guidance                                                           |
| --------------------------------- | --------- | -----: | ------------------------------------------------------------------ |
| `categorical.secondary`           | `#3bceff` | 1.83:1 | Pair with a darker stroke or use only as a secondary/fill context. |
| `categorical.axisPalette[0].fill` | `#8798d7` | 2.80:1 | Use paired stroke `#677bcf` for boundaries.                        |
| `categorical.axisPalette[2].fill` | `#60bb9a` | 2.31:1 | Use darker success tones for compliance-critical views.            |
| `categorical.axisPalette[4].fill` | `#f17ca3` | 2.58:1 | Use paired stroke `#e56798` or darker pink tones.                  |
| `categorical.axisPalette[5].fill` | `#db7d46` | 2.99:1 | Borderline; use paired stroke `#b65d21` when possible.             |

For compliance-critical dashboards, prefer the darker sequential tones or pass a product-approved
palette whose marks maintain at least 3:1 contrast against the chart background. Text placed on data
marks should use either `text.default` or `text.inverse` after checking the specific mark color.

## Manual Checks

- Bar, line, donut, map bubble, Sankey, histogram, pointer scale, sparkline, and combo charts expose
  generated accessible titles and descriptions.
- Keyboard navigation is opt-in and does not change default tab order.
- Focus-driven hover cards reuse the existing hover UI, which keeps visual behavior consistent
  across pointer and keyboard users.
- The Storybook axe job blocks serious and critical violations; moderate findings should be fixed
  when possible or documented here with rationale.
