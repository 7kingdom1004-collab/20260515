import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useUser } from '@/context/user-context';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || scheme == null ? 'light' : scheme];
  const { userRole } = useUser();
  const isAdmin = userRole === 'admin';

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      tintColor={colors.primary}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="home-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="home" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Label>커뮤니티</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="people-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="people" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Label>채팅</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="chatbubble-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="chatbubble" />,
          }}
        />
      </NativeTabs.Trigger>

      {isAdmin && <NativeTabs.Trigger name="admin">
        <NativeTabs.Trigger.Label>관리자</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="shield-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="shield" />,
          }}
        />
      </NativeTabs.Trigger>}

      <NativeTabs.Trigger name="my">
        <NativeTabs.Trigger.Label>나의 당근</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={{
            default: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="person-outline" />,
            selected: <NativeTabs.Trigger.VectorIcon family={Ionicons} name="person" />,
          }}
        />
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
