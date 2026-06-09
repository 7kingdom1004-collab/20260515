import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, TabList, TabSlot, TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || scheme == null ? 'light' : scheme];

  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <View style={StyleSheet.flatten([styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }])}>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home-outline" activeIcon="home" label="홈" scheme={scheme} />
          </TabTrigger>
          <TabTrigger name="community" href="/community" asChild>
            <TabButton icon="people-outline" activeIcon="people" label="커뮤니티" scheme={scheme} />
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton icon="chatbubble-outline" activeIcon="chatbubble" label="채팅" scheme={scheme} />
          </TabTrigger>
          <TabTrigger name="admin" href="/admin" asChild>
            <TabButton icon="shield-outline" activeIcon="shield" label="관리자" scheme={scheme} />
          </TabTrigger>
          <TabTrigger name="my" href="/my" asChild>
            <TabButton icon="person-outline" activeIcon="person" label="나의 당근" scheme={scheme} />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  icon,
  activeIcon,
  label,
  scheme,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: string; activeIcon: string; label: string; scheme: string | null | undefined }) {
  const colorScheme = scheme === 'unspecified' || scheme == null ? 'light' : (scheme as 'light' | 'dark');
  const colors = Colors[colorScheme];
  const iconName = isFocused ? activeIcon : icon;
  const color = isFocused ? colors.primary : colors.textSecondary;

  return (
    <Pressable {...props} style={styles.tabButton}>
      <Ionicons name={iconName as any} size={24} color={color} />
      <Text style={StyleSheet.flatten([styles.tabLabel, { color }])}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
