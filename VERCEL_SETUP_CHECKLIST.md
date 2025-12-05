# Vercel 배포 설정 체크리스트

## ✅ 완료된 사항
- [x] 코드 작성 및 Git 푸시 완료
- [x] Supabase 데이터베이스 생성
- [x] `migration.sql` 실행 (Supabase SQL Editor)
- [x] `admin-user.sql` 실행 (Supabase SQL Editor)

## 📋 Vercel에서 설정해야 할 환경 변수

Vercel Dashboard → Settings → Environment Variables에서 다음 변수들을 **모두 추가**하세요:

### 1. 데이터베이스 (필수)
```
DATABASE_URL
postgresql://postgres:dkswjse29181%23%40%24@db.fppuxfiitvvgxmmjairb.supabase.co:6543/postgres?pgbouncer=true
```

```
DIRECT_URL
postgresql://postgres:dkswjse29181%23%40%24@db.fppuxfiitvvgxmmjairb.supabase.co:5432/postgres
```

### 2. NextAuth (필수)
```
NEXTAUTH_URL
https://plan-git-main-racji92-gmailcoms-projects.vercel.app
```

```
NEXTAUTH_SECRET
생성 방법: 터미널에서 `openssl rand -base64 32` 실행 후 결과값 복사
```

### 3. 보안 (필수)
```
JWT_SECRET
생성 방법: 터미널에서 `openssl rand -base64 32` 실행 후 결과값 복사
```

```
ENCRYPTION_KEY
0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 4. 앱 설정 (필수)
```
NEXT_PUBLIC_APP_URL
https://plan-git-main-racji92-gmailcoms-projects.vercel.app
```

```
NEXT_PUBLIC_APP_NAME
안전교육 플랫폼
```

### 5. 초기 설정 토큰 (필수)
```
SETUP_TOKEN
setup-token-change-this-in-production
```

## 🚀 배포 후 확인 단계

### Step 1: 환경 변수 설정 후 재배포
1. Vercel Dashboard → Deployments → 최신 배포 우측 메뉴(⋯)
2. "Redeploy" 클릭
3. **"Use existing build cache" 체크 해제** (중요!)
4. "Redeploy" 버튼 클릭

### Step 2: 데이터베이스 연결 확인
브라우저에서 접속:
```
https://plan-git-main-racji92-gmailcoms-projects.vercel.app/api/test-db
```

**성공 시 예상 결과:**
```json
{
  "status": "success",
  "database": "connected",
  "userCount": 1,
  "adminExists": true
}
```

**⚠️ 만약 userCount가 0이면:**

Postman 또는 브라우저 콘솔에서 실행:
```javascript
fetch('https://plan-git-main-racji92-gmailcoms-projects.vercel.app/api/setup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'setup-token-change-this-in-production' })
})
.then(r => r.json())
.then(console.log)
```

### Step 3: 로그인 테스트
1. 접속: https://plan-git-main-racji92-gmailcoms-projects.vercel.app/auth/signin
2. 로그인 정보 입력:
   - 이메일: `admin@edu.com`
   - 비밀번호: `admin`
3. 로그인 클릭 → 대시보드로 리다이렉트 확인

### Step 4: 메인 페이지 확인
접속: https://plan-git-main-racji92-gmailcoms-projects.vercel.app

## ❗ 주의사항

### 불필요한 환경 변수 (삭제해도 됨)
- `NEXT_PUBLIC_SUPABASE_URL` ❌ (Prisma 사용, Supabase Client 미사용)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ❌ (Prisma 사용, Supabase Client 미사용)

### 비밀번호 특수문자 인코딩
원본: `dkswjse29181#@$`
인코딩: `dkswjse29181%23%40%24`

- `#` → `%23`
- `@` → `%40`
- `$` → `%24`

### 포트 구분
- **Connection Pooling (6543)**: Vercel 배포용 (DATABASE_URL)
- **Direct Connection (5432)**: 마이그레이션용 (DIRECT_URL)

## 🔧 트러블슈팅

### 문제 1: Database connection error
**해결책:**
1. DATABASE_URL이 정확한지 확인 (특히 비밀번호 인코딩)
2. `?pgbouncer=true` 파라미터가 있는지 확인
3. Vercel에서 재배포 (빌드 캐시 해제)

### 문제 2: NextAuth error
**해결책:**
1. NEXTAUTH_SECRET이 설정되어 있는지 확인
2. NEXTAUTH_URL이 실제 배포 URL과 일치하는지 확인

### 문제 3: 로그인 후 리다이렉트 안 됨
**해결책:**
1. JWT_SECRET이 설정되어 있는지 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. Vercel Runtime Logs 확인

## 📞 지원

문제가 계속되면:
1. Vercel Dashboard → Deployments → Runtime Logs 확인
2. 브라우저 개발자 도구 → Console/Network 탭 확인
