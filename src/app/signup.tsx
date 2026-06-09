import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    // users 테이블에 데이터 저장
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          name,
          tier: 'free',
          role: 'user',
        },
      ]);

    if (insertError) {
      setError('사용자 정보 저장에 실패했습니다.');
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>회원가입</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <TextInput
            placeholder="이름"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: theme.text }]}
          />
          <View style={[styles.inputDivider, { backgroundColor: theme.border }]} />
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
            placeholder="비밀번호를 입력해주세요."
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { color: theme.text }]}
          />
          <View style={[styles.inputDivider, { backgroundColor: theme.border }]} />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <TextInput
            placeholder="비밀번호를 다시 입력해주세요."
            placeholderTextColor={theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={[styles.input, { color: theme.text }]}
          />
          <View style={[styles.inputDivider, { backgroundColor: theme.border }]} />
        </View>

        {/* Error Message */}
        {error ? (
          <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
        ) : null}

        <View style={{ height: 24 }} />

        {/* Signup Button */}
        <Pressable
          onPress={handleSignup}
          disabled={loading}
          style={[styles.signupButton, { backgroundColor: theme.primary, opacity: loading ? 0.6 : 1 }]}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signupButtonText}>가입하기</Text>
          )}
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
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.two,
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
  signupButton: {
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginHorizontal: Spacing.three,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
