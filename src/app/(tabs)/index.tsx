import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { selectedDistrict, setSelectedDistrict } from '@/store/location';
import { getItems, initItems, type ListItem, type PriceType, addItem, updateItem } from '@/store/items';
import { initProducts, addProductDetail } from '@/data/products';
import { supabase } from '@/lib/supabase';

function getTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

const CATEGORIES = [
  '전체',
  '방금 전',
  '중고거래',
  '알바↗',
  '카메라',
  '중고차',
  '만원당근',
  '부동산',
  '가까운 동네',
  '의자',
  '동네소식',
];

const WRITE_CATEGORIES_1 = [
  { icon: '🔍', label: '알바/과외/레슨' },
  { icon: '🏠', label: '부동산' },
  { icon: '🚗', label: '중고차' },
  { icon: '📋', label: '동네생활' },
  { icon: '▶️', label: '스토리' },
];

const WRITE_CATEGORIES_2 = [
  { icon: '🛍️', label: '여러 물건 팔기' },
  { icon: '🛍️', label: '내 물건 팔기' },
];


function Header({
  theme,
  primaryLocation,
  subLocation,
  onSwapLocation,
}: {
  theme: ReturnType<typeof useTheme>;
  primaryLocation: string;
  subLocation: string;
  onSwapLocation: () => void;
}) {
  const router = useRouter();

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <View style={styles.locationInfo}>
        <Text style={styles.locationPin}>📍</Text>
        <Pressable onPress={() => router.push('/location')}>
          <Text style={[styles.locationMain, { color: theme.text }]}>{primaryLocation}</Text>
        </Pressable>
        <Pressable onPress={onSwapLocation}>
          <Text style={[styles.locationSub, { color: theme.textSecondary }]}>{subLocation}</Text>
        </Pressable>
      </View>

      <View style={styles.headerActions}>
        <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={24} color={theme.text} />
        </Pressable>

        <View style={styles.bellContainer}>
          <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => Alert.alert('알림', '알림이 없습니다.')}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
          </Pressable>
          <View style={[styles.bellBadge, { backgroundColor: theme.primary }]} />
        </View>

        <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => router.push('/my')}>
          <Ionicons name="menu-outline" size={24} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}

function CategoryPills({
  active,
  onSelect,
  theme,
}: {
  active: string;
  onSelect: (cat: string) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContent}>
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <Pressable
            key={cat}
            onPress={() => onSelect(cat)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? theme.text : theme.backgroundElement,
              },
            ]}>
            <Text
              style={[
                styles.pillText,
                {
                  color: isActive ? theme.background : theme.text,
                  fontWeight: isActive ? '600' : '500',
                },
              ]}>
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ProductCard({ item, theme }: { item: ListItem; theme: ReturnType<typeof useTheme> }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/product/${item.id}`)}
      style={[styles.card, { borderBottomColor: theme.border }]}>
      {item.thumbnailImage ? (
        <Image source={{ uri: item.thumbnailImage }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: item.thumbnailColor }]} />
      )}

      <View style={styles.cardBody}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        {item.location && (
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {item.location}
            {item.distance && ` · ${item.distance}`}
            {item.timeAgo && ` · ${item.timeAgo}`}
          </Text>
        )}

        <Text
          style={[
            styles.price,
            {
              color: item.priceType === 'discount' ? theme.blue : theme.text,
            },
          ]}>
          {item.price}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.counter}>
          <Ionicons name="chatbubble-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.countText, { color: theme.textSecondary }]}>{item.chatCount}</Text>
        </View>
        <View style={styles.counter}>
          <Ionicons name="heart-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.countText, { color: theme.textSecondary }]}>{item.heartCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState('전체');
  const [primaryLocation, setPrimaryLocation] = useState('논현2동');
  const [subLocation, setSubLocation] = useState('신천동');
  const [showWriteMenu, setShowWriteMenu] = useState(false);
  const [localItems, setLocalItems] = useState<ListItem[]>(getItems());

  useEffect(() => {
    Promise.all([initItems(), initProducts()]).then(async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (data) {
        data.forEach((row) => {
          const itemData = {
            id: row.id,
            title: row.title,
            price: row.price,
            location: row.location,
            distance: '',
            timeAgo: row.created_at ? getTimeAgo(row.created_at) : '방금 전',
            priceType: 'normal' as PriceType,
            chatCount: row.chat_count,
            heartCount: row.heart_count,
            thumbnailColor: row.thumbnail_color,
            thumbnailImage: row.thumbnail_image ?? undefined,
          };
          if (!getItems().find((i) => i.id === row.id)) {
            addItem(itemData);
          } else {
            updateItem(row.id, itemData);
          }
          addProductDetail(row.id, {
            title: row.title,
            price: row.price,
            description: row.description || '',
            sellerName: row.seller_name || '익명',
            sellerLocation: row.seller_location || '논현2동',
            temperature: row.temperature,
            category: row.category,
            timeAgo: '방금 전',
            thumbnailColor: row.thumbnail_color,
            thumbnailImage: row.thumbnail_image ?? undefined,
            images: row.images ?? undefined,
            views: row.views,
            interests: row.interests,
            tradeLocation: row.trade_location || '',
          });
        });
      }
      setLocalItems([...getItems()]);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedDistrict) {
        setPrimaryLocation(selectedDistrict);
        setSelectedDistrict(null);
      }

      setLocalItems([...getItems()]);

      supabase
        .from('products')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            data.forEach((row) => {
              const itemData = {
                id: row.id,
                title: row.title,
                price: row.price,
                location: row.location,
                distance: '',
                timeAgo: row.created_at ? getTimeAgo(row.created_at) : '방금 전',
                priceType: 'normal' as PriceType,
                chatCount: row.chat_count,
                heartCount: row.heart_count,
                thumbnailColor: row.thumbnail_color,
                thumbnailImage: row.thumbnail_image ?? undefined,
              };
              if (!getItems().find((i) => i.id === row.id)) {
                addItem(itemData);
              } else {
                updateItem(row.id, itemData);
              }
              addProductDetail(row.id, {
                title: row.title,
                price: row.price,
                description: row.description || '',
                sellerName: row.seller_name || '익명',
                sellerLocation: row.seller_location || '논현2동',
                temperature: row.temperature,
                category: row.category,
                timeAgo: '방금 전',
                thumbnailColor: row.thumbnail_color,
                thumbnailImage: row.thumbnail_image ?? undefined,
                images: row.images ?? undefined,
                views: row.views,
                interests: row.interests,
                tradeLocation: row.trade_location || '',
              });
            });
          }
          setLocalItems([...getItems()]);
        });
    }, [])
  );

  const handleSwapLocation = () => {
    const temp = primaryLocation;
    setPrimaryLocation(subLocation);
    setSubLocation(temp);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ height: insets.top }} />

        <Header
          theme={theme}
          primaryLocation={primaryLocation}
          subLocation={subLocation}
          onSwapLocation={handleSwapLocation}
        />

        <CategoryPills active={activeCategory} onSelect={setActiveCategory} theme={theme} />

        <View>
          {localItems.map((item) => (
            <ProductCard key={item.id} item={item} theme={theme} />
          ))}
          <View style={{ height: BottomTabInset + 100 }} />
        </View>
      </ScrollView>

      {!showWriteMenu && (
        <Pressable
          style={[
            styles.fab,
            {
              backgroundColor: theme.primary,
              bottom: BottomTabInset + Spacing.three,
            },
          ]}
          onPress={() => setShowWriteMenu(true)}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.fabText}>글쓰기</Text>
        </Pressable>
      )}

      {/* Write Category Menu */}
      {showWriteMenu && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.modalBackdrop]}
            onPress={() => setShowWriteMenu(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                bottom: BottomTabInset + Spacing.three + 60,
                right: Spacing.three,
              },
            ]}
            onStartShouldSetResponder={() => true}>
            <View style={styles.menuCard}>
              {WRITE_CATEGORIES_1.map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => {
                    setShowWriteMenu(false);
                    router.push('/write');
                  }}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.menuCard}>
              {WRITE_CATEGORIES_2.map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => {
                    setShowWriteMenu(false);
                    router.push('/write');
                  }}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.closeBtn} onPress={() => setShowWriteMenu(false)}>
              <Ionicons name="close" size={24} color="#333333" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  locationPin: {
    fontSize: 16,
  },
  locationMain: {
    fontSize: 17,
    fontWeight: '700',
  },
  locationSub: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bellContainer: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryScroll: {
    flex: 0,
    height: 60,
  },
  categoryContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  thumbnail: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginRight: Spacing.three,
  },
  cardBody: {
    flex: 1,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingRight: Spacing.three,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  countText: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    position: 'absolute',
    width: 200,
    gap: Spacing.two,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: Spacing.two,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 16,
    gap: Spacing.two,
  },
  menuIcon: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
