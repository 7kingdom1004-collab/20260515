import { Stack, useRouter } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Linking, Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { UserProvider } from '@/context/user-context';
import { supabase } from '@/lib/supabase';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const authProcessing = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handleAuthUrl = async (url: string) => {
      if (!url.includes('auth/callback') || !url.includes('code=')) return;
      if (authProcessing.current) return;
      authProcessing.current = true;

      const { data, error } = await supabase.auth.exchangeCodeForSession(url);
      authProcessing.current = false;

      if (!error && data.session) {
        router.replace('/');
      }
    };

    // 앱이 딥링크로 실행된 경우 (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthUrl(url);
    });

    // 앱이 실행 중일 때 딥링크 수신
    const subscription = Linking.addEventListener('url', ({ url }) => handleAuthUrl(url));
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

export default function RootLayout() {
  return <RootLayoutContent />;
}
