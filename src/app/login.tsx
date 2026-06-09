import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

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

        <View style={{ height: 40 }} />

        {/* Signup Link */}
        <View style={styles.signupSection}>
          <Text style={[styles.signupText, { color: theme.text }]}>계정이 없으신가요? </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={[styles.signupLink, { color: theme.primary }]}>회원가입</Text>
          </Pressable>
        </View>
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
});
