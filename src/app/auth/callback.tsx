import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-theme';

export default function AuthCallback() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ code?: string }>();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = Array.isArray(params.code) ? params.code[0] : params.code;

    if (code) {
      // Android path: deep link으로 code가 파라미터로 넘어옴
      // 전체 URL을 재구성해서 exchangeCodeForSession 호출
      const allParams = Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      ) as Record<string, string>;
      const baseUrl = Linking.createURL('auth/callback');
      const qs = new URLSearchParams(allParams).toString();
      const fullUrl = `${baseUrl}?${qs}`;

      console.log('[OAuth callback] Exchanging code for session with URL:', fullUrl);
      supabase.auth.exchangeCodeForSession(fullUrl).then(({ data, error: exchangeError }) => {
        if (!exchangeError && data.session) {
          console.log('[OAuth callback] Session created successfully');
          router.replace('/');
        } else {
          console.error('[OAuth callback] exchangeCodeForSession failed:', exchangeError);
          setError(exchangeError?.message || '인증에 실패했습니다.');
        }
      });
      return;
    }

    // iOS fallback path: login.tsx가 이미 session을 설정했거나 대기
    console.log('[OAuth callback] Waiting for session...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        console.log('[OAuth callback] Session detected via onAuthStateChange');
        subscription.unsubscribe();
        router.replace('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[OAuth callback] Session already exists');
        subscription.unsubscribe();
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [params.code]);

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <Text style={[styles.errorTitle, { color: '#FF3B30' }]}>인증 실패</Text>
          <Text style={[styles.errorMessage, { color: theme.text }]}>{error}</Text>
          <Pressable
            onPress={() => router.replace('/login')}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.buttonText}>로그인 화면으로</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
