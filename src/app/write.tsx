import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { addItem, updateItem, type ListItem } from '@/store/items';
import { addProductDetail } from '@/data/products';
import { supabase } from '@/lib/supabase';

async function uploadPhoto(uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'jpg';
    const path = `${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, blob, { contentType: blob.type });

    if (error || !data) return null;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch {
    return null;
  }
}

export default function WriteScreen() {
  const { id: editId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceMode, setPriceMode] = useState<'sell' | 'share'>('sell');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState(false);
  const [tradeLocation, setTradeLocation] = useState('강남구청역 맥도날드');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const saveToastOpacity = useRef(new Animated.Value(0)).current;
  const photoScrollRef = useRef<ScrollView>(null);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultiple: true,
      orderedSelection: true,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.slice(0, 10 - photos.length).map((a) => a.uri);
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  useEffect(() => {
    if (!editId) return;
    supabase
      .from('products')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setTitle(data.title);
        setDescription(data.description || '');
        setPrice(data.price.replace(/[^0-9]/g, ''));
        setPriceMode(data.price_mode);
        setOfferPrice(data.offer_price);
        setTradeLocation(data.trade_location || '강남구청역 맥도날드');
        if (data.images?.length) setPhotos(data.images);
        else if (data.thumbnail_image) setPhotos([data.thumbnail_image]);
      });
  }, [editId]);

  useEffect(() => {
    if (photos.length > 0) {
      setTimeout(() => {
        photoScrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [photos.length]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <SafeAreaView style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.replace('/')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {editId ? '게시글 수정하기' : '논현2동에 올리기'}
        </Text>
        <Pressable
          onPress={() => {
            setShowSaveToast(true);
            Animated.sequence([
              Animated.timing(saveToastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.delay(2000),
              Animated.timing(saveToastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => setShowSaveToast(false));
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.tempSaveBtn, { color: theme.primary }]}>임시저장</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Photo Upload */}
        {photos.length > 0 && (
          <ScrollView
            ref={photoScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
            contentContainerStyle={styles.photoScrollContent}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri }} style={styles.photoImage} />
                <Pressable
                  style={styles.photoDelete}
                  onPress={() => setPhotos(photos.filter((_, i) => i !== index))}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Camera Icon - Always Visible */}
        {photos.length < 10 && (
          <Pressable
            onPress={pickPhoto}
            style={[styles.photoBox, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="camera" size={32} color={theme.textSecondary} />
            <Text style={[styles.photoText, { color: theme.textSecondary }]}>{photos.length}/10</Text>
          </Pressable>
        )}

        {/* Error Message */}
        {error ? (
          <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
        ) : null}

        {/* Title */}
        <View>
          <TextInput
            placeholder="제목을 입력해주세요."
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { color: theme.text }]}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        {/* Description */}
        <View>
          <TextInput
            placeholder="논현2동에 올릴 게시글을 내용을 작성해주세요. (판매 금지 물품은 게시가 제한될 수 있어요.)&#10;&#10;신뢰할 수 있는 거래를 위해 자세히 작성해주세요. 과하기술 정보통신법, 한국 인터넷진흥원과 함께 해요."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={8}
            style={[styles.descriptionInput, { color: theme.text }]}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        {/* Favorite Phrases */}
        <Pressable style={[styles.phraseBtn, { borderColor: theme.border }]}>
          <Text style={[styles.phraseBtnText, { color: theme.text }]}>자주 쓰는 문구</Text>
        </Pressable>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={[styles.label, { color: theme.text }]}>가격</Text>

          {/* Price Mode Tabs */}
          <View style={styles.priceTabs}>
            <Pressable
              onPress={() => setPriceMode('sell')}
              style={[
                styles.priceTab,
                {
                  backgroundColor: priceMode === 'sell' ? theme.text : 'transparent',
                  borderColor: theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.priceTabText,
                  { color: priceMode === 'sell' ? theme.background : theme.text },
                ]}>
                판매하기
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPriceMode('share')}
              style={[
                styles.priceTab,
                {
                  backgroundColor: priceMode === 'share' ? theme.text : 'transparent',
                  borderColor: theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.priceTabText,
                  { color: priceMode === 'share' ? theme.background : theme.text },
                ]}>
                나눔하기
              </Text>
            </Pressable>
          </View>

          {/* Price Input */}
          {priceMode === 'sell' && (
            <View style={[styles.priceInput, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.currencySymbol, { color: theme.text }]}>₩</Text>
              <TextInput
                placeholder="가격을 입력해주세요."
                placeholderTextColor={theme.textSecondary}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={[styles.priceInputField, { color: theme.text }]}
              />
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          )}

          {/* Price Offer Checkbox */}
          <Pressable
            onPress={() => setOfferPrice(!offerPrice)}
            style={styles.checkboxRow}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: theme.border,
                  backgroundColor: offerPrice ? theme.primary : 'transparent',
                },
              ]}>
              {offerPrice && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={[styles.checkboxLabel, { color: theme.text }]}>가격 제안 받기</Text>
          </Pressable>
        </View>

        {/* Trade Settings */}
        <View style={styles.settingsSection}>
          {/* Trade Location */}
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>거래 희망 장소</Text>
            <View style={styles.settingValue}>
              <View style={[styles.locationBox, { borderColor: theme.border }]}>
                <Text style={[styles.locationText, { color: theme.text }]}>{tradeLocation}</Text>
                <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={18} color={theme.textSecondary} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Same Neighborhood Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>신천동에 같은 글 올리기</Text>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: theme.border,
                },
              ]}>
              <View style={[styles.toggleThumb, { backgroundColor: theme.background }]} />
            </View>
          </View>

          {/* Warning Box */}
          <View style={[styles.warningBox, { backgroundColor: '#FFF5E6' }]}>
            <Ionicons name="alert-circle" size={18} color="#D97706" />
            <Text style={[styles.warningText, { color: '#92400E' }]}>
              신천동에서 동네인증이 필요해요. 지금은 글을 작성중인 논현2동에만 글을 올릴 수 있어요.
            </Text>
          </View>

          {/* Neighborhood Settings Link */}
          <Pressable style={styles.settingLink}>
            <Text style={[styles.settingLinkText, { color: theme.text }]}>보여줄 동네 설정</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <SafeAreaView style={[styles.bottomBar, { borderTopColor: theme.border }]}>
        <Pressable
          onPress={async () => {
            if (!title) return;
            setLoading(true);

            const uploadedUrls: string[] = [];
            for (const uri of photos) {
              if (uri.startsWith('http')) {
                uploadedUrls.push(uri);
              } else {
                const url = await uploadPhoto(uri);
                if (url) uploadedUrls.push(url);
              }
            }

            const productData = {
              title,
              description: description || '',
              price: priceMode === 'sell' ? `${price}원` : '나눔',
              price_mode: priceMode,
              offer_price: offerPrice,
              location: '논현2동',
              trade_location: tradeLocation,
              thumbnail_color: photos.length > 0 ? '#D0D0D0' : '#E8D890',
              thumbnail_image: uploadedUrls[0] ?? null,
              images: uploadedUrls.length > 0 ? uploadedUrls : null,
              seller_name: '나',
              seller_location: '논현2동',
            };

            let data, insertError;
            if (editId) {
              const { error: updateError } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editId);
              data = { id: editId };
              insertError = updateError;
            } else {
              const result = await supabase
                .from('products')
                .insert(productData)
                .select()
                .single();
              data = result.data;
              insertError = result.error;
            }
            setLoading(false);

            if (insertError) {
              setError(insertError.message);
              return;
            }

            const newId = data.id;
            if (editId) {
              updateItem(editId, {
                title,
                price: priceMode === 'sell' ? `${price}원` : '나눔',
                thumbnailColor: photos.length > 0 ? '#D0D0D0' : '#E8D890',
                thumbnailImage: uploadedUrls[0] || undefined,
              });
            } else {
              const newItem: ListItem = {
                id: newId,
                title,
                price: priceMode === 'sell' ? `${price}원` : '나눔',
                location: '논현2동',
                distance: '방금',
                timeAgo: '방금 전',
                priceType: 'normal',
                chatCount: 0,
                heartCount: 0,
                thumbnailColor: photos.length > 0 ? '#D0D0D0' : '#E8D890',
                thumbnailImage: uploadedUrls[0] || undefined,
              };
              addItem(newItem);
            }
            addProductDetail(newId, {
              title,
              price: priceMode === 'sell' ? `${price}원` : '나눔',
              sellerName: '나',
              sellerLocation: '논현2동',
              temperature: 36.5,
              category: '중고거래',
              timeAgo: '방금 전',
              description: description || '',
              thumbnailColor: photos.length > 0 ? '#D0D0D0' : '#E8D890',
              thumbnailImage: uploadedUrls[0] || undefined,
              images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
              views: 0,
              interests: 0,
              tradeLocation,
            });
            if (editId) {
              setShowEditSuccess(true);
            } else {
              router.replace('/');
            }
          }}
          disabled={loading}
          style={[styles.submitButton, { backgroundColor: theme.primary, opacity: loading ? 0.6 : 1 }]}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>작성 완료</Text>
          )}
        </Pressable>
      </SafeAreaView>

      {/* Save Toast */}
      {showSaveToast && (
        <Animated.View
          style={[
            styles.saveToast,
            { opacity: saveToastOpacity, backgroundColor: '#222222' },
          ]}>
          <Text style={styles.saveToastText}>게시글을 임시저장했어요.</Text>
        </Animated.View>
      )}

      {/* Edit Success Modal */}
      {showEditSuccess && (
        <>
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 }]} />
          <View style={styles.successModal}>
            <Text style={styles.successTitle}>수정이 되었습니다</Text>
            <Pressable style={[styles.successButton, { backgroundColor: theme.primary }]} onPress={() => router.replace('/')}>
              <Text style={styles.successButtonText}>확인</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
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
  tempSaveBtn: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  photoScroll: {
    marginHorizontal: -Spacing.three,
  },
  photoScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  photoItem: {
    position: 'relative',
    marginRight: Spacing.two,
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  photoDelete: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    opacity: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minWidth: 100,
  },
  photoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.one,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: Spacing.two,
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  descriptionInput: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: Spacing.two,
    paddingHorizontal: 0,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  phraseBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  phraseBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceSection: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceTabs: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  priceTab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: Spacing.one + 2,
    alignItems: 'center',
  },
  priceTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  settingsSection: {
    gap: Spacing.two,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  settingValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: Spacing.one,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '400',
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignSelf: 'flex-start',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.two,
    borderRadius: 8,
    gap: Spacing.two,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '400',
    flex: 1,
    lineHeight: 18,
  },
  settingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  settingLinkText: {
    fontSize: 14,
    fontWeight: '400',
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveToast: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  saveToastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  successModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -70 }],
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  successButton: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
