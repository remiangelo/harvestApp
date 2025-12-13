import { Dimensions } from 'react-native';

// Note: These are static dimensions at module load time.
// For dynamic/responsive layouts (Android rotation, split screen, etc.),
// use the useWindowDimensions() hook directly in your components.
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const theme = {
  colors: {
    // Primary colors - Rose Pink Red
    primary: '#EB1E66', // Rose pink red - main brand color (headlines, logo, buttons)
    primaryDark: '#C91854', // Darker variant for pressed states
    primaryLight: '#F04D85', // Lighter variant
    primaryMuted: '#D41A5C', // Slightly darker muted variant
    primarySoft: 'rgba(235, 30, 102, 0.15)', // 15% opacity for subtle backgrounds

    // Accent colors
    accent: '#27CF8A', // Bright green - primary accents
    accentLight: '#4EDBA0', // Lighter green
    accentDark: '#1FB076', // Darker green
    accentSoft: 'rgba(39, 207, 138, 0.15)', // 15% opacity

    // Soft blue - minimal accent use
    softBlue: '#D1E9F6',
    softBlueDark: '#A8D4EC',
    softBlueLight: '#E5F3FA',

    // Secondary colors (legacy support)
    secondary: '#F5E6D3', // Cream/beige - app icon background
    secondaryDark: '#E8D4BA',
    secondaryLight: '#FFF9F2',

    // Base colors
    background: '#FFFFFF', // White - main content background
    surface: '#FFFFFF',

    // Text colors
    text: {
      primary: '#000000', // Black - main text color
      secondary: '#666666', // Medium gray
      tertiary: '#999999', // Light gray
      inverse: '#FFFFFF',
    },

    // Semantic colors
    error: '#DC2626',
    success: '#27CF8A', // Using accent green for success
    warning: '#F59E0B',
    info: '#3B82F6',

    // UI colors
    border: '#E5E5E5',
    divider: '#F0F0F0',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Special colors for features
    like: '#27CF8A', // Bright green for like
    nope: '#DC2626', // Red for nope
    superLike: '#EB1E66', // Rose pink for super like

    // Complementary accent colors
    dustyPink: '#F04D85', // Softer rose accent
    mutedGold: '#B8956A', // Earthy complement
    sageGreen: '#27CF8A', // Bright green

    // Gradients
    gradients: {
      profileCard: ['#EB1E66', '#F04D85'], // Rose pink gradient
      primary: ['#EB1E66', '#F04D85'],
      overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'],
    },
  },

  typography: {
    // Font families - DM Sans for body, DM Serif Display for headings, Orange Squash for logo
    fontFamily: {
      // Body text fonts (DM Sans)
      regular: 'DMSans_400Regular',
      medium: 'DMSans_500Medium',
      bold: 'DMSans_700Bold',

      // Display/heading font (DM Serif Display)
      display: 'DMSerifDisplay_400Regular',

      // Logo font (Orange Squash)
      logo: 'OrangeSquash',
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
        fontFamily: 'DMSerifDisplay_400Regular',
        fontSize: 28,
        fontWeight: '400' as const,
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: 'DMSerifDisplay_400Regular',
        fontSize: 24,
        fontWeight: '400' as const,
        lineHeight: 1.3,
      },
      h3: {
        fontFamily: 'DMSerifDisplay_400Regular',
        fontSize: 20,
        fontWeight: '400' as const,
        lineHeight: 1.4,
      },
      h4: {
        fontFamily: 'DMSerifDisplay_400Regular',
        fontSize: 18,
        fontWeight: '400' as const,
        lineHeight: 1.4,
      },
    },

    body: {
      large: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 18,
        fontWeight: '400' as const,
        lineHeight: 1.5,
      },
      regular: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 1.5,
      },
      small: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 1.5,
      },
      caption: {
        fontFamily: 'DMSans_400Regular',
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
