import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(
      page,
      {
        include: [['#storybook-root']],
        exclude: [
          // MDS Select currently renders aria-expanded on a non-combobox wrapper.
          // Keep the exception narrow so the chart library still fails on our own critical issues.
          ['[data-test="DesignSystem-Select"]']
        ]
      },
      {
        detailedReport: true,
        detailedReportOptions: {
          html: false
        },
        includedImpacts: ['serious', 'critical'],
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        }
      }
    );
  }
};

export default config;
