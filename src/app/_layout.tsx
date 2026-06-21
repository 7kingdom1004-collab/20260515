import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { UserProvider } from '@/context/user-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="auth/callback" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="product-chat" />
          <Stack.Screen name="location" />
          <Stack.Screen name="search" />
          <Stack.Screen name="write" />
        </Stack>
      </UserProvider>
    </ThemeProvider>
  );
}
