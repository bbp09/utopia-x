# 🚀 UTOPIA X 배포 가이드

**도메인**: utopiax.kr  
**호스팅**: Netlify (무료)  
**배포일**: 2026-01-28  
**보안**: ✅ API Key 보호, ✅ 강력한 관리자 비밀번호

---

## 📋 목차

1. [배포 준비 체크리스트](#배포-준비-체크리스트)
2. [Netlify 배포 단계](#netlify-배포-단계)
3. [가비아 DNS 설정](#가비아-dns-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [배포 후 테스트](#배포-후-테스트)
6. [문제 해결 (Troubleshooting)](#문제-해결)

---

## ✅ 배포 준비 체크리스트

### 보안 설정 완료
- [x] Gemini API Key → Netlify Functions로 이동 (`netlify/functions/gemini-analyze.js`)
- [x] 관리자 비밀번호 변경: `Utopia2024!@#$`
- [x] HTTPS 자동 리다이렉트 설정
- [x] CORS 설정 완료

### 파일 구조 확인
```
UTOPIA-X/
├── index.html                    # 메인 페이지
├── admin.html                    # 관리자 페이지
├── netlify.toml                  # Netlify 설정
├── _redirects                    # 리다이렉트 규칙
├── .env.example                  # 환경 변수 예시
├── css/
│   ├── style.css                 # 메인 스타일
│   └── admin.css                 # 관리자 스타일
├── js/
│   ├── main.js                   # 메인 JavaScript (Gemini 연동)
│   └── admin.js                  # 관리자 JavaScript
├── netlify/
│   └── functions/
│       └── gemini-analyze.js     # Gemini API Serverless Function
└── README.md
```

---

## 🌐 Netlify 배포 단계

### Step 1: Netlify 회원가입

1. **Netlify 사이트 접속**: https://www.netlify.com
2. **Sign up** 클릭 (GitHub, GitLab, Bitbucket, Email 중 선택)
3. 무료 계정 생성 (Free tier: 무제한 사이트, 월 100GB 대역폭)

---

### Step 2: 프로젝트 파일 업로드

#### 방법 1: 드래그 앤 드롭 (권장)

1. **Netlify 대시보드** 접속
2. **Add new site** → **Deploy manually** 클릭
3. 프로젝트 폴더 전체를 드래그 앤 드롭

   **중요**: 다음 파일/폴더를 포함해야 합니다:
   ```
   ✅ index.html
   ✅ admin.html
   ✅ css/ (style.css, admin.css)
   ✅ js/ (main.js, admin.js)
   ✅ netlify/ (functions/gemini-analyze.js)
   ✅ netlify.toml
   ✅ _redirects
   ```

4. 업로드 완료 → 자동 배포 시작 (약 30초 소요)
5. 배포 완료 후 임시 URL 발급 (예: `https://utopiax-kr-123abc.netlify.app`)

#### 방법 2: GitHub 연동 (추천 - 자동 배포)

1. GitHub에 저장소 생성 (private/public)
2. 프로젝트 파일 푸시
3. Netlify에서 **Import from Git** 선택
4. GitHub 저장소 선택
5. Build settings:
   - Build command: (비워둠)
   - Publish directory: `.` (루트 디렉토리)
6. Deploy site 클릭

---

### Step 3: 환경 변수 설정

1. **Netlify 대시보드** → **Site settings** → **Environment variables**
2. **Add a variable** 클릭
3. 다음 변수 추가:

| Key | Value | Scopes |
|-----|-------|--------|
| `GEMINI_API_KEY` | `AIzaSyBwhrtgWCJ0WsFaHy4ng9eBKjkrVJflLvU` | All (Production, Deploy Previews, Branch deploys) |

4. **Save** 클릭
5. **Trigger deploy** → **Clear cache and deploy site** (환경 변수 적용)

---

### Step 4: 커스텀 도메인 설정

1. **Site settings** → **Domain management**
2. **Add custom domain** 클릭
3. 도메인 입력: `utopiax.kr`
4. **Verify** 클릭 (소유권 확인)
5. DNS 설정 안내 확인 → 다음 섹션으로 이동

---

## 🌍 가비아 DNS 설정

### Step 1: 가비아 관리 콘솔 접속

1. **가비아** 로그인: https://www.gabia.com
2. **My가비아** → **도메인** → **utopiax.kr** 선택
3. **관리도구** → **DNS 정보** 클릭

---

### Step 2: DNS 레코드 추가

#### Option A: Netlify DNS 사용 (권장)

Netlify에서 자동 DNS 관리 (가장 쉬움)

1. Netlify 대시보드 → **Set up Netlify DNS**
2. 가비아에서 **네임서버 변경**:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
3. 변경 완료 (전파 시간: 최대 48시간, 보통 1-4시간)

#### Option B: 가비아 DNS 유지 (A 레코드 방식)

1. **가비아 DNS 관리** → **레코드 수정**
2. 기존 레코드 삭제 (있을 경우)
3. 다음 레코드 추가:

| 타입 | 호스트 | 값/주소 | TTL |
|------|--------|---------|-----|
| **A** | `@` | `75.2.60.5` | 3600 |
| **CNAME** | `www` | `utopiax-kr-123abc.netlify.app` | 3600 |

**⚠️ 주의**: `utopiax-kr-123abc.netlify.app`를 실제 Netlify URL로 교체하세요!

4. **저장** 클릭
5. DNS 전파 대기 (1-4시간)

---

### Step 3: DNS 전파 확인

터미널에서 확인:

```bash
# macOS/Linux
nslookup utopiax.kr
dig utopiax.kr

# Windows
nslookup utopiax.kr
```

예상 결과:
```
Non-authoritative answer:
Name:   utopiax.kr
Address: 75.2.60.5
```

온라인 도구:
- https://www.whatsmydns.net/#A/utopiax.kr

---

### Step 4: SSL 인증서 자동 발급

1. DNS 전파 완료 후 Netlify에서 자동으로 **Let's Encrypt SSL** 발급
2. Netlify 대시보드 → **Domain settings** → **HTTPS**
3. **Verify DNS configuration** 클릭
4. 인증서 발급 완료 (약 1-5분)
5. 자동으로 HTTPS 활성화 ✅

---

## 🔐 환경 변수 설정 (재확인)

### Netlify 대시보드 확인

1. **Site settings** → **Environment variables**
2. 다음 변수가 설정되어 있는지 확인:

```
GEMINI_API_KEY = AIzaSyBwhrtgWCJ0WsFaHy4ng9eBKjkrVJflLvU
```

3. 없으면 추가 후 **Trigger deploy** (재배포)

---

## ✅ 배포 후 테스트

### 1. 메인 페이지 테스트

- **URL**: https://utopiax.kr
- **테스트 항목**:
  - [x] 페이지 로딩 확인
  - [x] 무한 슬라이더 작동
  - [x] 모달 팝업 (아티스트 등록, 댄서 섭외)
  - [x] HTTPS 자물쇠 아이콘 확인 🔒

### 2. AI 매칭 테스트

1. **댄서 섭외하기** 클릭
2. 기본 정보 입력
3. AI 프롬프트 입력 예시:
   ```
   귀엽고 금발 머리에 캐치 티니핑 뮤지컬에 필요한 여성 댄서.
   어린이와 잘 소통하고 연기력과 가창력이 중요해요.
   ```
4. **AI 매칭 신청하기** 클릭
5. 3초 로딩 후 Top 5 추천 댄서 확인
6. **콘솔 확인** (F12):
   ```
   🚀 Calling Gemini via Netlify Function...
   📦 Gemini Response: { success: true, result: {...} }
   ✅ Parsed Result: { hardFilters: {...}, softScores: {...} }
   ```

### 3. 관리자 페이지 테스트

- **URL**: https://utopiax.kr/admin.html
- **로그인**: 비밀번호 `Utopia2024!@#$`
- **테스트 항목**:
  - [x] 대시보드 통계 표시
  - [x] 섭외 요청 리스트
  - [x] 아티스트 등록 리스트
  - [x] 댄서 DB 관리

### 4. API Functions 테스트

콘솔에서 직접 테스트:

```javascript
// 브라우저 콘솔 (F12)
fetch('https://utopiax.kr/.netlify/functions/gemini-analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: '귀여운 여성 댄서 필요해요' 
  })
})
.then(res => res.json())
.then(data => console.log('✅ Function Test:', data))
.catch(err => console.error('❌ Error:', err));
```

예상 응답:
```json
{
  "success": true,
  "result": {
    "hardFilters": {
      "gender": "female",
      ...
    },
    "softScores": {
      "tag_cute": 0.95,
      ...
    }
  }
}
```

---

## 🛠️ 문제 해결 (Troubleshooting)

### 문제 1: Gemini API 오류

**증상**: "Gemini API failed" 에러

**해결 방법**:
1. Netlify 환경 변수 확인:
   - **Site settings** → **Environment variables**
   - `GEMINI_API_KEY` 존재 확인
2. 재배포: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
3. 콘솔 확인: `⚠️ Falling back to simulated analysis...` (Fallback 정상 작동)

---

### 문제 2: 404 Not Found

**증상**: 특정 페이지 접근 시 404

**해결 방법**:
1. `_redirects` 파일 확인:
   ```
   /*    /index.html   200
   ```
2. `netlify.toml` 확인:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
3. 재배포

---

### 문제 3: DNS 전파 안 됨

**증상**: 도메인 접속 불가

**해결 방법**:
1. DNS 전파 대기 (최대 48시간)
2. 전파 확인: https://www.whatsmydns.net/#A/utopiax.kr
3. 가비아 DNS 레코드 재확인:
   - A 레코드: `@` → `75.2.60.5`
   - CNAME 레코드: `www` → `{your-site}.netlify.app`

---

### 문제 4: SSL 인증서 발급 실패

**증상**: "Not Secure" 경고

**해결 방법**:
1. DNS 전파 확인 (HTTPS는 DNS 완료 후 발급)
2. Netlify 대시보드 → **Domain settings** → **HTTPS**
3. **Verify DNS configuration** → **Renew certificate**

---

### 문제 5: Gemini API Key 노출

**증상**: 콘솔에서 API Key 보임

**해결 방법**:
1. `js/main.js`에서 API Key 하드코딩 제거 확인:
   ```javascript
   const GEMINI_FUNCTION_URL = '/.netlify/functions/gemini-analyze';
   ```
2. Netlify Functions만 사용 (클라이언트에서 직접 호출 금지)

---

## 📊 배포 완료 확인

### 체크리스트

- [x] **메인 페이지**: https://utopiax.kr 정상 로딩
- [x] **관리자 페이지**: https://utopiax.kr/admin.html 정상 로딩
- [x] **HTTPS**: 🔒 자물쇠 아이콘 표시
- [x] **AI 매칭**: Gemini API 정상 작동
- [x] **모바일 반응형**: 모바일에서 정상 표시
- [x] **관리자 로그인**: 비밀번호 `Utopia2024!@#$` 작동

---

## 🎉 배포 완료!

축하합니다! **UTOPIA X**가 성공적으로 배포되었습니다.

### 접속 URL

- **메인 사이트**: https://utopiax.kr
- **관리자 페이지**: https://utopiax.kr/admin.html

### 관리자 계정

- **비밀번호**: `Utopia2024!@#$`
- **⚠️ 주의**: 배포 후 비밀번호를 더 강력하게 변경하는 것을 권장합니다.

### 다음 단계

1. **댄서 데이터 추가**: 관리자 페이지에서 댄서 프로필 등록
2. **도메인 이메일 설정**: ksk@utopiax.kr 등 이메일 활성화
3. **GA4 분석 추가**: Google Analytics 연동 (선택)
4. **SEO 최적화**: 메타 태그, sitemap.xml 추가 (선택)

---

## 📞 문의 및 지원

- **이메일**: contact@utopiax.com
- **인스타그램**: @utopiax_official
- **기술 지원**: GitHub Issues 또는 이메일 문의

Made with 💜 by UTOPIA X Team
