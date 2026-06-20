import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();

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

      supabase.auth.exchangeCodeForSession(fullUrl).then(({ data, error }) => {
        if (!error && data.session) {
          router.replace('/');
        }
      });
      return;
    }

    // iOS fallback path: login.tsx가 이미 session을 설정했거나 대기
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        subscription.unsubscribe();
        router.replace('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [params.code]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
