import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  HTMLElement: 'readonly',
  MouseEvent: 'readonly',
  navigator: 'readonly',
  requestAnimationFrame: 'readonly',
  SVGElement: 'readonly',
  window: 'readonly'
};

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'storybook-static/**',
      '.storybook-home/**',
      '.claude/**',
      'node_modules/**',
      'coverage/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: browserGlobals,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/immutability': 'off',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: ['*.config.js', '*.config.ts', '.storybook/**/*.{ts,tsx}'],
    rules: {
      'storybook/no-uninstalled-addons': 'off'
    }
  }
);
