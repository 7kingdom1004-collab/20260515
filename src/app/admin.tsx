import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium';
  role: string;
}

export default function AdminScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (data?.role !== 'admin') {
          Alert.alert('접근 거부', '관리자만 접근 가능합니다.');
          router.back();
          return;
        }
        setUserRole(data.role);
      }
    };

    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setUsers(data as User[]);
      }
      setLoading(false);
    };

    checkAdminAccess();
    fetchUsers();
  }, [router]);

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const changeTier = async (userId: string, newTier: 'free' | 'premium') => {
    const { error } = await supabase
      .from('users')
      .update({ tier: newTier })
      .eq('id', userId);

    if (!error) {
      Alert.alert('성공', `회원 등급이 변경되었습니다.`);
      setLoading(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setUsers(data as User[]);
      }
      setLoading(false);
    } else {
      Alert.alert('오류', '등급 변경에 실패했습니다.');
    }
  };

  const changeTierForSelected = async (newTier: 'free' | 'premium') => {
    if (selectedUsers.size === 0) {
      Alert.alert('알림', '선택된 회원이 없습니다.');
      return;
    }

    setLoading(true);
    for (const userId of selectedUsers) {
      await supabase
        .from('users')
        .update({ tier: newTier })
        .eq('id', userId);
    }

    Alert.alert('성공', `${selectedUsers.size}명의 회원 등급이 변경되었습니다.`);
    setSelectedUsers(new Set());

    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setUsers(data as User[]);
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>관리자 페이지</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Bulk Actions */}
      <View style={[styles.bulkActionsContainer, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
        <Pressable style={[styles.selectAllButton, { borderColor: theme.border, borderWidth: 1 }]} onPress={toggleSelectAll}>
          <Ionicons name={selectedUsers.size === users.length ? 'checkbox' : 'checkbox-outline'} size={20} color={theme.primary} />
          <Text style={[styles.selectAllText, { color: theme.text }]}>전체선택</Text>
        </Pressable>
        <Pressable
          style={[styles.bulkButton, { backgroundColor: '#4A90E2', opacity: selectedUsers.size > 0 ? 1 : 0.5 }]}
          onPress={() => changeTierForSelected('premium')}
          disabled={selectedUsers.size === 0}>
          <Text style={styles.bulkButtonText}>{selectedUsers.size > 0 ? `✓${selectedUsers.size}명 - 유료로` : '선택 후 유료로'}</Text>
        </Pressable>
        <Pressable
          style={[styles.bulkButton, { backgroundColor: '#FF6B6B', opacity: selectedUsers.size > 0 ? 1 : 0.5 }]}
          onPress={() => changeTierForSelected('free')}
          disabled={selectedUsers.size === 0}>
          <Text style={styles.bulkButtonText}>{selectedUsers.size > 0 ? `✓${selectedUsers.size}명 - 무료로` : '선택 후 무료로'}</Text>
        </Pressable>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>회원이 없습니다.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {users.map(user => (
            <View key={user.id} style={[styles.userCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Pressable style={styles.checkbox} onPress={() => toggleUserSelection(user.id)}>
                <Ionicons
                  name={selectedUsers.has(user.id) ? 'checkbox' : 'checkbox-outline'}
                  size={24}
                  color={selectedUsers.has(user.id) ? theme.primary : theme.textSecondary}
                />
              </Pressable>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                <View style={styles.userDetailsRow}>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
                  <Text style={[styles.separator, { color: theme.textSecondary }]}>│</Text>
                  <Text style={[styles.tierBadgeText, { color: user.tier === 'premium' ? theme.primary : theme.textSecondary }]}>
                    {user.tier === 'premium' ? '⭐ 유료 회원' : '무료 회원'}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                {user.tier === 'free' ? (
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => changeTier(user.id, 'premium')}>
                    <Text style={styles.actionButtonText}>유료로</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: theme.textSecondary }]}
                    onPress={() => changeTier(user.id, 'free')}>
                    <Text style={styles.actionButtonText}>무료로</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
          <View style={[styles.bottomStats, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
            <View style={styles.bottomStatsRow}>
              <View style={styles.bottomStatItem}>
                <Text style={[styles.bottomStatsLabel, { color: theme.text }]}>유료회원</Text>
                <Text style={[styles.bottomStatsValue, { color: theme.primary }]}>{users.filter(u => u.tier === 'premium').length}</Text>
              </View>
              <Text style={[styles.bottomStatsDivider, { color: theme.border }]}>│</Text>
              <View style={styles.bottomStatItem}>
                <Text style={[styles.bottomStatsLabel, { color: theme.text }]}>무료회원</Text>
                <Text style={[styles.bottomStatsValue, { color: theme.text }]}>{users.filter(u => u.tier === 'free').length}</Text>
              </View>
              <Text style={[styles.bottomStatsDivider, { color: theme.border }]}>│</Text>
              <View style={styles.bottomStatItem}>
                <Text style={[styles.bottomStatsLabel, { color: theme.text }]}>총 인원</Text>
                <Text style={[styles.bottomStatsValue, { color: theme.text }]}>{users.length}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
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
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.2,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.one,
    alignItems: 'center',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bulkButton: {
    flex: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
  },
  bulkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkbox: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  userInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
  },
  userDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    fontSize: 12,
  },
  tierBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    gap: Spacing.one,
  },
  actionButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomStats: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    marginTop: Spacing.two,
  },
  bottomStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  bottomStatsLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '700',
  },
  bottomStatsValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomStatsDivider: {
    fontSize: 12,
    marginHorizontal: 8,
    opacity: 0.3,
  },
});
