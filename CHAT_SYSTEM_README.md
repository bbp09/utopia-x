# 💬 UTOPIA X - 1:1 실시간 채팅 시스템

## 📋 개요

클라이언트와 아티스트 간의 실시간 1:1 채팅 시스템입니다.
Supabase Realtime을 활용하여 즉시 메시지를 주고받을 수 있습니다.

---

## 🗄️ 데이터베이스 설정

### 1. Supabase 콘솔에서 SQL 실행

**파일**: `database/messages-table.sql`

1. Supabase 대시보드 접속
2. SQL Editor 열기
3. `messages-table.sql` 내용 복사하여 실행

### 2. 테이블 구조

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
```

### 3. Row Level Security (RLS) 정책

- ✅ 사용자는 자신이 보낸/받은 메시지만 조회 가능
- ✅ 사용자는 자신의 이름으로만 메시지 전송 가능
- ✅ 사용자는 받은 메시지의 읽음 상태만 업데이트 가능

---

## 📦 파일 구조

```
webapp/
├── js/
│   └── chat.js              # ChatModule (독립 모듈)
├── css/
│   └── chat.css             # 채팅 UI 스타일
├── database/
│   └── messages-table.sql   # DB 테이블 생성 SQL
├── client-dashboard.html    # 클라이언트 대시보드 (채팅 버튼)
└── index.html               # 메인 페이지 (댄서 프로필 연동)
```

---

## 🚀 기능

### 1️⃣ 채팅 목록 (Chat List)

**위치**: Client Dashboard → "1:1 채팅 (Messages)" 버튼

**기능**:
- ✅ 최근 대화 목록 표시
- ✅ 읽지 않은 메시지 개수 배지
- ✅ 마지막 메시지 미리보기
- ✅ 시간 표시 (방금 전, N분 전, N시간 전)

**코드**:
```javascript
// Open chat list
await ChatModule.loadConversations();
```

---

### 2️⃣ 1:1 채팅창 (Chat Window)

**기능**:
- ✅ 대화 내역 불러오기
- ✅ 실시간 메시지 수신
- ✅ 메시지 전송
- ✅ 자동 스크롤 (새 메시지 시)
- ✅ 읽음 처리

**코드**:
```javascript
// Open chat with partner
await ChatModule.openChatWith(partnerId, partnerName, partnerEmail);
```

---

### 3️⃣ 댄서 프로필 연동

**위치**: 댄서 프로필 카드

**기능**:
- "1:1 문의하기" 버튼 추가
- 클릭 시 해당 댄서와 채팅창 열림

**사용법**:
```html
<!-- 댄서 카드에 버튼 추가 -->
<button onclick="openChatWithDancer('dancer-uuid', '댄서이름', 'email@example.com')">
    <i class="fas fa-comment"></i> 1:1 문의하기
</button>
```

---

## 🔧 ChatModule API

### 초기화
```javascript
await ChatModule.init();
```

### 채팅 목록 불러오기
```javascript
const conversations = await ChatModule.loadConversations();
// Returns: [{ partnerId, lastMessage, lastMessageTime, unreadCount }]
```

### 메시지 불러오기
```javascript
const messages = await ChatModule.loadMessages(partnerId);
// Returns: [{ id, sender_id, receiver_id, content, created_at, is_read }]
```

### 메시지 전송
```javascript
const result = await ChatModule.sendMessage(receiverId, content);
// Returns: { success: true/false, data/error }
```

### 읽음 처리
```javascript
await ChatModule.markAsRead(senderId);
```

### 실시간 구독
```javascript
ChatModule.subscribeToMessages(partnerId);
```

### 구독 해제
```javascript
ChatModule.unsubscribe();
```

### 채팅창 열기
```javascript
await ChatModule.openChatWith(partnerId, partnerName, partnerEmail);
```

### 채팅창 닫기
```javascript
ChatModule.closeChatModal();
```

---

## 🎨 UI 커스터마이징

### CSS 변수 (css/chat.css)

```css
/* 채팅 말풍선 색상 */
.chat-message.sent {
    background: var(--primary-gradient);  /* 보낸 메시지 */
}

.chat-message.received {
    background: var(--bg-card);          /* 받은 메시지 */
}

/* 배지 색상 */
.badge-notification {
    background: var(--accent-red);
}
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 채팅 목록 확인
1. 클라이언트 대시보드 접속
2. "1:1 채팅 (Messages)" 클릭
3. ✅ 대화 목록 표시
4. ✅ 읽지 않은 메시지 배지 표시

### 시나리오 2: 메시지 전송
1. 채팅 목록에서 상대방 선택
2. 메시지 입력 후 전송
3. ✅ 즉시 화면에 표시
4. ✅ Supabase에 저장

### 시나리오 3: 실시간 수신
1. A 사용자: 메시지 전송
2. B 사용자: 채팅창 열린 상태
3. ✅ B 사용자에게 즉시 메시지 표시
4. ✅ 자동으로 읽음 처리

### 시나리오 4: 댄서 프로필에서 문의
1. 홈 페이지에서 댄서 카드 클릭
2. "1:1 문의하기" 버튼 클릭
3. ✅ 해당 댄서와 채팅창 열림
4. ✅ 메시지 전송 가능

---

## 🔒 보안 고려사항

### 1. Row Level Security (RLS)
- ✅ 사용자는 자신의 메시지만 접근 가능
- ✅ 다른 사용자의 메시지는 조회 불가

### 2. 인증 확인
```javascript
// 로그인 체크
const userEmail = sessionStorage.getItem('userEmail');
if (!userEmail || userEmail === 'Login') {
    showToast('로그인이 필요한 서비스입니다', 'info');
    return;
}
```

### 3. XSS 방지
```javascript
// HTML 이스케이프
escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

---

## 📊 성능 최적화

### 1. 인덱스
```sql
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### 2. 쿼리 최적화
- ✅ 필요한 필드만 SELECT
- ✅ LIMIT 사용
- ✅ 복합 인덱스 활용

### 3. 실시간 구독 관리
- ✅ 채팅창 닫을 때 구독 해제
- ✅ 메모리 누수 방지

---

## 🐛 트러블슈팅

### 문제: 메시지가 전송되지 않음
**해결**:
1. Supabase 연결 확인: `console.log(window.supabase)`
2. RLS 정책 확인: SQL Editor에서 테스트
3. 네트워크 탭에서 요청 확인

### 문제: 실시간 수신이 안 됨
**해결**:
1. Supabase Realtime 활성화 확인
2. 구독 상태 확인: `ChatModule.state.isConnected`
3. 브라우저 콘솔에서 에러 확인

### 문제: 읽지 않은 메시지 개수가 안 맞음
**해결**:
1. `updateUnreadCount()` 호출
2. 캐시 삭제 후 새로고침
3. DB에서 직접 확인: `SELECT COUNT(*) FROM messages WHERE receiver_id=... AND is_read=false`

---

## 🚀 향후 개선 사항

### 추가 기능 아이디어
- [ ] 이미지/파일 전송
- [ ] 음성 메시지
- [ ] 그룹 채팅
- [ ] 메시지 검색
- [ ] 푸시 알림
- [ ] 온라인 상태 표시
- [ ] 타이핑 중... 표시
- [ ] 메시지 삭제
- [ ] 차단 기능

---

## 📞 지원

문제가 있거나 질문이 있으면:
- GitHub Issues: [프로젝트 저장소]
- 이메일: support@utopiax.com

---

## 📝 라이센스

MIT License

Copyright (c) 2024 UTOPIA X

---

**Made with 💜 by UTOPIA X Team**
