interface ChartA11yContentOptions {
  title: string;
  description?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  fallbackDescription: string;
}

interface ChartA11yPropsOptions {
  titleId: string;
  descriptionId: string;
  enableKeyboardNavigation?: boolean;
}

interface ChartRoleA11yPropsOptions {
  labelId: string;
  descriptionId: string;
  label: string;
  description: string;
  enableKeyboardNavigation?: boolean;
}

interface ChartRoleA11yContentProps {
  labelId: string;
  descriptionId: string;
  label: string;
  description: string;
}

interface SeriesSummary {
  label?: string;
  values: number[];
}

interface CategoricalDescriptionOptions {
  chartType: string;
  categories?: string[];
  series?: SeriesSummary[];
}

interface SegmentSummary {
  label?: string;
  value: number;
}

interface SegmentDescriptionOptions {
  chartType: string;
  segments?: SegmentSummary[];
}

function formatValue(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function getFiniteValues(series: SeriesSummary[] = []) {
  return series.flatMap((item) => item.values).filter((value) => Number.isFinite(value));
}

function getHighestValueSummary(
  series: SeriesSummary[] = [],
  categories: string[] = []
): { value: number; label: string } | null {
  let highest: { value: number; label: string } | null = null;

  series.forEach((item) => {
    item.values.forEach((value, index) => {
      if (!Number.isFinite(value)) {
        return;
      }

      const label = [item.label, categories[index]].filter(Boolean).join(' at ');
      if (!highest || value > highest.value) {
        highest = { value, label: label || 'point' };
      }
    });
  });

  return highest;
}

export function getChartA11yContent({
  title,
  description,
  ariaLabel,
  ariaDescription,
  fallbackDescription
}: ChartA11yContentOptions) {
  return {
    label: ariaLabel ?? title,
    description: ariaDescription ?? description ?? fallbackDescription
  };
}

export function getChartA11yProps({
  titleId,
  descriptionId,
  enableKeyboardNavigation = false
}: ChartA11yPropsOptions) {
  return {
    role: 'img',
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    tabIndex: enableKeyboardNavigation ? 0 : undefined
  } as const;
}

export function getChartRoleA11yProps({
  labelId,
  descriptionId,
  enableKeyboardNavigation = false
}: ChartRoleA11yPropsOptions) {
  return {
    role: 'img',
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
    tabIndex: enableKeyboardNavigation ? 0 : undefined
  } as const;
}

export function ChartSvgA11y({
  titleId,
  descriptionId,
  label,
  description
}: {
  titleId: string;
  descriptionId: string;
  label: string;
  description: string;
}) {
  return (
    <>
      <title id={titleId}>{label}</title>
      <desc id={descriptionId}>{description}</desc>
    </>
  );
}

export function ChartRoleA11yContent({
  labelId,
  descriptionId,
  label,
  description
}: ChartRoleA11yContentProps) {
  return (
    <>
      <span id={labelId} className="cl-sr-only">
        {label}
      </span>
      <span id={descriptionId} className="cl-sr-only">
        {description}
      </span>
    </>
  );
}

export function ChartLiveRegion({ announcement }: { announcement: string }) {
  return (
    <div className="cl-sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}

export function describeCategoricalChart({
  chartType,
  categories = [],
  series = []
}: CategoricalDescriptionOptions) {
  const values = getFiniteValues(series);
  const highest = getHighestValueSummary(series, categories);
  const categoryText = categories.length === 1 ? '1 category' : `${categories.length} categories`;
  const seriesText = series.length === 1 ? '1 series' : `${series.length} series`;

  if (!values.length) {
    return `${chartType} with ${categoryText} and ${seriesText}.`;
  }

  return `${chartType} with ${categoryText} and ${seriesText}. Highest value is ${formatValue(
    highest?.value ?? values[0]
  )}${highest?.label ? ` for ${highest.label}` : ''}.`;
}

export function describeSegmentChart({ chartType, segments = [] }: SegmentDescriptionOptions) {
  const values = segments.map((segment) => segment.value).filter((value) => Number.isFinite(value));
  const total = values.reduce((sum, value) => sum + value, 0);
  const highest = segments.reduce<SegmentSummary | null>((current, segment) => {
    if (!Number.isFinite(segment.value)) {
      return current;
    }

    return !current || segment.value > current.value ? segment : current;
  }, null);
  const segmentText = segments.length === 1 ? '1 segment' : `${segments.length} segments`;

  if (!values.length) {
    return `${chartType} with ${segmentText}.`;
  }

  return `${chartType} with ${segmentText}, total ${formatValue(total)}. Highest segment is ${
    highest?.label ?? 'unnamed'
  } at ${formatValue(highest?.value ?? 0)}.`;
}

export function describeSingleValueChart({
  chartType,
  value,
  min,
  max
}: {
  chartType: string;
  value: number;
  min?: number;
  max?: number;
}) {
  const range =
    typeof min === 'number' && typeof max === 'number' ? ` on a ${min} to ${max} scale` : '';
  return `${chartType} showing ${formatValue(value)}${range}.`;
}
