import type { Preview } from '@storybook/react-vite';
import '@ncai/design-tokens-temp/styles.css';
import '@ncai/design-system-temp/styles.css';
import '../src/preview.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Design system theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ],
        dynamicTitle: true
      }
    }
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      document.body.dataset.theme = theme;
      return Story();
    }
  ],
  parameters: {
    backgrounds: {
      default: 'canvas',
      options: {
        canvas: {
          name: 'Canvas',
          value: 'var(--ncai-color-bg-canvas)'
        },
        surface: {
          name: 'Surface',
          value: 'var(--ncai-color-bg-surface)'
        }
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      test: 'todo'
    }
  }
};

export default preview;
