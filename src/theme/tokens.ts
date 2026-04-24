export type SequentialPaletteName =
  | 'default'
  | 'success'
  | 'warning'
  | 'red'
  | 'purple'
  | 'neel'
  | 'pink';

export type SequentialTone =
  | 'lightest'
  | 'lighter'
  | 'light'
  | 'default'
  | 'dark'
  | 'darker';

export const chartTokens = {
  fontFamily: "'Nunito Sans', 'Segoe UI', system-ui, sans-serif",
  text: {
    default: '#1f1f1f',
    subtle: '#707070',
    disabled: '#a6a6a6',
    legend: '#1f1f1f',
    legendInactive: '#707070',
    inverse: '#ffffff',
    axesMarker: '#707070'
  },
  neutral: {
    white: '#ffffff',
    stoneLightest: '#f4f4f4',
    stoneLighter: '#ececec',
    stoneLight: '#e5e5e5',
    surfaceTint: '#eff2f8',
    nightLighter: '#707070'
  },
  shadow: {
    card: '0 1px 4px rgba(0, 0, 0, 0.16)'
  },
  radii: {
    marker: 4,
    bar: 3,
    card: 4,
    pill: 999
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16
  },
  chart: {
    plotHeight: 180,
    plotFrameHeight: 206,
    xAxisHeight: 26,
    lineXInset: 28,
    horizontalCategoryLabelWidth: 112,
    axisBottomPadding: 22,
    axisTitleWidth: 18,
    axisValueWidth: 18,
    gridLineCount: 3,
    barCategoryGapRatio: 0.3,
    barGapPx: 2
  },
  categorical: {
    primary: '#394cc7',
    secondary: '#3bceff',
    axisPalette: [
      { name: 'Ax 1', fill: '#8798d7', stroke: '#677bcf' },
      { name: 'Ax 2', fill: '#0181a1', stroke: '#0181a1' },
      { name: 'Ax 3', fill: '#60bb9a', stroke: '#44a081' },
      { name: 'Ax 4', fill: '#8d459d', stroke: '#8d459d' },
      { name: 'Ax 5', fill: '#f17ca3', stroke: '#e56798' },
      { name: 'Ax 6', fill: '#db7d46', stroke: '#b65d21' }
    ]
  },
  sequential: {
    default: {
      lightest: '#bbe1f0',
      lighter: '#91c9de',
      light: '#5facc6',
      default: '#3799b8',
      dark: '#0181a1',
      darker: '#006b86'
    },
    success: {
      lightest: '#a9ebd1',
      lighter: '#7ad5b3',
      light: '#60bb9a',
      default: '#44a081',
      dark: '#168666',
      darker: '#177156'
    },
    warning: {
      lightest: '#ffd9c5',
      lighter: '#f5b390',
      light: '#e89364',
      default: '#db7d46',
      dark: '#b65d21',
      darker: '#a34800'
    },
    red: {
      lightest: '#ffbaba',
      lighter: '#fe9898',
      light: '#f57375',
      default: '#e74f51',
      dark: '#c93030',
      darker: '#941313'
    },
    purple: {
      lightest: '#f3c9f7',
      lighter: '#ddacea',
      light: '#bf85ce',
      default: '#b066c3',
      dark: '#8d459d',
      darker: '#6d3878'
    },
    neel: {
      lightest: '#ced9fc',
      lighter: '#abbaee',
      light: '#8798d7',
      default: '#677bcf',
      dark: '#495bc1',
      darker: '#373e9d'
    },
    pink: {
      lightest: '#ffcfdd',
      lighter: '#fea4bf',
      light: '#f17ca3',
      default: '#e56798',
      dark: '#c9427e',
      darker: '#ab2c66'
    }
  },
  multiHue: {
    donutBlue: '#0078ce'
  },
  typography: {
    headingDefault: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 700
    },
    headingMedium: {
      fontSize: 20,
      lineHeight: 32,
      fontWeight: 600
    },
    bodyDefault: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 400
    },
    bodyBold: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 700
    },
    smallDefault: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 600
    },
    smallRegular: {
      fontSize: 12,
      lineHeight: 14,
      fontWeight: 400
    }
  }
} as const;

export function getSequentialPalette(name: SequentialPaletteName) {
  return chartTokens.sequential[name];
}

export function getSequentialScale(name: SequentialPaletteName) {
  const palette = getSequentialPalette(name);
  return [
    palette.lightest,
    palette.lighter,
    palette.light,
    palette.default,
    palette.dark,
    palette.darker
  ];
}

export function getSequentialTone(
  name: SequentialPaletteName,
  tone: SequentialTone
) {
  return chartTokens.sequential[name][tone];
}
