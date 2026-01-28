# 📦 UTOPIA X - Netlify 배포 준비 완료

## ✅ 배포 준비 완료 상태

모든 보안 설정과 파일이 준비되었습니다!

---

## 🎯 지금 바로 배포하는 방법

### 옵션 1: Netlify Drag & Drop (가장 빠름 - 5분)

1. **Netlify 접속**: https://app.netlify.com
2. **회원가입** (무료): GitHub, GitLab, Email 중 선택
3. **Sites** → **Add new site** → **Deploy manually** 클릭
4. **프로젝트 폴더 전체를 드래그 앤 드롭**

   **포함할 파일/폴더**:
   ```
   ✅ index.html
   ✅ admin.html
   ✅ css/ (style.css, admin.css)
   ✅ js/ (main.js, admin.js)
   ✅ netlify/ (functions/gemini-analyze.js)
   ✅ netlify.toml
   ✅ _redirects
   ✅ .env.example
   
   ❌ 제외할 파일:
   - node_modules/ (없음)
   - .git/ (있다면)
   - 기타 개발 파일
   ```

5. **업로드 완료** → 자동 배포 시작 (30초)
6. **임시 URL 발급**: `https://utopiax-kr-abc123.netlify.app`

---

### 옵션 2: GitHub 연동 (권장 - 자동 배포)

1. **GitHub 저장소 생성**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: UTOPIA X v4.1"
   git remote add origin https://github.com/your-username/utopiax.git
   git push -u origin main
   ```

2. **Netlify에서 Import**:
   - **Import from Git** → **GitHub** 선택
   - 저장소 선택: `utopiax`
   - Build settings:
     - Build command: (비워둠)
     - Publish directory: `.`
   - **Deploy site** 클릭

3. **자동 배포**: 이후 Git Push 시 자동 배포됩니다!

---

## 🔐 중요: 환경 변수 설정 (필수)

배포 후 반드시 설정하세요!

1. **Netlify 대시보드** → **Site settings** → **Environment variables**
2. **Add a variable** 클릭
3. 다음 추가:

   | Key | Value |
   |-----|-------|
   | `GEMINI_API_KEY` | `AIzaSyBwhrtgWCJ0WsFaHy4ng9eBKjkrVJflLvU` |

4. **Scopes**: `All` 선택
5. **Save** 클릭
6. **Trigger deploy** → **Clear cache and deploy site** (재배포)

---

## 🌐 커스텀 도메인 연결 (utopiax.kr)

### 1단계: Netlify에서 도메인 추가

1. **Site settings** → **Domain management**
2. **Add custom domain** → `utopiax.kr` 입력
3. **Verify** 클릭

### 2단계: 가비아 DNS 설정

#### 방법 A: Netlify DNS (권장)

**가비아에서 네임서버 변경**:

1. 가비아 로그인 → **My가비아** → **도메인**
2. `utopiax.kr` 선택 → **관리도구** → **네임서버 설정**
3. 다음 네임서버로 변경:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
4. **적용** 클릭
5. DNS 전파 대기 (1-4시간)

#### 방법 B: 가비아 DNS 유지 (A 레코드)

**가비아 DNS 관리**:

1. 가비아 → **도메인** → **DNS 정보**
2. 다음 레코드 추가:

   | 타입 | 호스트 | 값/주소 | TTL |
   |------|--------|---------|-----|
   | **A** | `@` | `75.2.60.5` | 3600 |
   | **CNAME** | `www` | `utopiax-kr-abc123.netlify.app` | 3600 |

   **⚠️ 주의**: Netlify URL을 실제 발급받은 URL로 교체!

3. **저장** → DNS 전파 대기

### 3단계: SSL 인증서 자동 발급

- DNS 전파 완료 후 Netlify가 자동으로 **Let's Encrypt SSL** 발급
- **HTTPS** 자동 활성화 (1-5분 소요)
- 확인: https://utopiax.kr 🔒

---

## ✅ 배포 후 테스트

### 1. 메인 페이지
- URL: https://utopiax.kr
- 무한 슬라이더, 모달 팝업 확인

### 2. AI 매칭 테스트
- "귀여운 금발 여성 댄서" 입력 → Top 5 추천 확인
- 콘솔 (F12): `✅ Gemini Response` 확인

### 3. 관리자 페이지
- URL: https://utopiax.kr/admin.html
- 비밀번호: `Utopia2024!@#$`
- 통계 대시보드 확인

---

## 📝 배포 체크리스트

- [ ] Netlify 회원가입
- [ ] 프로젝트 업로드 (Drag & Drop 또는 Git)
- [ ] 환경 변수 설정 (`GEMINI_API_KEY`)
- [ ] 재배포 (Clear cache and deploy)
- [ ] 커스텀 도메인 추가 (`utopiax.kr`)
- [ ] 가비아 DNS 설정 (네임서버 또는 A 레코드)
- [ ] DNS 전파 대기 (1-4시간)
- [ ] SSL 인증서 확인 (🔒 표시)
- [ ] 메인 페이지 테스트
- [ ] AI 매칭 테스트
- [ ] 관리자 페이지 테스트

---

## 🚨 문제 발생 시

### Gemini API 오류
- 환경 변수 `GEMINI_API_KEY` 확인
- 재배포: **Trigger deploy**

### 404 Not Found
- `netlify.toml`, `_redirects` 파일 확인
- 재배포

### DNS 전파 안 됨
- 대기 시간 필요 (최대 48시간)
- 확인: https://www.whatsmydns.net/#A/utopiax.kr

---

## 📖 상세 가이드

전체 배포 가이드는 `DEPLOYMENT_GUIDE.md`를 참조하세요.

---

## 🎉 배포 완료 후

축하합니다! 다음 단계:

1. **이메일 설정**: ksk@utopiax.kr (가비아 이메일)
2. **댄서 데이터 추가**: 관리자 페이지에서 등록
3. **SEO 최적화**: Google Analytics, sitemap.xml
4. **소셜 공유**: 인스타그램 @utopiax_official

---

Made with 💜 by UTOPIA X Team
