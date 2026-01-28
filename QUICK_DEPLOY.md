# 🎯 빠른 배포 요약 (5분 완료)

## 1️⃣ Netlify 접속 & 업로드
- **사이트**: https://app.netlify.com
- **회원가입** (무료) → GitHub/Email 중 선택
- **Add new site** → **Deploy manually**
- **프로젝트 폴더 전체 드래그 앤 드롭**

## 2️⃣ 환경 변수 설정 (필수!)
- **Site settings** → **Environment variables**
- **Add**: `GEMINI_API_KEY` = `AIzaSyBwhrtgWCJ0WsFaHy4ng9eBKjkrVJflLvU`
- **Trigger deploy** → **Clear cache and deploy site**

## 3️⃣ 도메인 연결 (utopiax.kr)
- **Site settings** → **Domain management** → **Add custom domain**: `utopiax.kr`

### 가비아 DNS 설정 (방법 A - 추천):
1. 가비아 로그인 → **도메인** → **네임서버 설정**
2. 네임서버 변경:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```

### 가비아 DNS 설정 (방법 B):
1. 가비아 → **DNS 관리**
2. A 레코드 추가: `@` → `75.2.60.5`
3. CNAME 추가: `www` → `your-site.netlify.app`

## 4️⃣ 완료!
- **메인**: https://utopiax.kr
- **관리자**: https://utopiax.kr/admin.html
- **비밀번호**: `Utopia2024!@#$`

---

**상세 가이드**: `DEPLOYMENT_GUIDE.md` 참조
