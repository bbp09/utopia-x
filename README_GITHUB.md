# 🎭 UTOPIA X - AI 기반 댄서 캐스팅 에이전시

AI 기술을 활용한 혁신적인 댄서 캐스팅 플랫폼

## 🌟 주요 기능

### ✅ 완성된 기능
- 🎨 **현대적인 UI/UX 디자인**
- 🤖 **AI 기반 댄서 매칭 시스템**
- 👤 **로그인/회원가입 시스템** (Supabase Auth)
- 💳 **크레딧 시스템** (댄서 프로필 조회)
- 📊 **대시보드** (Client/Artist 분리)
- 🎯 **댄서 섭외 폼**
- 🎪 **아티스트 등록 폼**
- 👨‍💼 **관리자 페이지** (댄서 관리)

### 🚧 진행 중
- Supabase 완전 연동
- 실시간 알림 시스템
- 결제 시스템 통합

## 🛠️ 기술 스택

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome Icons
- Google Fonts (Noto Sans KR, Montserrat)

### Backend & Services
- Supabase (Authentication & Database)
- RESTful Table API
- LocalStorage (Mock Database)

### Deployment
- Netlify (추천)
- GitHub Pages
- Vercel

## 📁 프로젝트 구조

```
utopia-x-dancer-casting/
├── index.html                 # 메인 페이지
├── admin.html                 # 관리자 페이지
├── client-dashboard.html      # 클라이언트 대시보드
├── artist-dashboard.html      # 아티스트 대시보드
├── css/
│   ├── style.css             # 메인 스타일
│   ├── admin.css             # 관리자 스타일
│   └── auth.css              # 인증 스타일
├── js/
│   ├── main.js               # 메인 로직
│   ├── admin.js              # 관리자 로직
│   ├── credit-system.js      # 크레딧 시스템
│   ├── supabase-config.js    # Supabase 설정
│   └── supabase-auth.js      # 인증 로직
├── netlify/
│   └── functions/            # Serverless Functions
├── .env.example              # 환경변수 예시
├── netlify.toml              # Netlify 설정
└── README.md                 # 프로젝트 문서
```

## 🚀 시작하기

### 1. 프로젝트 클론
```bash
git clone https://github.com/YOUR_USERNAME/utopia-x-dancer-casting.git
cd utopia-x-dancer-casting
```

### 2. Supabase 설정
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `.env.example`을 복사하여 `.env` 생성
3. `js/supabase-config.js`에 API 키 입력:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

### 3. 로컬 서버 실행
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# VS Code Live Server 확장 사용
```

### 4. 브라우저에서 열기
```
http://localhost:8000
```

## 📊 데이터베이스 스키마

### Dancers Table
```sql
CREATE TABLE dancers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  styles JSONB,
  experience TEXT,
  portfolio_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table (Supabase Auth)
- Email/Password 인증
- User Metadata에 role 저장 (client/artist)

## 🧪 테스트 계정

### 데모 모드 (Supabase 미설정 시)
- 이메일: test@test.com
- 비밀번호: test1234
- 유형: Client

### 관리자 계정
- 경로: `/admin.html`
- 비밀번호: admin1234

## 📝 주요 문서

- `AUTH_SYSTEM_COMPLETE.md` - 인증 시스템 완성 가이드
- `CREDIT_SYSTEM_GUIDE.md` - 크레딧 시스템 사용법
- `DEPLOYMENT_GUIDE.md` - 배포 가이드
- `ADMIN_GUIDE.md` - 관리자 페이지 가이드

## 🐛 알려진 이슈

현재 해결 중인 문제들:
- [ ] main.js 파싱 에러 ("Unexpected token '{'")
- [ ] 로그인 버튼 클릭 이슈 (state 변수 참조)
- [ ] Mock Database 회원가입 데이터 저장

자세한 내용은 `BUGFIX_*.md` 파일들을 참고하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📞 연락처

Instagram: [@utopia.xcrew](https://instagram.com/utopia.xcrew)

---

Made with ❤️ by UTOPIA X Team
