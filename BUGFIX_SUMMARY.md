# 🐛 버그 수정 완료: 상품 수정 시 이미지 업로드 안 됨

## 📋 개요

**문제**: 상품 목록에서 상품을 클릭 후 수정할 때, 새로운 이미지를 추가해도 업로드되지 않는 현상

**해결**: Commit 7511603에서 이미지 업로드 에러 처리 강화

**상태**: ✅ 완료 (2026-06-20)

---

## 🔍 근본 원인 분석

### 1차 원인: 에러 무시
```typescript
// 이전 코드 (line 23)
if (error || !data) return null;  // 에러만 return, 사용자는 모름
```
- Supabase Storage 업로드 실패해도 조용히 null 반환
- 사용자는 "수정이 되었습니다" 모달만 봄
- 콘솔에 에러 로그 없어서 디버깅 불가능

### 2차 원인: blob.type 빈 문자열
```typescript
// 이전 코드 (line 16)
const ext = blob.type.split('/')[1] || 'jpg';
const { data, error } = await supabase.storage.upload(path, blob, { 
  contentType: blob.type  // ← '' (빈 문자열)이면 Supabase 거부
});
```
- web 환경에서 ImagePicker가 반환한 blob.type이 비어있을 수 있음
- contentType이 빈 문자열이면 Supabase가 업로드 거부

### 3차 영향: DB 업데이트 안 됨
- 업로드 실패 → uploadedUrls에 새 이미지 없음
- DB에 저장되는 것은 기존 이미지만
- 사용자가 실패 원인을 모름

---

## ✅ 해결 방법

### 수정 1: uploadPhoto 강화 (Line 12-42)

```typescript
async function uploadPhoto(uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // ✅ 1. blob.type 빈 문자열 처리
    const contentType = blob.type || 'image/jpeg';
    const ext = (contentType.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const path = `${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, blob, { contentType });

    // ✅ 2. 에러 명시적으로 로깅
    if (error) {
      console.error('이미지 업로드 실패:', error.message, error);
      return null;
    }
    if (!data) {
      console.error('이미지 업로드 실패: 데이터 없음');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (e) {
    // ✅ 3. catch 블록에서도 에러 로깅
    console.error('uploadPhoto 오류:', e);
    return null;
  }
}
```

**변화**:
- ✅ contentType 명시적 설정 (기본값: image/jpeg)
- ✅ 에러 메시지 콘솔에 기록
- ✅ jpeg → jpg 확장자 정규화
- ✅ 모든 에러 경로에서 로깅

### 수정 2: Submit 핸들러 개선 (Line 321-345)

```typescript
onPress={async () => {
  if (!title) return;
  setLoading(true);
  setError('');  // ✅ 이전 에러 상태 초기화

  const uploadedUrls: string[] = [];
  let uploadFailed = false;  // ✅ 업로드 실패 추적
  
  for (const uri of photos) {
    if (uri.startsWith('http')) {
      uploadedUrls.push(uri);  // 기존 이미지 그대로 사용
    } else {
      const url = await uploadPhoto(uri);
      if (url) {
        uploadedUrls.push(url);
      } else {
        uploadFailed = true;  // ✅ 실패 기록
      }
    }
  }

  // ✅ 업로드 실패 시 즉시 return
  if (uploadFailed) {
    setLoading(false);
    setError('일부 이미지 업로드에 실패했습니다. 네트워크를 확인하고 다시 시도해주세요.');
    return;
  }

  // 이후로는 성공한 이미지만 DB에 저장
  const productData = {
    // ... (나머지 코드)
    thumbnail_image: uploadedUrls[0] ?? null,
    images: uploadedUrls.length > 0 ? uploadedUrls : null,
  };
  
  // DB 업데이트 진행...
}}
```

**변화**:
- ✅ uploadFailed 플래그로 실패 추적
- ✅ 업로드 실패 시 DB 업데이트 진행 안 함
- ✅ 사용자에게 명확한 에러 메시지 표시
- ✅ 에러 상태 초기화로 중복 에러 방지

---

## 🧪 테스트 검증

### 테스트 1: 정상 업로드 (성공 케이스)
```
1. 상품 상세 → "수정하기"
2. 새 이미지 추가
3. "작성 완료" 클릭
4. 예상: "수정이 되었습니다" 모달 → 새 이미지 저장됨
5. 콘솔: 에러 없음
```

### 테스트 2: 업로드 실패 (에러 케이스)
```
1. 상품 상세 → "수정하기"  
2. 새 이미지 추가
3. 네트워크 끊김 (또는 Storage 인증 실패)
4. "작성 완료" 클릭
5. 예상: "일부 이미지 업로드에 실패했습니다..." 에러 메시지
6. 콘솔: [error] 이미지 업로드 실패: [상세 에러]
```

### 테스트 3: Edit 모드 (기존 + 새 이미지)
```
1. 기존 이미지 2개가 있는 상품 수정
2. 기존 이미지 1개 삭제 + 새 이미지 1개 추가
3. "작성 완료" 클릭
4. 예상: 총 2개 이미지 저장 (기존 1개 + 새로운 1개)
```

---

## 📝 수정된 파일

| 파일 | 변경 내용 | 라인 |
|------|----------|------|
| `src/app/write.tsx` | uploadPhoto 함수 강화 | 12-42 |
| `src/app/write.tsx` | submit 핸들러 개선 | 321-345 |

---

## 🔗 커밋 정보

```
Commit: 7511603
Author: Claude + User
Date: 2026-06-20

Message: fix: 이미지 업로드 실패 시 사용자에게 알리기

- uploadPhoto에서 blob.type 빈 문자열 처리
- contentType 명시적으로 설정 (기본값: image/jpeg)
- 에러 메시지를 콘솔에 로깅하여 디버깅 용이
- submit 핸들러에서 uploadFailed 플래그로 실패 추적
- 업로드 실패 시 사용자에게 에러 메시지 표시
- 성공 시에만 DB 업데이트 진행

문제: 이전에는 이미지 업로드 실패해도 무시되어 사용자가 이유를 모름
해결: 명시적 에러 처리로 실패 원인 파악 가능
```

---

## 🚀 다음 단계

### 즉시 실행
- [ ] `npm run web` 실행
- [ ] localhost:8081에서 테스트 케이스 1-3 실행
- [ ] 브라우저 콘솔에서 에러 메시지 확인

### 향후 개선
- [ ] E2E 자동화 테스트 추가 (Playwright)
- [ ] 에러 메시지 세분화 (구체적인 원인 표시)
- [ ] RLS 정책 재검토 및 보안 강화
- [ ] 업로드 진행 상태 표시 (Progress Bar)

---

## 📋 체크리스트

### 코드 변경사항
- ✅ uploadPhoto: blob.type 처리
- ✅ uploadPhoto: 에러 로깅
- ✅ submit: uploadFailed 플래그
- ✅ submit: 사용자 피드백
- ✅ 기존 이미지 vs 새 이미지 구분 로직

### 테스트 준비
- ✅ 테스트 시나리오 문서화
- ✅ 예상 결과 정의
- ✅ 콘솔 에러 메시지 정의

### 문서화
- ✅ 버그 원인 분석
- ✅ 해결 방법 설명
- ✅ 테스트 가이드 작성

---

## 📞 문의

테스트 중 문제 발생 시:
1. 브라우저 F12 → Console 탭에서 "이미지 업로드 실패" 메시지 확인
2. Supabase 대시보드 → Logs에서 Storage 업로드 로그 확인
3. Network 탭에서 업로드 요청 상태 코드 (4xx/5xx) 확인
