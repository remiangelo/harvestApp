import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const theme = {
  colors: {
    // Primary colors
    primary: '#A0354E', // Maroon/burgundy - main brand color
    primaryDark: '#7D2A3D', // Darker variant for pressed states
    primaryLight: '#C4566B', // Lighter variant

    // Secondary colors
    secondary: '#F5E6D3', // Cream/beige - app icon background
    secondaryDark: '#E8D4BA',
    secondaryLight: '#FFF9F2',

    // Base colors
    background: '#FFFFFF',
    surface: '#FFFFFF',

    // Text colors
    text: {
      primary: '#2C2C2C', // Dark charcoal
      secondary: '#666666', // Medium gray
      tertiary: '#999999', // Light gray
      inverse: '#FFFFFF',
    },

    // Semantic colors
    error: '#DC2626',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',

    // UI colors
    border: '#E5E5E5',
    divider: '#F0F0F0',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Special colors for features
    like: '#10B981', // Green for like
    nope: '#DC2626', // Red for nope
    superLike: '#3B82F6', // Blue for super like

    // Gradients
    gradients: {
      profileCard: ['#E8B4F3', '#F3B4E8'], // Purple-pink gradient
      primary: ['#A0354E', '#C4566B'],
      overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'],
    },
  },

  typography: {
    // Font families (using system fonts for now)
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },

    // Font sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
    },

    // Font weights
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Text styles (pre-composed)
    headers: {
      h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 1.4,
      },
    },

    body: {
      large: {
        fontSize: 18,
        fontWeight: '400' as const,
        lineHeight: 1.5,
      },
      regular: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 1.5,
      },
      small: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 1.4,
      },
    },
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  layout: {
    screenWidth,
    screenHeight,
    containerPadding: 16,
    cardMargin: 8,
  },

  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
  },
} as const;

// Helper function to get gradient style
export const getGradient = (colors: string[]) => ({
  colors,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});

// Export type for TypeScript
export type Theme = typeof theme;
