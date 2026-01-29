# 🔧 Supabase 설정 가이드

## 현재 상태
- ❌ **Supabase URL과 ANON_KEY가 설정되지 않음**
- ⚠️ 프리미엄 댄서가 표시되지 않는 이유

---

## 📋 설정 방법

### 1. Supabase 프로젝트 설정 확인

1. Supabase 대시보드 접속: https://app.supabase.com
2. 프로젝트 선택
3. Settings → API 메뉴 이동

### 2. API 정보 복사

다음 정보를 복사하세요:
- **Project URL**: `https://xxxxx.supabase.co`
- **Project API keys → anon public**: `eyJhbGc...` (긴 토큰)

### 3. supabase-config.js 수정

파일 위치: `js/supabase-config.js`

```javascript
// Before (현재 상태)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// After (수정 필요)
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 4. 저장 및 새로고침

1. 파일 저장
2. 브라우저 새로고침 (Ctrl + Shift + R)
3. 콘솔 확인: "✅ Supabase initialized"

---

## 🧪 테스트 방법

### 브라우저 콘솔에서 확인:

```javascript
// 1. Supabase 클라이언트 확인
console.log(window.supabase);
// 기대 결과: SupabaseClient 객체

// 2. 수동으로 데이터 가져오기
const { data, error } = await window.supabase
    .from('dancers')
    .select('*')
    .eq('is_premium', true);
console.log('데이터:', data);
console.log('에러:', error);
```

---

## 📊 데이터베이스 테이블 구조

### dancers 테이블

```sql
CREATE TABLE dancers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    genre TEXT,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_dancers_premium ON dancers(is_premium);

-- 샘플 데이터
INSERT INTO dancers (name, genre, is_premium) VALUES
('DJ Koo', 'Hip-Hop, Popping', true),
('Luna Park', 'Contemporary, Ballet', true),
('B-boy Storm', 'Breaking, Locking', true);
```

---

## 🔍 디버깅 로그

설정 후 브라우저 콘솔에서 다음 로그를 확인하세요:

```
✅ Supabase initialized
🎭 Fetching premium dancers...
🔍 Supabase available? true
🔄 Querying dancers table...
📦 댄서 데이터: [...]
✅ Loaded 3 premium dancers
🎨 Rendering premium dancers... 3 cards
✅ Premium dancers rendered to DOM
```

---

## ⚠️ Fallback 시스템

Supabase가 설정되지 않으면 **데모 댄서 3명**이 자동으로 표시됩니다:
- DJ Koo (Hip-Hop, Popping)
- Luna Park (Contemporary, Ballet)
- B-boy Storm (Breaking, Locking)

이미지는 Unsplash에서 랜덤으로 가져옵니다.

---

## 🚀 다음 단계

1. **Supabase 설정 완료**
2. **샘플 데이터 3개 추가**
3. **페이지 새로고침**
4. **콘솔 로그 확인**
5. **프리미엄 댄서 카드 표시 확인**

---

## 📞 문제 해결

### 문제: "Supabase library not loaded"
- **원인**: CDN에서 Supabase 라이브러리 로드 실패
- **해결**: 인터넷 연결 확인, 다른 CDN 시도

### 문제: "Error fetching premium dancers"
- **원인**: API 키 또는 URL이 잘못됨
- **해결**: Supabase 대시보드에서 정보 재확인

### 문제: "No premium dancers found"
- **원인**: dancers 테이블이 비어있거나 is_premium=true인 데이터 없음
- **해결**: 샘플 데이터 추가

---

## 📝 체크리스트

- [ ] Supabase URL 복사 완료
- [ ] ANON_KEY 복사 완료
- [ ] supabase-config.js 수정 완료
- [ ] dancers 테이블 생성 완료
- [ ] 샘플 데이터 3개 추가 완료
- [ ] 페이지 새로고침
- [ ] 콘솔에서 "✅ Supabase initialized" 확인
- [ ] 콘솔에서 "✅ Loaded X premium dancers" 확인
- [ ] 프리미엄 댄서 카드 화면에 표시 확인
