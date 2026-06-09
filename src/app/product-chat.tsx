import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PRODUCT_DETAILS } from '@/data/products';

export default function ProductChatScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  const product = productId ? PRODUCT_DETAILS[productId] : null;

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 24 }}>
          상품을 찾을 수 없습니다.
        </Text>
      </SafeAreaView>
    );
  }

  const isHeavy = product.isHeavy ?? false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.push(`/product/${productId}`)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.sellerNameRow}>
            <Text style={[styles.sellerName, { color: theme.text }]}>
              {product.sellerName}
            </Text>
            <View style={[styles.tempBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.tempText}>{product.temperature}°C</Text>
            </View>
          </View>
          <Text style={[styles.responseTime, { color: theme.textSecondary }]}>
            {product.sellerLocation} · 보통 10분 이내 응답
          </Text>
        </View>
        <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
        </Pressable>
      </View>

      {/* Product Info Bar */}
      <Pressable
        onPress={() => router.push(`/product/${productId}`)}
        style={[styles.productBar, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
        <View style={[styles.productThumb, { backgroundColor: product.thumbnailColor }]} />
        <View style={styles.productInfo}>
          <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={1}>
            판매중 {product.title}
          </Text>
          <Text style={[styles.productPrice, { color: theme.text }]}>
            {product.price}
          </Text>
          <Text style={[styles.priceNote, { color: theme.textSecondary }]}>
            (가격 제안 불가)
          </Text>
        </View>
      </Pressable>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { borderBottomColor: theme.border }]}>
        <Pressable style={[styles.actionBtn, { borderColor: theme.border }]}>
          <Text style={[styles.actionBtnText, { color: theme.text }]}>⓪ 당근페이</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, { borderColor: theme.border }]}>
          <Text style={[styles.actionBtnText, { color: theme.text }]}>⊕ 물품추가</Text>
        </Pressable>
        <Pressable
          style={[
            styles.actionBtn,
            {
              borderColor: isHeavy ? theme.primary : theme.border,
              backgroundColor: isHeavy ? theme.primary + '15' : 'transparent',
            },
          ]}
          disabled={!isHeavy}
          onPress={() => isHeavy && Alert.alert('집 옮기기', '배송 서비스를 신청하시겠습니까?')}>
          <Text
            style={[
              styles.actionBtnText,
              { color: isHeavy ? theme.primary : theme.textSecondary },
            ]}>
            🚚 집 옮기기
          </Text>
        </Pressable>
      </View>

      {/* Chat Area */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: Spacing.three }}>
        {/* Karrot Pay Info Box */}
        <View style={[styles.infoBox, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.infoText, { color: theme.text }]}>
            💰{product.sellerName}님은 당근페이 사용자예요.
          </Text>
          <Text style={[styles.infoText, { color: theme.text, marginTop: Spacing.one }]}>
            채팅방에서 바로 송금하거나 안심결제를 요청해 보세요.
          </Text>
          <Pressable style={{ marginTop: Spacing.one }}>
            <Text style={[styles.infoLink, { color: theme.primary }]}>자세히 보기</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Quick Reply Buttons */}
      <View style={[styles.quickReplySection, { borderTopColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickReplyScroll}>
          <Pressable style={[styles.sparkIcon, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="sparkles" size={20} color={theme.primary} />
          </Pressable>
          <Pressable
            style={[styles.quickReplyBtn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setMessage('안녕하세요😊')}>
            <Text style={[styles.quickReplyText, { color: theme.text }]}>안녕하세요😊</Text>
          </Pressable>
          <Pressable
            style={[styles.quickReplyBtn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setMessage('관심 있어서 문의드려요.')}>
            <Text style={[styles.quickReplyText, { color: theme.text }]}>관심 있어서 문의드려요.</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <Pressable style={styles.addBtn}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </Pressable>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="메시지 보내기"
          placeholderTextColor={theme.textSecondary}
          value={message}
          onChangeText={setMessage}
        />
        <Pressable style={styles.emojiBtn}>
          <Text style={styles.emojiText}>😊</Text>
        </Pressable>
        <Pressable style={styles.sendBtn}>
          <Ionicons name="arrow-forward" size={20} color={theme.primary} />
        </Pressable>
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
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  headerLeft: {
    width: 24,
  },
  headerCenter: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tempBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tempText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  responseTime: {
    fontSize: 12,
    marginTop: 2,
  },
  productBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderBottomWidth: 1,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  priceNote: {
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
    borderBottomWidth: 1,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoBox: {
    marginHorizontal: Spacing.three,
    marginVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
  },
  infoLink: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  quickReplySection: {
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
  },
  quickReplyScroll: {
    paddingHorizontal: Spacing.three,
  },
  sparkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.one,
  },
  quickReplyBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 16,
    marginRight: Spacing.one,
    justifyContent: 'center',
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    gap: Spacing.one,
  },
  addBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    fontSize: 14,
  },
  emojiBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  sendBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
