import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { theme } from '../constants/theme';
import GARDENER_ICON from '../assets/images/unnamed.png';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(0)).current;
  const [isHidden, setIsHidden] = useState(false);

  // 👇 if your tab bar is 56 tall + bottom offset, hiding by ~120 is safe
  const HIDE_DISTANCE = 140;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = () => {
      setIsHidden(true);
      Animated.timing(translateY, {
        toValue: HIDE_DISTANCE,
        duration: Platform.OS === 'ios' ? 220 : 160,
        useNativeDriver: true,
      }).start();
    };

    const onHide = () => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? 220 : 160,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsHidden(false);
      });
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [translateY]);

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

  const getAccessibilityLabel = (routeName: string, isFocused: boolean): string => {
    const labels: Record<string, string> = {
      gardener: 'Gardener Dating Coach',
      matches: 'Matches and Messages',
      index: 'Discover Profiles',
      chat: 'Chat Messages',
      two: 'Your Profile',
    };
    return `${labels[routeName] || routeName}${isFocused ? ', selected' : ''}`;
  };

  const bottomOffset =
    Platform.OS === 'ios' ? (insets.bottom > 0 ? insets.bottom : 20) : Math.max(insets.bottom, 10);

  return (
    <Animated.View
      pointerEvents={isHidden ? 'none' : 'auto'} // ✅ no ghost taps while hidden
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          bottom: bottomOffset,
          opacity: isHidden ? 0 : 1, // ✅ helps on Android (optional but nice)
        },
      ]}
    >
      {/* Ultra Transparent Liquid Glass with Chromatic Aberration */}
      <View style={styles.chromaticContainer}>
        <View style={[styles.blurContainer, styles.redChannel]}>
          <BlurView intensity={30} tint="light" style={styles.blurView}>
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,0,50,0.01)' }]}
            />
          </BlurView>
        </View>

        <View style={[styles.blurContainer, styles.blueChannel]}>
          <BlurView intensity={30} tint="light" style={styles.blurView}>
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,50,255,0.01)' }]}
            />
          </BlurView>
        </View>

        <View style={styles.blurContainer}>
          <BlurView intensity={40} tint="light" style={styles.blurView}>
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
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={getAccessibilityLabel(route.name, isFocused)}
              accessibilityHint={`Navigate to ${route.name} screen`}
              testID={(options as any).tabBarTestID as string | undefined}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={styles.iconContainer}>
                {route.name === 'gardener' ? (
                  <Image
                    source={GARDENER_ICON}
                    style={[
                      styles.customIcon,
                      { tintColor: isFocused ? theme.colors.primary : '#666' },
                      isFocused && styles.iconFocused,
                    ]}
                  />
                ) : (
                  <FontAwesome
                    name={getIconName(route.name) as any}
                    size={24}
                    color={isFocused ? theme.colors.primary : '#666'}
                    style={isFocused ? styles.iconFocused : undefined}
                  />
                )}
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
    backgroundColor: theme.colors.primary,
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
    backgroundColor: Platform.OS === 'android' ? 'rgba(240, 240, 245, 0.95)' : 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 28,
    borderWidth: 0.5,
    height: 56,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    ...(Platform.OS === 'android' && { elevation: 8 }),
  },
  blurView: { flex: 1 },
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
  customIcon: { height: 24, width: 24 },
  edgeHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    height: 1,
    left: 20,
    position: 'absolute',
    right: 20,
    top: 0,
  },
  iconContainer: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconFocused: { transform: [{ scale: 1.1 }] },
  redChannel: {
    opacity: 0.15,
    transform: [{ translateX: -1 }, { translateY: -0.5 }],
    zIndex: 1,
  },
  tab: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'center' },
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
