import AsyncStorage from '@react-native-async-storage/async-storage';

const DETAILS_KEY = 'user_product_details';
const STATIC_DETAIL_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export interface ProductDetail {
  title: string;
  price: string;
  sellerName: string;
  sellerLocation: string;
  temperature: number;
  category: string;
  timeAgo: string;
  description: string;
  thumbnailColor: string;
  thumbnailImage?: string;
  images?: string[];
  views: number;
  interests: number;
  tradeLocation: string;
  isHeavy?: boolean;
  userId?: string;
}

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  '1': {
    title: '시디즈 T50 화이트웰 메쉬 T500HLDA 의자(오렌지/그레이) 9개 남음! 선착순이에요!',
    price: '160,000원',
    sellerName: '포도나무',
    sellerLocation: '논현1동',
    temperature: 46.3,
    category: '가구/인테리어',
    timeAgo: '3시간 전',
    description:
      '시디즈 T50 메쉬 의자입니다. 성능이 우수하며 편안한 착석감을 제공합니다. 거의 새 상품 수준입니다. 직거래 가능하며 로컬 배송도 가능합니다.',
    thumbnailColor: '#FF9500',
    views: 11,
    interests: 2,
    tradeLocation: '신사동 가로수길',
    isHeavy: true,
  },
  '2': {
    title: '게임이나 디자인, 3d 모델링하시는분!! (Dell 워크스테이션)',
    price: '750,000원',
    sellerName: '기술자',
    sellerLocation: '자양제3동',
    temperature: 45.8,
    category: '전자기기',
    timeAgo: '3시간 전',
    description:
      'Dell 워크스테이션입니다. 성능이 우수하며 디자인 작업에 최적화되어 있습니다. 상태는 매우 좋습니다.',
    thumbnailColor: '#282828',
    views: 128,
    interests: 5,
    tradeLocation: '자양동 거리',
    isHeavy: true,
  },
  '3': {
    title: '이거 다 가져가세요!!',
    price: '100,000원 할인',
    sellerName: '할인왕',
    sellerLocation: '논현동',
    temperature: 48.2,
    category: '기타',
    timeAgo: '5시간 전',
    description:
      '정리중이라 다 싸게 팔아야 해요. 품질은 좋으니 서둘러서 연락하세요!! 대량 구매도 환영합니다.',
    thumbnailColor: '#C8D8C8',
    views: 690,
    interests: 23,
    tradeLocation: '논현동 강남대로',
  },
  '4': {
    title: 'LG 그램스타일 16인치 그라파이트 그레이 울트라슬림 노트북',
    price: '1,200,000원',
    sellerName: '노트북매니아',
    sellerLocation: '압구정동',
    temperature: 47.5,
    category: '전자기기',
    timeAgo: '2시간 전',
    description:
      'LG 그램스타일 노트북 판매합니다. 매우 가볍고 휴대성이 좋습니다. 스크래치가 거의 없으며 배터리도 준수합니다.',
    thumbnailColor: '#E8D890',
    views: 156,
    interests: 18,
    tradeLocation: '압구정동 강남대로',
  },
  '5': {
    title: '애플 에어팟 프로 2세대 정품 (미개봉)',
    price: '280,000원',
    sellerName: '애플마니아',
    sellerLocation: '청담동',
    temperature: 44.1,
    category: '전자기기',
    timeAgo: '30분 전',
    description: '미개봉 새 상품입니다. 선물 받은 제품인데 사용하지 않아 판매합니다. 정품입니다.',
    thumbnailColor: '#FFFFFF',
    views: 32,
    interests: 22,
    tradeLocation: '청담동 명품거리',
  },
  '6': {
    title: '나이키 에어포스 1 화이트 275 (거의 새 상품)',
    price: '65,000원',
    sellerName: '스니커즈헌터',
    sellerLocation: '신사동',
    temperature: 43.5,
    category: '패션/의류',
    timeAgo: '1시간 전',
    description: '2회 착용한 에어포스1입니다. 상태 매우 좋습니다. 박스와 신발끈도 함께 제공됩니다.',
    thumbnailColor: '#F5F5F5',
    views: 18,
    interests: 8,
    tradeLocation: '신사동 가로수길',
  },
  '7': {
    title: '아이패드 에어 5세대 64GB 와이파이 (케이스 포함)',
    price: '550,000원',
    sellerName: '아이패드유저',
    sellerLocation: '역삼동',
    temperature: 46.0,
    category: '전자기기',
    timeAgo: '2시간 전',
    description: '아이패드 에어 5세대입니다. 케이스와 충전기 포함입니다. 거의 새 상품 수준입니다.',
    thumbnailColor: '#B0C4DE',
    views: 55,
    interests: 15,
    tradeLocation: '역삼역 2번 출구',
  },
  '8': {
    title: '다이슨 에어랩 컴플리트 롱 헤어스타일러',
    price: '380,000원',
    sellerName: '뷰티셀러',
    sellerLocation: '논현동',
    temperature: 47.2,
    category: '생활가전',
    timeAgo: '3시간 전',
    description: '다이슨 에어랩 롱 버전입니다. 모든 부속품 포함입니다. 정품 보증서 있습니다.',
    thumbnailColor: '#C8A870',
    views: 88,
    interests: 31,
    tradeLocation: '논현동 학동로',
    isHeavy: true,
  },
  '9': {
    title: '삼성 갤럭시 버즈 2 프로 보라색 (충전케이스 포함)',
    price: '120,000원',
    sellerName: '삼성유저',
    sellerLocation: '도곡동',
    temperature: 42.8,
    category: '전자기기',
    timeAgo: '4시간 전',
    description: '갤럭시 버즈2 프로 보라색입니다. 충전케이스 포함 판매합니다. 사용감 거의 없습니다.',
    thumbnailColor: '#9B89C4',
    views: 23,
    interests: 4,
    tradeLocation: '도곡역 1번 출구',
  },
  '10': {
    title: '브레빌 에스프레소 머신 바리스타 익스프레스',
    price: '650,000원',
    sellerName: '커피매니아',
    sellerLocation: '삼성동',
    temperature: 45.3,
    category: '주방가전',
    timeAgo: '5시간 전',
    description: '브레빌 바리스타 익스프레스입니다. 원두 그라인더 내장 모델입니다. 완벽하게 작동합니다.',
    thumbnailColor: '#A05030',
    views: 41,
    interests: 9,
    tradeLocation: '삼성동 코엑스 앞',
    isHeavy: true,
  },
  '11': {
    title: '소니 WH-1000XM5 노이즈캔슬링 헤드폰 블랙',
    price: '250,000원',
    sellerName: '음악마니아',
    sellerLocation: '서초동',
    temperature: 44.7,
    category: '전자기기',
    timeAgo: '6시간 전',
    description: '소니 WH-1000XM5 헤드폰입니다. 노이즈캔슬링 최상급입니다. 음질 정말 좋습니다.',
    thumbnailColor: '#222222',
    views: 67,
    interests: 12,
    tradeLocation: '서초역 6번 출구',
  },
  '12': {
    title: '캠핑 폴딩 체어 + 테이블 세트 (2인용)',
    price: '45,000원',
    sellerName: '캠핑러버',
    sellerLocation: '방배동',
    temperature: 41.2,
    category: '스포츠/레저',
    timeAgo: '12시간 전',
    description: '2인용 캠핑 폴딩 체어와 테이블 세트입니다. 야외활동에 딱입니다. 가볍고 튼튼합니다.',
    thumbnailColor: '#6B8E6B',
    views: 12,
    interests: 3,
    tradeLocation: '방배동 방배로',
    isHeavy: true,
  },
};

export function addProductDetail(id: string, detail: ProductDetail) {
  PRODUCT_DETAILS[id] = detail;
  saveUserProductDetails();
}

function saveUserProductDetails() {
  const userDetails: Record<string, ProductDetail> = {};
  Object.entries(PRODUCT_DETAILS).forEach(([k, v]) => {
    if (!STATIC_DETAIL_IDS.includes(k)) {
      userDetails[k] = v;
    }
  });
  AsyncStorage.setItem(DETAILS_KEY, JSON.stringify(userDetails)).catch(() => {});
}

export async function initProducts() {
  try {
    const raw = await AsyncStorage.getItem(DETAILS_KEY);
    if (raw) {
      const userDetails: Record<string, ProductDetail> = JSON.parse(raw);
      Object.assign(PRODUCT_DETAILS, userDetails);
    }
  } catch {}
}
