# 이미지 업로드 버그 수정 — 테스트 시나리오

## 환경 설정
- **테스트 URL**: http://localhost:8081
- **수정 커밋**: 7511603 (fix: 이미지 업로드 실패 시 사용자에게 알리기)
- **수정 파일**: src/app/write.tsx

---

## 테스트 케이스 1: 상품 수정 시 새 이미지 추가 (성공 케이스)

### 전제 조건
- 앱이 localhost:8081에서 실행 중
- Supabase 인증 완료
- 기존 상품이 DB에 존재

### 테스트 단계
1. 홈 화면 진입
2. 상품 목록에서 첫 번째 상품 클릭
3. 상품 상세 페이지에서 "..." 메뉴 → "수정하기" 클릭
4. 사진 추가 버튼 클릭
5. 로컬 이미지 파일 선택
6. "작성 완료" 버튼 클릭

### 예상 결과 ✅
- [ ] 이미지가 UI에 표시됨 (thumbnail 보여짐)
- [ ] 로딩 중 스피너 표시
- [ ] 성공 후: "수정이 되었습니다" 모달 표시
- [ ] 홈으로 자동 이동
- [ ] 상품 재확인 시 새 이미지가 포함됨
- [ ] 브라우저 콘솔에 에러 없음

### 브라우저 콘솔 확인
```
[No errors expected]
```

---

## 테스트 케이스 2: 이미지 업로드 실패 (네트워크 에러 시뮬레이션)

### 전제 조건
- Supabase Storage가 일시적으로 불가능한 상태
- 또는 인증 토큰이 만료된 상태

### 테스트 단계
1. 홈 화면 진입
2. 상품 클릭 → "수정하기"
3. 새 이미지 추가
4. "작성 완료" 클릭

### 예상 결과 ✅
- [ ] 로딩 중 스피너 표시
- [ ] **"일부 이미지 업로드에 실패했습니다. 네트워크를 확인하고 다시 시도해주세요."** 에러 메시지 표시
- [ ] DB 업데이트 안 됨 (이미지 없음)
- [ ] 사용자는 수정 화면에 머물러 있음
- [ ] 다시 시도 가능

### 브라우저 콘솔 확인
```
[error] 이미지 업로드 실패: [Supabase 에러 메시지]
```

---

## 테스트 케이스 3: 기존 이미지 + 새 이미지 혼합 (Edit 모드)

### 전제 조건
- 기존 이미지 2개가 이미 DB에 저장되어 있는 상품

### 테스트 단계
1. 상품 상세 → "수정하기"
2. 기존 이미지 1개 삭제 (X 버튼 클릭)
3. 새 이미지 1개 추가
4. "작성 완료" 클릭

### 예상 결과 ✅
- [ ] 기존 이미지 1개 + 새 이미지 1개 = 총 2개 저장
- [ ] 성공 모달 표시
- [ ] 홈으로 이동 후 확인 시 정확한 이미지 2개 표시
- [ ] 브라우저 콘솔에 에러 없음

### 로직 검증 (코드 레벨)
```typescript
// Line 329-330: 기존 이미지 (http URL) 그대로 사용
if (uri.startsWith('http')) {
  uploadedUrls.push(uri);
}

// Line 332-338: 새 이미지만 uploadPhoto 호출
const url = await uploadPhoto(uri);
if (url) {
  uploadedUrls.push(url);
} else {
  uploadFailed = true;  // 실패 추적
}
```

---

## 테스트 케이스 4: 이미지 없는 상품 수정 (텍스트만)

### 테스트 단계
1. 상품 상세 → "수정하기"
2. 제목만 변경 (이미지 추가 안 함)
3. "작성 완료" 클릭

### 예상 결과 ✅
- [ ] 로딩 표시
- [ ] 성공 모달 표시
- [ ] photos 배열이 비어있어 uploadPhoto 루프 실행 안 됨
- [ ] uploadedUrls가 빈 배열 → thumbnail_image: null 저장
- [ ] 콘솔 에러 없음

---

## 수정사항 검증 체크리스트

### 1. uploadPhoto 함수 (Line 12-42)
- ✅ contentType 빈 문자열 처리 (Line 16)
  ```ts
  const contentType = blob.type || 'image/jpeg';
  ```
- ✅ jpeg → jpg 변환 (Line 17)
  ```ts
  .replace('jpeg', 'jpg')
  ```
- ✅ 에러 로깅 추가 (Line 25)
  ```ts
  console.error('이미지 업로드 실패:', error.message, error);
  ```
- ✅ catch 블록에서 에러 캡처 (Line 38-40)
  ```ts
  } catch (e) {
    console.error('uploadPhoto 오류:', e);
  ```

### 2. Submit 핸들러 (Line 321-345)
- ✅ uploadFailed 플래그 추가 (Line 327)
- ✅ 업로드 실패 시 즉시 return (Line 341-345)
  ```ts
  if (uploadFailed) {
    setLoading(false);
    setError('일부 이미지 업로드에 실패했습니다...');
    return;
  }
  ```
- ✅ 에러 상태 초기화 (Line 324)
  ```ts
  setError('');
  ```

### 3. 에러 메시지 UI (Line 159-161)
- ✅ 에러 메시지가 화면에 표시됨
  ```ts
  {error ? (
    <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
  ) : null}
  ```

---

## 알려진 제한사항

### 1. RLS 정책 검증 필수
Storage `product-images` 버킷의 INSERT 정책:
- 현재: 인증된 사용자만 업로드 가능
- 확인 필요: Supabase 대시보드 → Storage → Policies

### 2. 인증 상태 확인
- 업로드 시 유효한 Supabase 세션 필요
- `supabase.auth.getSession()`으로 확인 가능

### 3. 에러 메시지 개선 사항 (향후)
- 구체적인 에러 원인을 사용자에게 전달 (현재는 일반적인 메시지)
- 예: "파일 크기 초과", "네트워크 연결 끊김", "권한 없음"

---

## 테스트 실행 방법

### 방법 1: 수동 테스트 (권장)
```bash
# 1. 터미널 1: 개발 서버 시작
npm run web

# 2. 브라우저 열기
open http://localhost:8081

# 3. 브라우저 개발자 도구 (F12) → Console 탭 열기

# 4. 위의 테스트 케이스 1-4 실행
```

### 방법 2: 자동화 테스트 (향후)
```bash
# Playwright/Puppeteer를 사용한 E2E 테스트
npm install --save-dev playwright
# test 파일 작성 필요
```

---

## 커밋 기록

```
Commit: 7511603
Author: Claude Haiku 4.5
Message: fix: 이미지 업로드 실패 시 사용자에게 알리기

Changes:
- uploadPhoto: blob.type 빈 문자열 처리
- contentType 명시적 설정 (기본값: image/jpeg)
- 에러 메시지 콘솔 로깅
- submit 핸들러: uploadFailed 플래그 추가
- 업로드 실패 시 DB 업데이트 안 함
- 사용자에게 에러 메시지 표시
```

---

## 다음 단계

1. **현재**: 코드 리뷰 완료 ✅
2. **현재**: 테스트 시나리오 문서화 ✅
3. **필요**: 수동 테스트 실행 및 결과 기록
4. **권장**: E2E 자동화 테스트 작성
5. **권장**: Supabase RLS 정책 재검토

---

## 문의사항

테스트 중 문제 발생 시:
1. 브라우저 콘솔에서 "이미지 업로드 실패" 메시지 확인
2. Supabase 대시보드 → Logs에서 Storage 업로드 실패 로그 확인
3. 네트워크 탭에서 업로드 요청 상태 코드 확인
