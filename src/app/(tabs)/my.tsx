import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { useUser } from '@/context/user-context';
import { supabase } from '@/lib/supabase';

const MENU_ITEMS = [
  { id: '1', icon: 'receipt-outline', label: '나의 거래' },
  { id: '2', icon: 'heart-outline', label: '관심목록' },
  { id: '3', icon: 'star-outline', label: '내 후기' },
  { id: '4', icon: 'settings-outline', label: '설정' },
  { id: '5', icon: 'help-circle-outline', label: '도움말' },
];

export default function MyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { userName, userRole, userTier } = useUser();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>나의 당근</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.push('/login')}>
          <View style={[styles.profileCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.border }]}>
            <Ionicons name="person-circle" size={56} color={theme.text} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>{userName || '사용자'}</Text>
            <View style={styles.profileStatusContainer}>
              <Text style={[styles.profileRole, { color: theme.primary }]}>
                {userRole === 'admin' ? '👑 관리자' : '일반유저'}
              </Text>
              <Text style={[styles.profileTier, { color: theme.textSecondary }]}>
                {userTier === 'premium' ? '유료회원' : '무료회원'}
              </Text>
            </View>
            <Text style={[styles.profileLocation, { color: theme.textSecondary }]}>논현2동</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={[styles.ratingText, { color: theme.text }]}>4.8</Text>
              <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>(23)</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
          </View>
        </Pressable>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>판매 중</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>5</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>관심 목록</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>8</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>판매 완료</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.menuItem, { borderBottomColor: theme.border }]}>
              <Ionicons name={item.icon as any} size={20} color={theme.text} />
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          }}
          style={[styles.logoutButton, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  adminButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
    borderWidth: 1,
  },
  adminButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.four,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.three,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileTier: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileLocation: {
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  menuSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: undefined,
    borderBottomColor: undefined,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: Spacing.three,
    borderBottomWidth: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: Spacing.three,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: Spacing.three,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
