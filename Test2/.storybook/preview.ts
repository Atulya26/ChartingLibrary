import type { Preview } from '@storybook/react';

import '@innovaccer/design-system/css';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: '#f6f7fb' },
        { name: 'white', value: '#ffffff' },
        { name: 'stone', value: '#f4f4f4' }
      ]
    }
  }
};

export default preview;
