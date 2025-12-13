/**
 * VitaLITy 2 User Study Design System
 * Modern, accessible, and cohesive styling for all study steps
 */

// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    main: '#FFC700',        // Vibrant yellow (main CTA)
    dark: '#E6B300',        // Darker yellow for hover states
    light: '#FFD633',       // Lighter yellow for accents
  },

  // Neutral Colors
  neutral: {
    darkest: '#1a1a1a',     // Almost black
    dark: '#2c3e50',        // Dark gray-blue
    medium: '#34495e',      // Medium gray-blue
    light: '#7f8c8d',       // Light gray
    lighter: '#95a5a6',     // Lighter gray
    lightest: '#ecf0f1',    // Very light gray
    white: '#ffffff',
  },

  // Background Colors
  background: {
    main: '#ffffff',
    subtle: '#f8f9fa',
    card: '#ffffff',
    input: '#ffffff',
    disabled: '#e9ecef',
  },

  // Border Colors
  border: {
    main: '#dee2e6',
    dark: '#adb5bd',
    focus: '#FFC700',
  },

  // State Colors
  state: {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
  },

  // Shadow Colors
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    xl: 'rgba(0, 0, 0, 0.2)',
  }
};

// Typography
export const typography = {
  fontFamily: {
    main: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'Monaco, Consolas, "Courier New", monospace',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '36px',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
  }
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

// Shadows
export const shadows = {
  none: 'none',
  sm: `0 1px 2px 0 ${colors.shadow.sm}`,
  md: `0 4px 6px -1px ${colors.shadow.md}`,
  lg: `0 10px 15px -3px ${colors.shadow.lg}`,
  xl: `0 20px 25px -5px ${colors.shadow.xl}`,
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Transitions
export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
};

// Component Styles
export const components = {
  // Button Styles
  button: {
    primary: {
      background: colors.primary.main,
      color: colors.neutral.darkest,
      border: 'none',
      borderRadius: borderRadius.md,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      cursor: 'pointer',
      transition: `all ${transitions.normal}`,
      boxShadow: shadows.sm,
    },

    secondary: {
      background: colors.neutral.lighter,
      color: colors.neutral.white,
      border: 'none',
      borderRadius: borderRadius.md,
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: `all ${transitions.normal}`,
    },

    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    }
  },

  // Card Styles
  card: {
    default: {
      background: colors.background.card,
      border: `1px solid ${colors.border.main}`,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      boxShadow: shadows.md,
    },

    elevated: {
      background: colors.background.card,
      border: 'none',
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      boxShadow: shadows.lg,
    }
  },

  // Input Styles
  input: {
    default: {
      background: colors.background.input,
      border: `2px solid ${colors.border.main}`,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.main,
      lineHeight: typography.lineHeight.normal,
      transition: `all ${transitions.fast}`,
      width: '100%',
      boxSizing: 'border-box' as const,
    },

    focus: {
      borderColor: colors.border.focus,
      outline: 'none',
      boxShadow: `0 0 0 3px ${colors.shadow.sm}`,
    }
  },

  // Form Styles
  form: {
    container: {
      background: colors.background.card,
      border: `2px solid ${colors.border.main}`,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      margin: `${spacing.xl} auto`,
      maxWidth: '800px',
      boxShadow: shadows.md,
    },

    label: {
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg,
      color: colors.neutral.dark,
      marginBottom: spacing.sm,
      display: 'block',
    },

    description: {
      fontSize: typography.fontSize.base,
      color: colors.neutral.medium,
      marginBottom: spacing.lg,
      lineHeight: typography.lineHeight.relaxed,
    }
  }
};

// Utility function to merge styles
export const mergeStyles = (...styles: React.CSSProperties[]): React.CSSProperties => {
  return Object.assign({}, ...styles);
};
