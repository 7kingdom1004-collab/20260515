import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUser } from '@/context/user-context';
import { PRODUCT_DETAILS } from '@/data/products';
import { getItems, removeItem } from '@/store/items';
import { supabase } from '@/lib/supabase';

interface RelatedAd {
  brand: string;
  title: string;
  originalPrice: string;
  salePrice: string;
  discount: number;
  color: string;
}

interface SimilarProduct {
  id: string;
  title: string;
  price: string;
  thumbnailColor: string;
  reserved?: boolean;
}

const RELATED_ADS: RelatedAd[] = [
  {
    brand: '제넥스',
    title: '아레나 마루체어 메쉬 중간 허리지지대',
    originalPrice: '399,000원',
    salePrice: '349,000원',
    discount: 12,
    color: '#F0EDE8',
  },
  {
    brand: '누카',
    title: '에르고체어 컴퓨터 사무용 착석감',
    originalPrice: '381,000원',
    salePrice: '264,000원',
    discount: 30,
    color: '#E8EAF0',
  },
  {
    brand: '누카',
    title: '커스텀체어 X900-PRO 컴퓨터의자',
    originalPrice: '416,000원',
    salePrice: '299,000원',
    discount: 28,
    color: '#EAEAEA',
  },
];

const SIMILAR_PRODUCTS: SimilarProduct[] = [
  {
    id: '2',
    title: '게임이나 디자인, 3d 모델링',
    price: '750,000원',
    thumbnailColor: '#282828',
  },
  {
    id: '4',
    title: 'LG 그램스타일 16인치 노트북',
    price: '1,200,000원',
    thumbnailColor: '#E8D890',
  },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, userRole } = useUser();
  const [liked, setLiked] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHideSuccess, setShowHideSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showUnhideSuccess, setShowUnhideSuccess] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false);
  const [showPermanentDeleteSuccess, setShowPermanentDeleteSuccess] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  let product = id && PRODUCT_DETAILS[id];
  if (!product && id) {
    const listItem = getItems().find(i => i.id === id);
    if (listItem) {
      product = {
        title: listItem.title,
        price: listItem.price,
        sellerName: listItem.userId === user?.id ? '나' : '익명',
        sellerLocation: listItem.location || '논현2동',
        temperature: 36.5,
        category: '중고거래',
        timeAgo: listItem.timeAgo || '방금 전',
        description: '',
        thumbnailColor: listItem.thumbnailColor,
        thumbnailImage: listItem.thumbnailImage,
        views: 0,
        interests: 0,
        tradeLocation: '',
        userId: listItem.userId,
        isHidden: listItem.isHidden,
        isDeleted: listItem.isDeleted,
      };
    }
  }

  const galleryImages = product?.images?.length
    ? product.images
    : product?.thumbnailImage
      ? [product.thumbnailImage]
      : [];

  const goToPrev = () => {
    const next = (photoIndex - 1 + galleryImages.length) % galleryImages.length;
    const isWrap = photoIndex === 0;
    setPhotoIndex(next);
    scrollRef.current?.scrollTo({ x: next * containerWidth, animated: !isWrap });
  };

  const goToNext = () => {
    const next = (photoIndex + 1) % galleryImages.length;
    const isWrap = photoIndex === galleryImages.length - 1;
    setPhotoIndex(next);
    scrollRef.current?.scrollTo({ x: next * containerWidth, animated: !isWrap });
  };

  const showToast = () => {
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 24 }}>
          상품을 찾을 수 없습니다.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: BottomTabInset + 80 }}>
        {/* Image Section with Gallery */}
        <View
          style={[
            styles.imageSection,
            { backgroundColor: product.thumbnailColor },
          ]}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
          {galleryImages.length > 0 && containerWidth > 0 ? (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              style={{ width: containerWidth, height: 300 }}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / containerWidth
                );
                setPhotoIndex(idx);
              }}>
              {galleryImages.map((item, i) => (
                <Image
                  key={i}
                  source={{ uri: item }}
                  style={{ width: containerWidth, height: 300 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : galleryImages.length === 0 ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: product.thumbnailColor }]} />
          ) : null}

          {/* Back button - Left */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>

          {/* Previous/Next Navigation Buttons */}
          {galleryImages.length > 1 && (
            <>
              <Pressable
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrev}>
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </>
          )}

          {/* Right icons group */}
          <View style={styles.topRightActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.replace('/')}>
              <Ionicons name="home" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => Alert.alert('공유', '공유 기능을 준비 중입니다.')}>
              <Ionicons name="share-social" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowMenu(true)}>
              <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Image counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {galleryImages.length > 0
                ? `${photoIndex + 1}/${galleryImages.length}`
                : ''}
            </Text>
          </View>
        </View>

        {/* Seller Info Section */}
        <View style={[styles.sellerSection, { borderBottomColor: theme.border }]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.border },
            ]}
          />
          <View style={styles.sellerInfo}>
            <Text style={[styles.sellerName, { color: theme.text }]}>
              {product.sellerName}
            </Text>
            <Text style={[styles.sellerLocation, { color: theme.textSecondary }]}>
              {product.sellerLocation}
            </Text>
          </View>
          <View style={styles.temperatureContainer}>
            <Text style={[styles.temperatureValue, { color: theme.primary }]}>
              {product.temperature}°C 🐰
            </Text>
            <Text style={[styles.mannerLabel, { color: theme.textSecondary }]}>
              매너온도
            </Text>
          </View>
        </View>

        {/* Product Info Section - All content in one section */}
        <View style={[styles.productSection, { borderBottomColor: theme.border }]}>
          {/* 1. Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            {product.title}
          </Text>

          {/* 2. Price + 당근페이 */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.text }]}>
              {product.price}
            </Text>
            <View style={[styles.karriotPayTag, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.karriotPayText, { color: theme.primary }]}>
                🌿당근페이
              </Text>
            </View>
          </View>

          {/* 3. Category · Time */}
          <View style={styles.meta}>
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {product.category}
            </Text>
            <Text style={[styles.metaDot, { color: theme.textSecondary }]}>
              {' · '}
            </Text>
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {product.timeAgo}
            </Text>
          </View>

          {/* 4. Description */}
          <Text style={[styles.description, { color: theme.text }]}>
            {product.description}
          </Text>

          {/* 5. Trade Location Section (내부, divider 없음) */}
          <View style={[styles.tradeSection, { borderTopColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              거래 희망 장소
            </Text>
            <Pressable style={styles.locationLink}>
              <Text style={[styles.locationLinkText, { color: theme.text }]}>
                {product.tradeLocation} ›
              </Text>
            </Pressable>
            <View style={[styles.mapBox, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="map" size={40} color={theme.textSecondary} />
              <Text style={[styles.mapText, { color: theme.primary }]}>지도 보기 ↗</Text>
            </View>
          </View>

          {/* 6. Treasure Found Badge */}
          <Text style={[styles.treasureText, { color: theme.textSecondary }]}>
            ♛ 근처에서 보물상자 발견
          </Text>

          {/* 7. Stats - Interest & Views */}
          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              관심 {product.interests}
            </Text>
            <Text style={[styles.statDot, { color: theme.textSecondary }]}>
              {' · '}
            </Text>
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              조회 {product.views}
            </Text>
          </View>

          {/* 8. Report Link */}
          <Pressable
            style={styles.reportRow}
            onPress={() => Alert.alert('신고', '이 게시글을 신고하시겠습니까?')}>
            <Text style={[styles.reportText, { color: theme.textSecondary }]}>
              이 게시글 신고하기
            </Text>
          </Pressable>
        </View>

        {/* Related Ads Section - with thick divider */}
        <View style={[styles.divider, { backgroundColor: theme.backgroundElement }]} />
        <View style={styles.adsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {product.sellerName}님을 위한 새 상품·광고
            </Text>
            <Text style={[{ color: theme.primary, fontSize: 18 }]}>ⓘ</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.adsContainer}>
            {RELATED_ADS.map((ad, idx) => (
              <Pressable
                key={idx}
                style={styles.adCard}
                onPress={() => Alert.alert('광고', ad.title)}>
                <View
                  style={[
                    styles.adThumbnail,
                    { backgroundColor: ad.color },
                  ]}>
                  <View
                    style={[
                      styles.discountBadge,
                      { backgroundColor: theme.primary },
                    ]}>
                    <Text style={styles.discountText}>{ad.discount}%</Text>
                  </View>
                </View>
                <Text style={[styles.adBrand, { color: theme.textSecondary }]}>
                  {ad.brand}
                </Text>
                <Text
                  style={[styles.adTitle, { color: theme.text }]}
                  numberOfLines={2}>
                  {ad.title}
                </Text>
                <Text
                  style={[
                    styles.adOriginalPrice,
                    { color: theme.textSecondary },
                  ]}>
                  {ad.originalPrice}
                </Text>
                <Text style={[styles.adPrice, { color: theme.text }]}>
                  {ad.salePrice}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Similar Products Section - 2 Column Grid with thick divider */}
        <View style={[styles.divider, { backgroundColor: theme.backgroundElement }]} />
        <View style={styles.similarSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              보고 있는 물품과 비슷한 물품
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
          <View style={styles.similarGrid}>
            {SIMILAR_PRODUCTS.map((item) => (
              <Pressable
                key={item.id}
                style={styles.similarGridCard}
                onPress={() => router.push(`/product/${item.id}`)}>
                <View
                  style={[
                    styles.gridThumbnail,
                    { backgroundColor: item.thumbnailColor },
                  ]}>
                  {item.reserved && (
                    <View style={styles.reservedBadge}>
                      <Text style={styles.reservedText}>예약중</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.gridTitle, { color: theme.text }]}
                  numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.gridPrice, { color: theme.text }]}>
                  {item.price}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView
        edges={['bottom']}
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}>
        <View style={styles.actionRow}>
          <Pressable
            style={styles.heartButton}
            onPress={() => {
              const newLiked = !liked;
              setLiked(newLiked);
              if (newLiked) showToast();
            }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? theme.primary : theme.textSecondary}
            />
          </Pressable>
          <Pressable
            style={[
              styles.chatButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={() => router.push(`/product-chat?productId=${id}`)}>
            <Text style={styles.chatButtonText}>채팅하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            { opacity: toastOpacity },
          ]}>
          <View style={styles.toastLeft}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.toastText}>관심목록에 추가했어요.</Text>
          </View>
          <Pressable>
            <Text style={[styles.toastAction, { color: theme.primary }]}>관심목록 보기</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* More Menu */}
      {showMenu && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => setShowMenu(false)}
          />
          <View style={styles.menuModal}>
            {/* 실제 소유자 체크: user.id와 product.userId가 일치하고 둘 다 존재해야 함 */}
            {(() => {
              const isOwner = !!user?.id && !!product?.userId && user.id === product.userId;
              const isAdmin = userRole === 'admin';

              if (!isOwner && !isAdmin) {
                // 권한 없으면 닫기 버튼만
                return (
                  <Pressable
                    style={[styles.menuItem, styles.menuItemClose]}
                    onPress={() => setShowMenu(false)}>
                    <Ionicons name="close" size={20} color={theme.text} />
                    <Text style={[styles.menuItemText, { color: theme.text }]}>닫기</Text>
                  </Pressable>
                );
              }

              const isDeleted = !!product?.isDeleted;
              const isHidden = !!product?.isHidden;

              if (isDeleted) {
                // 삭제된 상품: 부활하기 + 완전삭제
                return (
                  <>
                    <Pressable
                      style={styles.menuItem}
                      onPress={async () => {
                        setShowMenu(false);
                        await supabase
                          .from('products')
                          .update({ is_deleted: false })
                          .eq('id', id);
                        setShowRestoreSuccess(true);
                      }}>
                      <Ionicons name="refresh" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, { color: theme.text }]}>부활하기</Text>
                    </Pressable>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        setShowPermanentDeleteConfirm(true);
                      }}>
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                      <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>완전삭제</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.menuItem, styles.menuItemClose]}
                      onPress={() => setShowMenu(false)}>
                      <Ionicons name="close" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, { color: theme.text }]}>닫기</Text>
                    </Pressable>
                  </>
                );
              } else if (isHidden) {
                // 숨긴 상품: 다시 보이기 + 삭제
                return (
                  <>
                    <Pressable
                      style={styles.menuItem}
                      onPress={async () => {
                        setShowMenu(false);
                        await supabase
                          .from('products')
                          .update({ is_hidden: false })
                          .eq('id', id);
                        setShowUnhideSuccess(true);
                      }}>
                      <Ionicons name="eye" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, { color: theme.text }]}>다시 보이기</Text>
                    </Pressable>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}>
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                      <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>삭제</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.menuItem, styles.menuItemClose]}
                      onPress={() => setShowMenu(false)}>
                      <Ionicons name="close" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, { color: theme.text }]}>닫기</Text>
                    </Pressable>
                  </>
                );
              } else {
                // 정상 상품: 수정하기(본인만) + 숨기기 + 삭제
                return (
                  <>
                    {isOwner && (
                      <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                          setShowMenu(false);
                          router.push(`/write?id=${id}`);
                        }}>
                        <Ionicons name="pencil" size={20} color={theme.text} />
                        <Text style={[styles.menuItemText, { color: theme.text }]}>게시글 수정하기</Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        setShowHideConfirm(true);
                      }}>
                      <Ionicons name="eye-off" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, { color: theme.text }]}>숨기기</Text>
                    </Pressable>
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}>
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                      <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>삭제</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.menuItem, styles.menuItemClose]}
                      onPress={() => setShowMenu(false)}>
                      <Ionicons name="close" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, { color: theme.text }]}>닫기</Text>
                    </Pressable>
                  </>
                );
              }
            })()}
          </View>
        </>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => setShowDeleteConfirm(false)}
          />
          <View style={styles.confirmModal}>
            <Text style={[styles.confirmTitle, { color: theme.text }]}>정말 삭제하시겠습니까?</Text>
            <Text style={[styles.confirmMessage, { color: theme.textSecondary }]}>
              삭제된 게시글은 복구할 수 없습니다.
            </Text>
            <View style={styles.confirmButtonRow}>
              <Pressable
                style={[styles.confirmButton, { borderColor: theme.border }]}
                onPress={() => setShowDeleteConfirm(false)}>
                <Text style={[styles.confirmButtonText, { color: theme.text }]}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, styles.confirmDeleteButton]}
                onPress={async () => {
                  setShowDeleteConfirm(false);
                  await supabase.from('products').update({ is_deleted: true }).eq('id', id);
                  removeItem(id!);
                  setShowDeleteSuccess(true);
                }}>
                <Text style={styles.confirmDeleteButtonText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {/* Hide Confirm Modal */}
      {showHideConfirm && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => setShowHideConfirm(false)}
          />
          <View style={styles.confirmModal}>
            <Text style={[styles.confirmTitle, { color: theme.text }]}>숨기시겠습니까?</Text>
            <Text style={[styles.confirmMessage, { color: theme.textSecondary }]}>
              숨긴 게시글은 상품 목록에 표시되지 않습니다.
            </Text>
            <View style={styles.confirmButtonRow}>
              <Pressable
                style={[styles.confirmButton, { borderColor: theme.border }]}
                onPress={() => setShowHideConfirm(false)}>
                <Text style={[styles.confirmButtonText, { color: theme.text }]}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, styles.confirmDeleteButton]}
                onPress={async () => {
                  setShowHideConfirm(false);
                  await supabase
                    .from('products')
                    .update({ is_hidden: true })
                    .eq('id', id);
                  setShowHideSuccess(true);
                }}>
                <Text style={styles.confirmDeleteButtonText}>숨기기</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {/* Hide Success Modal */}
      {showHideSuccess && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => {
              setShowHideSuccess(false);
              router.replace('/');
            }}
          />
          <View style={styles.successModal}>
            <Text style={[styles.successTitle, { color: theme.text }]}>숨겨졌습니다</Text>
            <Pressable
              style={[styles.successButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowHideSuccess(false);
                router.replace('/');
              }}>
              <Text style={styles.successButtonText}>확인</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => {
              setShowDeleteSuccess(false);
              router.replace('/');
            }}
          />
          <View style={styles.successModal}>
            <Text style={[styles.successTitle, { color: theme.text }]}>삭제되었습니다</Text>
            <Pressable
              style={[styles.successButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowDeleteSuccess(false);
                router.replace('/');
              }}>
              <Text style={styles.successButtonText}>확인</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Unhide Success Modal */}
      {showUnhideSuccess && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => {
              setShowUnhideSuccess(false);
              router.replace('/');
            }}
          />
          <View style={styles.successModal}>
            <Text style={[styles.successTitle, { color: theme.text }]}>다시 보이게 되었습니다</Text>
            <Pressable
              style={[styles.successButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowUnhideSuccess(false);
                router.replace('/');
              }}>
              <Text style={styles.successButtonText}>확인</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Restore Success Modal */}
      {showRestoreSuccess && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => {
              setShowRestoreSuccess(false);
              router.replace('/');
            }}
          />
          <View style={styles.successModal}>
            <Text style={[styles.successTitle, { color: theme.text }]}>복구되었습니다</Text>
            <Pressable
              style={[styles.successButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowRestoreSuccess(false);
                router.replace('/');
              }}>
              <Text style={styles.successButtonText}>확인</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Permanent Delete Confirm Modal */}
      {showPermanentDeleteConfirm && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => setShowPermanentDeleteConfirm(false)}
          />
          <View style={styles.confirmModal}>
            <Text style={[styles.confirmTitle, { color: theme.text }]}>완전히 삭제하시겠습니까?</Text>
            <Text style={[styles.confirmMessage, { color: theme.textSecondary }]}>
              이 작업은 되돌릴 수 없습니다. 게시글과 이미지가 서버에서 영구적으로 삭제됩니다.
            </Text>
            <View style={styles.confirmButtonRow}>
              <Pressable
                style={[styles.confirmButton, { borderColor: theme.border }]}
                onPress={() => setShowPermanentDeleteConfirm(false)}>
                <Text style={[styles.confirmButtonText, { color: theme.text }]}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, styles.confirmDeleteButton]}
                onPress={async () => {
                  setShowPermanentDeleteConfirm(false);
                  await supabase.from('products').delete().eq('id', id);
                  removeItem(id!);
                  setShowPermanentDeleteSuccess(true);
                }}>
                <Text style={styles.confirmDeleteButtonText}>완전삭제</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {/* Permanent Delete Success Modal */}
      {showPermanentDeleteSuccess && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => {
              setShowPermanentDeleteSuccess(false);
              router.replace('/');
            }}
          />
          <View style={styles.successModal}>
            <Text style={[styles.successTitle, { color: theme.text }]}>완전히 삭제되었습니다</Text>
            <Pressable
              style={[styles.successButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowPermanentDeleteSuccess(false);
                router.replace('/');
              }}>
              <Text style={styles.successButtonText}>확인</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageSection: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightActions: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonLeft: {
    left: Spacing.two,
  },
  navButtonRight: {
    right: Spacing.two,
  },
  imageCounter: {
    position: 'absolute',
    bottom: Spacing.three,
    right: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  sellerLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  temperatureContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  temperatureValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  mannerLabel: {
    fontSize: 11,
  },
  productSection: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
  },
  tradeSection: {
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  treasureText: {
    fontSize: 12,
    marginTop: Spacing.three,
  },
  reportRow: {
    marginTop: Spacing.two,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  karriotPayTag: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  karriotPayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    marginTop: Spacing.one,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
  },
  metaDot: {
    fontSize: 13,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.three,
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
  },
  statDot: {
    fontSize: 13,
  },
  divider: {
    height: 8,
  },
  locationSection: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  locationLink: {
    paddingBottom: Spacing.two,
  },
  locationLinkText: {
    fontSize: 14,
  },
  mapBox: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
  mapText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reportSection: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  reportText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  adsSection: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  adsContainer: {
    gap: Spacing.two,
  },
  adCard: {
    width: 130,
    marginRight: Spacing.one,
  },
  adThumbnail: {
    width: 130,
    height: 110,
    borderRadius: 8,
    marginBottom: Spacing.one,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 4,
  },
  discountBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  adBrand: {
    fontSize: 11,
    marginBottom: 2,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 2,
  },
  adOriginalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  adPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  similarSection: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  similarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  similarGridCard: {
    width: '47%',
  },
  gridThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    position: 'relative',
  },
  reservedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reservedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  gridTitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 16,
  },
  gridPrice: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  bottomBar: {
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  heartButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.three,
    right: Spacing.three,
    backgroundColor: '#222222',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  toastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  toastAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: Spacing.two,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 16,
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemClose: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmModal: {
    position: 'absolute',
    bottom: '50%',
    left: '10%',
    right: '10%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  confirmMessage: {
    fontSize: 14,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  confirmButtonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  confirmDeleteButton: {
    backgroundColor: '#FF3B30',
    borderWidth: 0,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmDeleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successModal: {
    position: 'absolute',
    bottom: '50%',
    left: '15%',
    right: '15%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    zIndex: 1000,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  successButton: {
    borderRadius: 8,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    minWidth: 100,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
