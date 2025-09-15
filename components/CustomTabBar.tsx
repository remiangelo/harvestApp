import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;

  // Store the last scroll position
  const lastScrollY = useRef(0);
  const isScrollingDown = useRef(false);

  // Function to show/hide tab bar
  const animateTabBar = (show: boolean) => {
    Animated.spring(translateY, {
      toValue: show ? 0 : 120,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  // Listen for scroll events from all screens - but keep tab bar always visible for now
  useEffect(() => {
    const handleScroll = (scrollY: number) => {
      // Keep tab bar always visible - don't hide on scroll
      // This fixes the issue where the tab bar disappears and doesn't come back
      return;

      /* Original scroll hiding logic - disabled for now
      const diff = scrollY - lastScrollY.current;

      if (Math.abs(diff) < 5) return; // Ignore small scroll differences

      if (diff > 0 && !isScrollingDown.current) {
        // Scrolling down - hide tab bar
        isScrollingDown.current = true;
        animateTabBar(false);
      } else if (diff < 0 && isScrollingDown.current) {
        // Scrolling up - show tab bar
        isScrollingDown.current = false;
        animateTabBar(true);
      }

      lastScrollY.current = scrollY;
      */
    };

    // Export function for screens to call
    (global as any).handleTabBarScroll = handleScroll;

    return () => {
      delete (global as any).handleTabBarScroll;
    };
  }, []);

  const getIconName = (routeName: string): string => {
    switch (routeName) {
      case 'gardener':
        return 'graduation-cap';
      case 'matches':
        return 'heart';
      case 'index':
        return 'compass';
      case 'chat':
        return 'comments';
      case 'two':
        return 'user';
      default:
        return 'circle';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          bottom: insets.bottom > 0 ? insets.bottom : 20,
        },
      ]}
    >
      {/* Ultra Transparent Liquid Glass with Chromatic Aberration */}
      <View style={styles.chromaticContainer}>
        {/* Red channel offset - very subtle */}
        <View style={[styles.blurContainer, styles.redChannel]}>
          <BlurView intensity={30} tint="light" style={styles.blurView}>
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,0,50,0.01)' }]}
            />
          </BlurView>
        </View>

        {/* Blue channel offset - very subtle */}
        <View style={[styles.blurContainer, styles.blueChannel]}>
          <BlurView intensity={30} tint="light" style={styles.blurView}>
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,50,255,0.01)' }]}
            />
          </BlurView>
        </View>

        {/* Main glass layer - ultra transparent */}
        <View style={styles.blurContainer}>
          <BlurView intensity={40} tint="light" style={styles.blurView}>
            {/* Very subtle glass tint */}
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.08)',
                'rgba(250,250,252,0.05)',
                'rgba(255,255,255,0.06)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Ultra subtle prismatic edge */}
            <LinearGradient
              colors={[
                'rgba(255,100,150,0.02)',
                'rgba(100,150,255,0.01)',
                'rgba(150,255,100,0.02)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Very subtle top edge highlight */}
            <View style={styles.edgeHighlight} />
          </BlurView>
        </View>
      </View>

      {/* Tab Icons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID as string | undefined}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={styles.iconContainer}>
                <FontAwesome
                  name={getIconName(route.name) as any}
                  size={24}
                  color={isFocused ? '#A0354E' : '#666'}
                  style={isFocused ? styles.iconFocused : undefined}
                />
                {isFocused && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    backgroundColor: '#A0354E',
    borderRadius: 2,
    bottom: -8,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  blueChannel: {
    opacity: 0.15,
    transform: [{ translateX: 1 }, { translateY: 0.5 }],
    zIndex: 2,
  },
  blurContainer: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(240, 240, 245, 0.8)' : 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 28,
    borderWidth: 0.5,
    height: 56,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  blurView: {
    flex: 1,
  },
  chromaticContainer: {
    elevation: 8,
    height: 56,
    marginHorizontal: 25,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  container: {
    height: 56,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 100,
  },
  edgeHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    height: 1,
    left: 20,
    position: 'absolute',
    right: 20,
    top: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
  redChannel: {
    opacity: 0.15,
    transform: [{ translateX: -1 }, { translateY: -0.5 }],
    zIndex: 1,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  tabsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-around',
    left: 0,
    paddingHorizontal: 25,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
