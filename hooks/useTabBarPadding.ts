import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VISUAL_BAR_HEIGHT } from '../components/CustomTabBar';

/**
 * Returns the bottom padding needed for scrollable content inside tab screens
 * so the last item clears the floating tab bar pill.
 *
 * Formula: pill height (56) + safe-area bottom + 20 breathing room.
 */
export const useTabBarPadding = () => {
  const insets = useSafeAreaInsets();
  const tabBarPadding = VISUAL_BAR_HEIGHT + insets.bottom + 20;
  return { tabBarPadding };
};
