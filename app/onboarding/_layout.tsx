import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="age" options={{ headerShown: false }} />
      <Stack.Screen name="preferences" options={{ headerShown: false }} />
      <Stack.Screen name="bio" options={{ headerShown: false }} />
      <Stack.Screen name="nickname" options={{ headerShown: false }} />
      <Stack.Screen name="photos" options={{ headerShown: false }} />
      <Stack.Screen name="hobbies" options={{ headerShown: false }} />
      <Stack.Screen name="distance" options={{ headerShown: false }} />
      <Stack.Screen name="goals" options={{ headerShown: false }} />
      <Stack.Screen name="gender" options={{ headerShown: false }} />
      <Stack.Screen name="location" options={{ headerShown: false }} />
    </Stack>
  );
} 