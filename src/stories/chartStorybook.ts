import type { Conditional, InputType } from '@storybook/core/csf';

export const chartMetaParameters = {
  controls: {
    expanded: true,
    sort: 'requiredFirst'
  }
} as const;

const hiddenTableArg = {
  control: false,
  table: {
    disable: true
  }
} as const satisfies InputType;

type ConditionalArg = Conditional;

type OptionLabels = Record<string, string>;
type OptionsControlType = 'select' | 'inline-radio' | 'radio';
type NumericControlType = 'number' | 'range';

function makeCategory(category: string): NonNullable<InputType['table']> {
  return { category };
}

export function booleanArg(
  description: string,
  category = 'Display',
  conditional?: ConditionalArg,
  name?: string
): InputType {
  return {
    control: {
      type: 'boolean'
    },
    description,
    if: conditional,
    ...(name ? { name } : {}),
    table: {
      ...makeCategory(category),
      type: {
        summary: 'boolean'
      }
    },
    type: 'boolean'
  };
}

export function hoverCardArg(conditional?: ConditionalArg): InputType {
  return booleanArg('Boolean toggle for the hover helper card.', 'Interaction', conditional);
}

export function numberArg(
  description: string,
  category = 'Layout',
  options?: { min?: number; max?: number; step?: number },
  conditional?: ConditionalArg,
  controlType: NumericControlType = 'number'
): InputType {
  return {
    control: {
      type: controlType,
      ...options
    },
    description,
    if: conditional,
    table: {
      ...makeCategory(category),
      type: {
        summary: 'number'
      }
    },
    type: 'number'
  };
}

export function rangeArg(
  description: string,
  category = 'Layout',
  options?: { min?: number; max?: number; step?: number },
  conditional?: ConditionalArg
): InputType {
  return numberArg(description, category, options, conditional, 'range');
}

export function selectArg(
  options: readonly string[],
  description: string,
  category = 'Style',
  conditional?: ConditionalArg,
  controlType: OptionsControlType = 'select',
  labels?: OptionLabels
): InputType {
  return {
    options,
    control: {
      type: controlType,
      ...(labels ? { labels } : {})
    },
    description,
    if: conditional,
    table: {
      ...makeCategory(category),
      type: {
        summary: options.join(' | ')
      }
    }
  };
}

export function colorArg(
  description: string,
  category = 'Style',
  conditional?: ConditionalArg
): InputType {
  return {
    control: {
      type: 'color'
    },
    description,
    if: conditional,
    table: {
      ...makeCategory(category),
      type: {
        summary: 'color'
      }
    },
    type: 'string'
  };
}

export function advancedDataArg(description: string, conditional?: ConditionalArg): InputType {
  return {
    control: false,
    description,
    if: conditional,
    table: {
      ...makeCategory('Advanced data'),
      type: {
        summary: 'code only'
      }
    }
  };
}

export const hiddenEventArgTypes = {
  actions: hiddenTableArg,
  onMenuClick: hiddenTableArg,
  onPrimaryActionClick: hiddenTableArg,
  onSelectChange: hiddenTableArg,
  primaryActionLabel: hiddenTableArg,
  selectOptions: hiddenTableArg,
  selectedValue: hiddenTableArg
};

export const surfaceArgTypes = {
  width: numberArg(
    'Use a number for consistent Storybook sizing. String widths are supported in code, but number controls are clearer for day-to-day exploration.'
  ),
  showCardBackground: booleanArg(
    'Boolean toggle for the chart card surface. Use this for simple on/off previewing.'
  ),
  showHeader: booleanArg(
    'Boolean toggle for the header row. Best modeled as on/off because it only changes visibility.'
  ),
  showTitle: booleanArg('Boolean toggle for title visibility.'),
  showLegend: booleanArg('Boolean toggle for legend visibility.'),
  legendPosition: selectArg(
    ['top', 'right', 'bottom'],
    'Finite legend placement choice. A select works better than free text here.',
    'Display',
    { arg: 'showLegend', truthy: true },
    'inline-radio',
    {
      top: 'Top',
      right: 'Right',
      bottom: 'Bottom'
    }
  ),
  showMenu: booleanArg('Boolean toggle for the overflow menu affordance.')
};

export const fillStyleOptions = ['inherit', 'solid', 'texture', 'gradient'] as const;
export const fillLegendMarkerOptions = ['auto', 'solid', 'solid-texture'] as const;
export const lineLegendMarkerOptions = [
  'auto',
  'line',
  'line-dashed',
  'dot-line',
  'dot-line-dashed'
] as const;

export const fillStyleLabels = {
  inherit: 'Chart default',
  solid: 'Solid fill',
  texture: 'Textured fill',
  gradient: 'Gradient fill'
} as const;

export const fillLegendMarkerLabels = {
  auto: 'Auto',
  solid: 'Solid chip',
  'solid-texture': 'Textured chip'
} as const;

export const lineLegendMarkerLabels = {
  auto: 'Auto',
  line: 'Line',
  'line-dashed': 'Dashed line',
  'dot-line': 'Line with dots',
  'dot-line-dashed': 'Dashed line with dots'
} as const;

export const baseDocNote =
  'Simple prop UX rule: use booleans for visibility toggles, selects for finite visual variants, sliders or numbers for bounded geometry, and keep advanced data arrays/callback props out of the normal controls because raw JSON editing is not layman-friendly in Storybook.';
