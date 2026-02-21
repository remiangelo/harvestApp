import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import { useClientOnlyValue } from '../../components/useClientOnlyValue';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { CustomTabBar } from '../../components/CustomTabBar';
import { theme } from '../../constants/theme';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <ErrorBoundary>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.primary,
          tabBarShowLabel: false,
          sceneStyle: { backgroundColor: '#F8F8F8', overflow: 'visible' },
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
        }}
      >
        <Tabs.Screen
          name="tips"
          options={{
            title: 'Tips',
            tabBarIcon: ({ color }) => <TabBarIcon name="lightbulb-o" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            title: 'Match',
            tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="gardener"
          options={{
            title: 'Gardener',
            tabBarIcon: ({ color }) => <TabBarIcon name="leaf" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
            headerShown: false,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}
