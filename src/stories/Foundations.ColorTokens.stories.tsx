import type { Meta, StoryObj } from '@storybook/react';

import { chartTokens, getSequentialScale } from '../theme/tokens';

const meta = {
  title: 'Foundations/Color Tokens',
  tags: ['autodocs']
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PaletteSystem: Story = {
  render: () => {
    const sequentialPalettes = [
      'default',
      'success',
      'warning',
      'red',
      'purple',
      'neel',
      'pink'
    ] as const;

    return (
      <div className="cl-story-stack">
        <section className="cl-section">
          <h2 className="cl-section__title">Sequential - Single Hue</h2>
          <div className="cl-token-grid">
            {sequentialPalettes.map((paletteName) => (
              <article className="cl-token-card" key={paletteName}>
                <p className="cl-token-card__title">{paletteName}</p>
                <div className="cl-swatch-row">
                  {getSequentialScale(paletteName).map((color, index) => (
                    <div className="cl-swatch" key={`${paletteName}-${index}`}>
                      <div
                        className="cl-swatch__chip"
                        style={{ background: color }}
                      />
                      <span className="cl-swatch__label">{color}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="cl-section">
          <h2 className="cl-section__title">Categorical Axis Palette</h2>
          <div className="cl-token-grid">
            <article className="cl-token-card">
              <p className="cl-token-card__title">Axis fills and strokes</p>
              <div className="cl-swatch-row">
                {chartTokens.categorical.axisPalette.map((palette) => (
                  <div className="cl-swatch" key={palette.name}>
                    <div
                      className="cl-swatch__chip"
                      style={{
                        background: palette.fill,
                        borderColor: palette.stroke
                      }}
                    />
                    <span className="cl-swatch__label">{palette.name}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="cl-token-card">
              <p className="cl-token-card__title">Text, surface and emphasis</p>
              <div className="cl-swatch-row">
                {[
                  chartTokens.text.default,
                  chartTokens.text.chartLabel,
                  chartTokens.text.chartHelper,
                  chartTokens.text.subtle,
                  chartTokens.neutral.stoneLight,
                  chartTokens.neutral.stoneLightest,
                  chartTokens.neutral.controlBorder,
                  chartTokens.categorical.primary,
                  chartTokens.categorical.secondary
                ].map((color, index) => (
                  <div className="cl-swatch" key={`${color}-${index}`}>
                    <div
                      className="cl-swatch__chip"
                      style={{ background: color }}
                    />
                    <span className="cl-swatch__label">{color}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    );
  }
};
