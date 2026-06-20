import { Stack, useRouter } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as Linking from 'expo-linking';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { UserProvider } from '@/context/user-context';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // 앱이 이미 실행 중일 때 딥링크 수신
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (url.includes('auth/callback')) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (!error) router.replace('/');
      }
    });

    // 앱이 닫혀 있다가 딥링크로 열렸을 때
    Linking.getInitialURL().then(async (url) => {
      if (url && url.includes('auth/callback')) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (!error) router.replace('/');
      }
    });

    return () => subscription.remove();
  }, [router]);
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
