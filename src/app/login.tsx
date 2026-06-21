import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (loginError) {
      if (loginError.message === 'Email not confirmed') {
        setError('이메일 인증이 필요합니다. 다시 가입해주세요.');
      } else if (loginError.message === 'Invalid login credentials') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError(loginError.message);
      }
      return;
    }

    router.replace('/');
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError('');

    // 진단 로그
    console.log('[OAuth Debug] Platform.OS:', Platform.OS);
    if (Platform.OS === 'web') {
      console.log('[OAuth Debug] window.location.origin:', window.location.origin);
    }
    const testLink = Linking.createURL('auth/callback');
    console.log('[OAuth Debug] Linking.createURL result:', testLink);

    if (Platform.OS === 'web') {
      const origin = window.location.origin;
      console.log('[OAuth Debug] Web redirectTo:', `${origin}/auth/callback`);

      // localhost이면 모바일에서 접근 불가
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        const errorMsg = 'localhost에서는 모바일에서 로그인할 수 없습니다.\n\n해결방법:\n1. EAS 빌드 APK 사용하기\n2. 또는 개발 서버 IP(192.168.x.x:8081)로 접속하기';
        console.warn('[OAuth Debug] localhost 감지 -', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        setError('Google 로그인에 실패했습니다.');
        setLoading(false);
      }
      return;
    }

    const redirectUrl = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('[OAuth] signInWithOAuth error:', error.message, error);
      setError(`Google 로그인 오류: ${error.message}\n\nSupabase Google Provider 설정을 확인하세요.`);
      setLoading(false);
      return;
    }

    if (!data.url) {
      console.error('[OAuth] No URL returned - Supabase Google provider 설정 확인 필요');
      setError('Google 로그인을 시작할 수 없습니다.\nSupabase Dashboard에서 Google Provider를 활성화했는지 확인하세요.');
      setLoading(false);
      return;
    }

    console.log('[OAuth] Starting WebBrowser.openAuthSessionAsync with URL:', data.url);
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    console.log('[OAuth] WebBrowser result:', result.type);

    if (result.type === 'success') {
      console.log('[OAuth] Got code, exchanging for session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (!sessionError && sessionData.user) {
        console.log('[OAuth] Session created successfully:', sessionData.user.email);
        router.replace('/');
      } else {
        console.error('[OAuth] exchangeCodeForSession error:', sessionError);
        setError(`세션 처리 실패: ${sessionError?.message || '알 수 없는 오류'}`);
      }
    } else if (result.type === 'cancel' || result.type === 'dismiss') {
      console.warn('[OAuth] User canceled or WebBrowser dismissed');
      setError(
        result.type === 'dismiss'
          ? '구글 인증이 완료되지 않았습니다.\n\n새 APK가 설치되어 있는지 확인하세요.\n(carrot:// scheme 등록 필요)\n\n명령어:\neas build --profile preview --platform android\n또는\nnpx expo run:android'
          : '구글 로그인을 취소했습니다.'
      );
    } else {
      console.error('[OAuth] Unexpected result type:', result);
      setError('Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>로그인</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image source={require('@/assets/images/carrot.png')} style={styles.logo} />
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.text }]}>당신의 계정으로 로그인하세요</Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <TextInput
            placeholder="이메일"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={[styles.input, { color: theme.text }]}
          />
          <View style={[styles.inputDivider, { backgroundColor: theme.border }]} />
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <TextInput
            placeholder="비밀번호"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { color: theme.text }]}
          />
          <View style={[styles.inputDivider, { backgroundColor: theme.border }]} />
        </View>

        {/* Error Message */}
        {error ? (
          <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
        ) : null}

        <View style={{ height: 32 }} />

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[styles.loginButton, { backgroundColor: theme.primary, opacity: loading ? 0.6 : 1 }]}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>로그인</Text>
          )}
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textSecondary }]}>또는</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        {/* Google Login Button */}
        <Pressable
          onPress={signInWithGoogle}
          disabled={loading}
          style={[styles.googleButton, { opacity: loading ? 0.6 : 1 }]}>
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={18} color="#4285F4" />
          </View>
          <Text style={styles.googleButtonText}>Google로 로그인</Text>
        </Pressable>

        <View style={{ height: 40 }} />

        {/* Signup Link */}
        <View style={styles.signupSection}>
          <Text style={[styles.signupText, { color: theme.text }]}>계정이 없으신가요? </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={[styles.signupLink, { color: theme.primary }]}>회원가입</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />

        {/* Browse without login */}
        <Pressable onPress={() => router.replace('/')}>
          <Text style={[styles.browseText, { color: theme.textSecondary }]}>로그인 없이 둘러보기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  titleSection: {
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  input: {
    fontSize: 16,
    paddingVertical: Spacing.two,
    paddingHorizontal: 0,
  },
  inputDivider: {
    height: 1,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.one,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginHorizontal: Spacing.three,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    fontWeight: '400',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  browseText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.two,
    fontSize: 13,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dadce0',
    marginHorizontal: Spacing.three,
    overflow: 'hidden',
  },
  googleIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#3c4043',
    letterSpacing: 0.25,
    paddingRight: 40,
  },
});
