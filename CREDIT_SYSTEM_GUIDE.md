# 💰 UTOPIA X 크레딧 시스템 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [크레딧 정책](#크레딧-정책)
3. [사용자 흐름](#사용자-흐름)
4. [데이터베이스 구조](#데이터베이스-구조)
5. [주요 기능](#주요-기능)
6. [테스트 방법](#테스트-방법)

---

## 🎯 시스템 개요

**UTOPIA X v5.0**부터 크레딧 기반 비즈니스 모델을 도입합니다.

### 핵심 원칙
- ✅ **AI 매칭은 무료** - 누구나 Top 5 추천 받을 수 있음
- 💰 **연락처 공개는 유료** - 1 크레딧으로 댄서 연락처 확인
- 🎁 **신규 가입 시 10 크레딧 무료** - 즉시 10명 연락처 확인 가능
- ⭐ **프리미엄 협찬 댄서는 무료** - 무한 슬라이더의 특별 댄서

---

## 💳 크레딧 정책

### 가격표
| 패키지 | 크레딧 | 정가 | 할인가 | 할인율 | 단가 |
|--------|--------|------|--------|--------|------|
| **기본** | 10 C | 55,000원 | 55,000원 | - | 5,500원/C |
| **인기** | 50 C | 275,000원 | **247,500원** | 10% | 4,950원/C |
| **추천** | 100 C | 550,000원 | **451,000원** | 18% | 4,510원/C |
| **최고 혜택** | 200 C | 1,100,000원 | **803,000원** | 27% | 4,015원/C |

### 크레딧 사용처
- **연락처 공개**: 1 Credit
  - 전화번호 (숨김 → 공개)
  - 이메일 (숨김 → 공개)
  - 인스타그램 (숨김 → 공개)
- **1:1 채팅방 개설**: 예정 (추후 구현)

### 중복 방지
- ✅ 같은 댄서 연락처는 **첫 1회만 크레딧 차감**
- ✅ 이미 확인한 댄서는 무료로 다시 볼 수 있음
- ✅ `usedDancers` 배열에 ID 저장

---

## 🔄 사용자 흐름

### 1️⃣ 최초 방문 (Guest)
```
웹사이트 접속
    ↓
로그인 모달 자동 표시
    ↓
이메일 입력 → 로그인/가입
    ↓
✅ 10 크레딧 자동 지급
    ↓
헤더에 잔여 크레딧 표시 (10 C)
```

### 2️⃣ AI 매칭 (무료)
```
댄서 섭외하기 클릭
    ↓
프로젝트 정보 + AI 프롬프트 입력
    ↓
AI 매칭 신청하기
    ↓
✅ Top 5 추천 댄서 표시 (무료)
    ↓
기본 정보 확인 가능:
- 이름, 사진, 전문 분야
- 나이, 키, 평점
- 매칭 점수, 추천 이유
```

### 3️⃣ 연락처 공개 (유료)
```
[연락처 보기 (1 Credit)] 버튼 클릭
    ↓
IF (잔여 크레딧 > 0):
    "1 크레딧을 사용하여 연락처를 확인하시겠습니까?"
    ↓ [확인]
    ✅ 크레딧 1 차감 (10 C → 9 C)
    ✅ 연락처 즉시 공개
    ✅ usedDancers에 ID 추가
    
IF (잔여 크레딧 == 0):
    "크레딧이 부족합니다"
    ↓
    [크레딧 충전 모달] 자동 표시
```

### 4️⃣ 크레딧 충전 (Mockup)
```
우측 상단 유저 메뉴 클릭
    ↓
[크레딧 충전] 버튼
    ↓
4가지 패키지 선택
    ↓
[충전하기] 버튼 클릭
    ↓
확인 다이얼로그 (Mockup 결제)
    ↓ [확인]
    ✅ 크레딧 증가
    ✅ purchaseHistory에 기록
    ✅ Toast 알림 표시
```

### 5️⃣ 프리미엄 협찬 댄서 (무료)
```
무한 슬라이더에서 ⭐프리미엄 카드 클릭
    ↓
상세 모달 표시
    ↓
✅ 이메일/인스타그램 즉시 공개 (무료)
❌ 전화번호는 제외
💡 크레딧 차감 없음
```

---

## 🗄️ 데이터베이스 구조

### users 테이블 (7개 필드)
```javascript
{
  id: "UUID",
  email: "user@example.com",      // 고유 식별자
  credits: 10,                     // 잔여 크레딧 (초기값: 10)
  usedDancers: ["D001", "D003"],   // 잠금 해제한 댄서 ID 목록
  purchaseHistory: [               // 구매 내역
    { date: 1704067200000, credits: 50, price: 247500, method: "mockup" }
  ],
  createdAt: 1704067200000,        // 가입일
  lastLogin: 1704153600000         // 마지막 로그인
}
```

### dancers 테이블 (37개 필드 - 연락처 추가)
```javascript
{
  id: "UUID",
  name: "Luna",
  // ... 기존 필드 (20개 태그, 기본 정보)
  
  // ✨ 신규 필드 (크레딧 시스템용)
  phone: "010-1234-5678",        // 전화번호 (숨김 처리)
  email: "luna@utopiax.kr",      // 이메일 (숨김 처리)
  instagram: "@luna_dancer"       // 인스타그램 (숨김 처리)
}
```

### featured_dancers 테이블 (11개 필드)
```javascript
{
  id: "UUID",
  name: "Premium Dancer",
  name_en: "Premium",
  image_url: "...",
  video_url: "...",
  specialty: "K-pop, Contemporary",
  email: "premium@utopiax.kr",      // 공개 (무료)
  instagram: "@premium_dancer",     // 공개 (무료)
  bio: "프리미엄 협찬 댄서입니다",
  displayOrder: 1,                  // 슬라이더 순서
  isActive: true                    // 활성화 여부
}
```

---

## 🛠️ 주요 기능

### 1. 사용자 인증 (js/credit-system.js)

#### checkUserSession()
```javascript
// localStorage에서 이메일 확인
// DB에서 사용자 정보 로드
// 세션 복원 또는 로그인 모달 표시
```

#### loginOrRegister(email)
```javascript
// 기존 사용자: 로그인
// 신규 사용자: 가입 + 10 크레딧 지급
// localStorage에 세션 저장
```

#### logout()
```javascript
// localStorage 세션 삭제
// 로그인 모달 표시
```

### 2. 크레딧 관리

#### purchaseCredits(credits, price)
```javascript
// Mockup 결제 확인
// users 테이블 업데이트 (credits, purchaseHistory)
// UI 갱신 + Toast 알림
```

#### unlockDancerContact(dancerId)
```javascript
// 로그인 확인
// 중복 확인 (usedDancers)
// 크레딧 확인 (< 1이면 충전 모달)
// 확인 다이얼로그
// 크레딧 차감 + usedDancers 추가
// UI 갱신 (연락처 공개)
```

#### isContactUnlocked(dancerId)
```javascript
// usedDancers 배열에 ID 존재 여부 확인
// true: 이미 공개됨 (무료 재확인 가능)
// false: 미공개 (1 Credit 필요)
```

### 3. UI 컴포넌트

#### 유저 메뉴 드롭다운
```html
<div class="user-menu">
  <button class="user-menu-btn">
    👤 user@email.com ▼
  </button>
  <div class="user-menu-dropdown">
    <div class="credit-display">
      💰 10 C
    </div>
    <button>크레딧 충전</button>
    <a>내 정보</a>
    <a>구매 내역</a>
    <a>잠금 해제 댄서</a>
    <a>로그아웃</a>
  </div>
</div>
```

#### 매칭 결과 - 연락처 버튼
```html
<!-- 미공개 -->
<button onclick="handleUnlockContact('D001')">
  🔒 연락처 보기 (1 Credit)
</button>

<!-- 공개됨 -->
<div class="contact-unlocked">
  <h5>🔓 연락처</h5>
  <p>📞 010-1234-5678</p>
  <p>📧 dancer@utopiax.kr</p>
  <p>📷 @dancer_instagram</p>
</div>
```

#### 프리미엄 댄서 카드
```html
<div class="dancer-card-compact featured">
  <div class="featured-badge">
    ⭐ 프리미엄
  </div>
  <div class="featured-contact-preview">
    <p>📧 이메일 공개</p>
    <p>📷 SNS 공개</p>
    <p>🎁 크레딧 불필요</p>
  </div>
</div>
```

---

## 🧪 테스트 방법

### 1. 로컬 테스트

#### A. 신규 사용자 가입
```
1. index.html 열기
2. 로그인 모달 자동 표시 확인
3. 이메일 입력: test@utopiax.kr
4. [로그인/가입하기] 클릭
5. Toast 확인: "회원가입 완료! 10 크레딧 지급"
6. 헤더 확인: test@utopiax.kr, 10 C
```

#### B. AI 매칭 + 연락처 공개
```
1. [댄서 섭외하기] 클릭
2. 프롬프트 입력: "귀여운 금발 여성 댄서"
3. [AI 매칭 신청하기]
4. Top 5 결과 확인
5. 첫 번째 댄서 [연락처 보기 (1 Credit)] 클릭
6. 확인 다이얼로그: "1 크레딧을 사용하시겠습니까?"
7. [확인]
8. Toast: "연락처가 공개되었습니다 (-1 Credit)"
9. 헤더 확인: 9 C
10. 연락처 즉시 표시 확인
```

#### C. 중복 방지 확인
```
1. 같은 댄서 카드 다시 열기
2. 연락처 즉시 표시 (버튼 없음)
3. 크레딧 차감 없음 (9 C 유지)
```

#### D. 크레딧 부족 시나리오
```
1. F12 → Console
2. state.currentUser.credits = 0 입력
3. updateUserUI() 입력
4. 헤더 확인: 0 C
5. [연락처 보기] 클릭
6. Toast: "크레딧이 부족합니다"
7. 충전 모달 자동 표시
```

#### E. 크레딧 충전 (Mockup)
```
1. 우측 상단 👤 클릭
2. [크레딧 충전] 클릭
3. 50 크레딧 패키지 선택
4. [충전하기] 클릭
5. 확인 다이얼로그: "247,500원에 구매하시겠습니까?"
6. [확인]
7. Toast: "50 크레딧이 충전되었습니다!"
8. 헤더 확인: 50 C
```

#### F. 프리미엄 댄서 (무료)
```
1. 무한 슬라이더에서 ⭐프리미엄 카드 클릭
2. 상세 모달 표시
3. 이메일/인스타그램 즉시 확인 (무료)
4. 크레딧 변화 없음
```

### 2. 배포 후 테스트

#### 데이터베이스 확인
```bash
# 브라우저 Console (F12)

# 현재 사용자 확인
console.log(state.currentUser);

# 전체 사용자 조회
fetch('tables/users?limit=10')
  .then(r => r.json())
  .then(d => console.table(d.data));

# 특정 사용자 구매 내역
console.table(state.currentUser.purchaseHistory);

# 잠금 해제한 댄서 목록
console.log(state.currentUser.usedDancers);
```

---

## 🚀 다음 단계 (Phase 2)

### 1. 실제 결제 연동
- 토스페이먼츠 / 카카오페이 / 네이버페이
- 결제 완료 웹훅 처리
- 환불 정책 구현

### 2. 1:1 채팅방
- 댄서-클라이언트 실시간 채팅
- 크레딧 차감 (채팅방 개설 시)
- 모바일 웹 지원

### 3. 관리자 기능
- 크레딧 수동 지급/차감
- 사용자 구매 내역 조회
- 수익 통계 대시보드

### 4. 알림 시스템
- 크레딧 부족 알림 (5 C 이하)
- 충전 성공 이메일
- 댄서 섭외 진행 상황

---

## 📞 문의 및 지원

- **이메일**: contact@utopiax.com
- **인스타그램**: @utopiax_official
- **도메인**: [utopiax.kr](https://utopiax.kr)

---

Made with 💜 by **UTOPIA X Team**  
© 2026 UTOPIA X. All rights reserved.

**🎉 크레딧 시스템 v5.0 성공적으로 구현 완료!**
