import AsyncStorage from '@react-native-async-storage/async-storage';

export type PriceType = 'normal' | 'discount';

const ITEMS_KEY = 'user_items';
const STATIC_IDS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);

export interface ListItem {
  id: string;
  title: string;
  location: string;
  distance: string;
  timeAgo: string;
  price: string;
  priceType: PriceType;
  chatCount: number;
  heartCount: number;
  thumbnailColor: string;
  thumbnailImage?: string;
  userId?: string;
}

export let items: ListItem[] = [
  {
    id: '1',
    title: '보람상조 완납분(현재 상품 580만원 상당)',
    location: '논현동',
    distance: '900m',
    timeAgo: '1일 전',
    price: '400만원',
    priceType: 'normal',
    chatCount: 3,
    heartCount: 10,
    thumbnailColor: '#D8C8B8',
  },
  {
    id: '2',
    title: '게임이나 디자인, 3d 모델링하시는분!! (Dell 워크스테이션)',
    location: '자양제3동',
    distance: '3km',
    timeAgo: '3시간 전',
    price: '750,000원',
    priceType: 'normal',
    chatCount: 2,
    heartCount: 1,
    thumbnailColor: '#282828',
  },
  {
    id: '3',
    title: '이거 다 가져가세요!!',
    location: '논현동 · 휴대폰성지강남점',
    distance: '',
    timeAgo: '',
    price: '100,000원 할인',
    priceType: 'discount',
    chatCount: 690,
    heartCount: 1,
    thumbnailColor: '#C8D8C8',
  },
  {
    id: '4',
    title: 'LG 그램스타일 16인치 그라파이트 그레이 울트라슬림 노트북',
    location: '압구정동',
    distance: '2.1km',
    timeAgo: '2시간 전',
    price: '1,200,000원',
    priceType: 'normal',
    chatCount: 2,
    heartCount: 7,
    thumbnailColor: '#E8D890',
  },
  {
    id: '5',
    title: '애플 에어팟 프로 2세대 정품 (미개봉)',
    location: '청담동',
    distance: '1.5km',
    timeAgo: '30분 전',
    price: '280,000원',
    priceType: 'normal',
    chatCount: 5,
    heartCount: 22,
    thumbnailColor: '#FFFFFF',
  },
  {
    id: '6',
    title: '나이키 에어포스 1 화이트 275 (거의 새 상품)',
    location: '신사동',
    distance: '800m',
    timeAgo: '1시간 전',
    price: '65,000원',
    priceType: 'normal',
    chatCount: 1,
    heartCount: 8,
    thumbnailColor: '#F5F5F5',
  },
  {
    id: '7',
    title: '아이패드 에어 5세대 64GB 와이파이 (케이스 포함)',
    location: '역삼동',
    distance: '2.3km',
    timeAgo: '2시간 전',
    price: '550,000원',
    priceType: 'normal',
    chatCount: 7,
    heartCount: 15,
    thumbnailColor: '#B0C4DE',
  },
  {
    id: '8',
    title: '다이슨 에어랩 컴플리트 롱 헤어스타일러',
    location: '논현동',
    distance: '500m',
    timeAgo: '3시간 전',
    price: '380,000원',
    priceType: 'normal',
    chatCount: 3,
    heartCount: 31,
    thumbnailColor: '#C8A870',
  },
  {
    id: '9',
    title: '삼성 갤럭시 버즈 2 프로 보라색 (충전케이스 포함)',
    location: '도곡동',
    distance: '3.5km',
    timeAgo: '4시간 전',
    price: '120,000원',
    priceType: 'normal',
    chatCount: 0,
    heartCount: 4,
    thumbnailColor: '#9B89C4',
  },
  {
    id: '10',
    title: '브레빌 에스프레소 머신 바리스타 익스프레스',
    location: '삼성동',
    distance: '4km',
    timeAgo: '5시간 전',
    price: '650,000원',
    priceType: 'normal',
    chatCount: 2,
    heartCount: 9,
    thumbnailColor: '#A05030',
  },
  {
    id: '11',
    title: '소니 WH-1000XM5 노이즈캔슬링 헤드폰 블랙',
    location: '서초동',
    distance: '2.8km',
    timeAgo: '6시간 전',
    price: '250,000원',
    priceType: 'normal',
    chatCount: 4,
    heartCount: 12,
    thumbnailColor: '#222222',
  },
  {
    id: '12',
    title: '캠핑 폴딩 체어 + 테이블 세트 (2인용)',
    location: '방배동',
    distance: '5km',
    timeAgo: '12시간 전',
    price: '45,000원',
    priceType: 'normal',
    chatCount: 6,
    heartCount: 3,
    thumbnailColor: '#6B8E6B',
  },
];

export function addItem(item: ListItem) {
  items.unshift(item);
  saveUserItems();
}

export function getItems(): ListItem[] {
  return items;
}

export function removeItem(id: string) {
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items.splice(idx, 1);
    saveUserItems();
  }
}

export function updateItem(id: string, updates: Partial<ListItem>) {
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    saveUserItems();
  }
}

function saveUserItems() {
  const userItems = items.filter((i) => !STATIC_IDS.has(i.id));
  AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(userItems)).catch(() => {});
}

export async function initItems() {
  try {
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    if (raw) {
      const userItems: ListItem[] = JSON.parse(raw);
      const staticItems = items.filter((i) => STATIC_IDS.has(i.id));
      items = [...userItems, ...staticItems];
    }
  } catch {}
}
