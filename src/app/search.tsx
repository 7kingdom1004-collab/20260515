import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const RECENT_SEARCHES = ['아이폰', '맥북', '카메라', '헤드폰', '자전거'];

export default function SearchScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <View style={[styles.searchInput, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="검색"
            placeholderTextColor={theme.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.input, { color: theme.text }]}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>최근 검색어</Text>
        <View style={styles.searchList}>
          {RECENT_SEARCHES.map((item, idx) => (
            <Pressable
              key={idx}
              style={[styles.searchItem, { borderBottomColor: theme.border }]}
              onPress={() => setSearchText(item)}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.searchItemText, { color: theme.text }]}>{item}</Text>
              <Ionicons name="close" size={16} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
    borderWidth: 1,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.three,
  },
  searchList: {
    gap: 0,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: 1,
  },
  searchItemText: {
    flex: 1,
    fontSize: 14,
  },
});
