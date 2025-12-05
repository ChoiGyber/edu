# Vercel 배포 가이드

## 1. 사전 준비

### Supabase 데이터베이스 설정 (필수!)

배포 전에 Supabase SQL Editor에서 다음을 실행하세요:

1. **migration.sql 실행** (데이터베이스 스키마 생성)
2. **admin-user.sql 실행** (관리자 계정 생성)

## 2. Vercel 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables

### 필수 환경 변수:

```bash
# Database (Supabase)
# 특수문자 인코딩: # → %23, @ → %40, $ → %24
# Connection Pooling (포트 6543) - Vercel 배포용
DATABASE_URL=postgresql://postgres:dkswjse29181%23%40%24@db.fppuxfiitvvgxmmjairb.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:dkswjse29181%23%40%24@db.fppuxfiitvvgxmmjairb.supabase.co:5432/postgres

# NextAuth.js
NEXTAUTH_URL=https://plan-git-main-racji92-gmailcoms-projects.vercel.app
NEXTAUTH_SECRET=<openssl rand -base64 32로 생성한 값>

# Security
JWT_SECRET=<openssl rand -base64 32로 생성한 값>
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# App
NEXT_PUBLIC_APP_URL=https://plan-git-main-racji92-gmailcoms-projects.vercel.app
NEXT_PUBLIC_APP_NAME=안전교육 플랫폼

# Setup Token (초기 설정용 - 프로덕션에서는 반드시 변경)
SETUP_TOKEN=setup-token-change-this-in-production
```

### 선택 환경 변수 (나중에 추가 가능):

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
OPENAI_API_KEY=
RESEND_API_KEY=
```

## 3. 배포 방법

### Option 1: Vercel CLI로 배포

```bash
# Vercel CLI 설치 (처음 한 번만)
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

### Option 2: GitHub 연동 (권장)

1. GitHub에 푸시
2. Vercel 대시보드에서 프로젝트 Import
3. 환경 변수 설정
4. Deploy 클릭

## 4. 배포 후 확인 사항

### 1) 데이터베이스 연결 확인
```
https://plan-git-main-racji92-gmailcoms-projects.vercel.app/api/test-db
```

예상 결과:
```json
{
  "status": "success",
  "database": "connected",
  "userCount": 1,
  "adminExists": true
}
```

⚠️ **만약 userCount가 0이면** → 아래 "데이터베이스 초기화" 섹션을 따르세요.

### 1-1) 데이터베이스 초기화 (userCount가 0인 경우)

Supabase SQL Editor에서 `migration.sql`과 `admin-user.sql` 실행 후에도 관리자 계정이 없다면, API로 생성할 수 있습니다:

**Postman 또는 cURL 사용:**

```bash
curl -X POST https://plan-git-main-racji92-gmailcoms-projects.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{"token":"setup-token-change-this-in-production"}'
```

**예상 응답:**
```json
{
  "status": "success",
  "message": "Admin account created successfully",
  "admin": {
    "id": "...",
    "email": "admin@edu.com",
    "name": "시스템 관리자",
    "role": "ADMIN"
  },
  "credentials": {
    "email": "admin@edu.com",
    "password": "admin"
  },
  "warning": "Please change the password after first login!"
}
```

### 2) 로그인 테스트
```
https://plan-git-main-racji92-gmailcoms-projects.vercel.app/auth/signin
```

- 이메일: admin@edu.com
- 비밀번호: admin

### 3) 메인 페이지 확인
```
https://plan-git-main-racji92-gmailcoms-projects.vercel.app
```

## 5. 트러블슈팅

### 빌드 에러

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
```

### 환경 변수 확인

Vercel Dashboard → Deployments → 최신 배포 → Environment Variables

### 로그 확인

Vercel Dashboard → Deployments → 최신 배포 → Runtime Logs

## 6. 보안 주의사항

⚠️ **프로덕션 환경에서 반드시 변경해야 할 것들:**

1. `NEXTAUTH_SECRET` - 새로운 랜덤 값으로 변경
2. `JWT_SECRET` - 새로운 랜덤 값으로 변경
3. 관리자 비밀번호 - 로그인 후 즉시 변경
4. `ENCRYPTION_KEY` - 새로운 랜덤 값으로 변경 (64자 hex)

## 7. 도메인 설정 (선택)

Vercel Dashboard → Settings → Domains

커스텀 도메인 추가 후:
- `NEXTAUTH_URL` 업데이트
- `NEXT_PUBLIC_APP_URL` 업데이트

## 8. 자동 배포 설정

GitHub main 브랜치에 푸시하면 자동으로 배포됩니다.

특정 브랜치만 배포하려면:
Vercel Dashboard → Settings → Git → Production Branch
