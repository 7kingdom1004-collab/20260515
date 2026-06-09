import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const POSTS = [
  {
    id: '1',
    title: '동네에서 좋은 카페 추천받습니다!',
    author: '김민지',
    timeAgo: '2시간 전',
    comments: 12,
  },
  {
    id: '2',
    title: '이 근처 아무도 초등학교 좋은지 아세요?',
    author: '박철수',
    timeAgo: '5시간 전',
    comments: 8,
  },
  {
    id: '3',
    title: '주말에 공원에서 만나요!',
    author: '이영희',
    timeAgo: '1일 전',
    comments: 23,
  },
];

export default function CommunityScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>커뮤니티</Text>
      </View>

      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={[styles.postCard, { borderBottomColor: theme.border }]}>
            <View style={styles.postContent}>
              <Text style={[styles.postTitle, { color: theme.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.postMeta}>
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.author}</Text>
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>·</Text>
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.timeAgo}</Text>
              </View>
            </View>
            <View style={styles.commentBadge}>
              <Text style={[styles.commentCount, { color: theme.primary }]}>{item.comments}</Text>
            </View>
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
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  postContent: {
    flex: 1,
    gap: Spacing.one,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  commentBadge: {
    marginLeft: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 12,
  },
  commentCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
