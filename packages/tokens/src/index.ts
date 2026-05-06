export const tokenPrefix = 'ncai';
export const tokenSource = 'resource/token/figma.scss';

export const designTokens = {
  font: {
    family: {
      sans: 'var(--ncai-font-family-sans)'
    },
    size: {
      caption: 'var(--ncai-font-size-caption)',
      labelSm: 'var(--ncai-font-size-label-sm)',
      labelMd: 'var(--ncai-font-size-label-md)',
      labelLg: 'var(--ncai-font-size-label-lg)'
    },
    lineHeight: {
      caption: 'var(--ncai-line-height-caption)',
      labelSm: 'var(--ncai-line-height-label-sm)',
      labelMd: 'var(--ncai-line-height-label-md)',
      labelLg: 'var(--ncai-line-height-label-lg)'
    }
  },
  color: {
    bg: {
      canvas: 'var(--ncai-color-bg-canvas)',
      surface: 'var(--ncai-color-bg-surface)',
      subtle: 'var(--ncai-color-bg-subtle)',
      disabled: 'var(--ncai-color-bg-disabled)'
    },
    text: {
      primary: 'var(--ncai-color-text-primary)',
      secondary: 'var(--ncai-color-text-secondary)',
      placeholder: 'var(--ncai-color-text-placeholder)',
      inverse: 'var(--ncai-color-text-inverse)',
      danger: 'var(--ncai-color-text-danger)'
    },
    border: {
      default: 'var(--ncai-color-border-default)',
      muted: 'var(--ncai-color-border-muted)',
      hover: 'var(--ncai-color-border-hover)',
      focus: 'var(--ncai-color-border-focus)',
      danger: 'var(--ncai-color-border-danger)'
    },
    accent: {
      primary: 'var(--ncai-color-accent-primary)',
      primaryHover: 'var(--ncai-color-accent-primary-hover)',
      danger: 'var(--ncai-color-accent-danger)'
    }
  },
  radius: {
    xs: 'var(--ncai-radius-xs)',
    checkbox: 'var(--ncai-radius-checkbox)',
    sm: 'var(--ncai-radius-sm)',
    md: 'var(--ncai-radius-md)',
    full: 'var(--ncai-radius-full)'
  },
  space: {
    1: 'var(--ncai-space-1)',
    2: 'var(--ncai-space-2)',
    3: 'var(--ncai-space-3)',
    4: 'var(--ncai-space-4)',
    5: 'var(--ncai-space-5)'
  },
  motion: {
    duration: {
      fast: 'var(--ncai-duration-fast)',
      normal: 'var(--ncai-duration-normal)'
    },
    ease: {
      standard: 'var(--ncai-ease-standard)'
    }
  }
} as const;

export type DesignTokens = typeof designTokens;
