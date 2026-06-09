import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const CHATS = [
  {
    id: '1',
    name: '김상민',
    lastMessage: '혹시 아직 있나요?',
    timeAgo: '1시간 전',
    unread: 2,
  },
  {
    id: '2',
    name: '이준호',
    lastMessage: '네 지금 보낼게요',
    timeAgo: '3시간 전',
    unread: 0,
  },
  {
    id: '3',
    name: '박지현',
    lastMessage: '감사합니다!',
    timeAgo: '1일 전',
    unread: 0,
  },
];

export default function ChatScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>채팅</Text>
      </View>

      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={[styles.chatItem, { borderBottomColor: theme.border }]}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.backgroundElement,
                },
              ]}>
              <Ionicons name="person-circle" size={40} color={theme.textSecondary} />
            </View>

            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.timeAgo, { color: theme.textSecondary }]}>{item.timeAgo}</Text>
              </View>
              <Text style={[styles.lastMessage, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>

            {item.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </Pressable>
        )}
        ListFooterComponent={<View style={{ height: Spacing.four }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 13,
  },
  unreadBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
