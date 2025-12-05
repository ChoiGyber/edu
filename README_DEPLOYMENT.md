# 🎯 배포 설정 완료 요약

## 📊 현재 상태

| 항목 | 상태 | 설명 |
|------|------|------|
| GitHub 저장소 | ✅ 완료 | https://github.com/ChoiGyber/edu |
| 로컬 빌드 | ✅ 완료 | `npm run build` 성공 |
| CI/CD 파이프라인 | ✅ 설정 | `.github/workflows/deploy.yml` 준비됨 |
| 서버 배포 | ⏳ 대기 | 4단계 설정 필요 |

---

## 🚀 빠른 시작 (4단계, 약 20분)

### 📖 상세 가이드 읽기
- **`DEPLOYMENT_CHECKLIST.md`** ← 지금 이 파일을 읽으세요!

### 단계별 실행

**Step 1: 서버 준비 (10분)**
```bash
ssh root@your-server-ip
mkdir -p /var/www && cd /var/www
git clone https://github.com/ChoiGyber/edu.git
cd edu && npm ci && npm run build
# .env.production 파일 생성 후 설정값 입력
pm2 start ecosystem.config.js
```

**Step 2: SSH 키 생성 (2분)**
```bash
# 로컬에서
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/root_deploy_key -N ""
cat ~/.ssh/root_deploy_key.pub  # 복사
# 서버에 등록
```

**Step 3: GitHub Secrets 설정 (3분)**
- https://github.com/ChoiGyber/edu/settings/secrets/actions
- `SERVER_HOST`, `SERVER_PORT`, `SSH_KEY` 추가

**Step 4: 배포 테스트 (1분)**
```bash
git push origin main
# GitHub Actions 자동 실행 확인
```

---

## 📁 핵심 파일 설명

### 배포 관련 파일

| 파일 | 설명 | 용도 |
|------|------|------|
| `.github/workflows/deploy.yml` | GitHub Actions 워크플로우 | 자동 배포 스크립트 |
| `ecosystem.config.js` | PM2 설정 파일 | 프로세스 관리 |
| `scripts/deploy.sh` | 배포 스크립트 | 서버 배포 로직 |
| `DEPLOYMENT_CHECKLIST.md` | 체크리스트 | 📖 이 파일을 읽으세요! |
| `NEXT_STEPS.md` | 다음 단계 | 이전 단계 기록 |
| `FINAL_SETUP.md` | 최종 설정 | 이전 단계 기록 |

### 개발 관련 파일

| 파일 | 설명 |
|------|------|
| `package.json` | 프로젝트 의존성 |
| `.env.local` | 로컬 개발 환경 변수 |
| `.env.production` | 서버 배포 환경 변수 (생성 필요) |
| `prisma/schema.prisma` | 데이터베이스 스키마 |
| `next.config.ts` | Next.js 설정 |

---

## 🔐 보안 체크리스트

- [ ] `.env.production`에 실제 데이터베이스 비밀번호 설정
- [ ] `NEXTAUTH_SECRET` 안전한 랜덤 키로 생성
- [ ] SSH 키 로컬에만 저장 (GitHub에 절대 푸시 금지)
- [ ] GitHub Secrets에 프라이빗 키 저장
- [ ] 서버 방화벽 설정 (포트 22, 80, 443)
- [ ] SSL 인증서 설정 (Nginx + Certbot)

---

## 📋 배포 흐름 다이어그램

```
┌─────────────────────────────────────────────────────┐
│ 로컬 개발 환경                                       │
│ (당신의 컴퓨터)                                     │
│                                                     │
│ npm run dev → 수정 → git add → git commit → git push │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ GitHub (https://github.com/ChoiGyber/edu)         │
│                                                     │
│ main 브랜치에 푸시됨                               │
│ → GitHub Actions 자동 트리거                       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ GitHub Actions (자동 배포)                         │
│                                                     │
│ 1. SSH로 서버 접속                                  │
│ 2. /var/www/edu 이동                               │
│ 3. git pull origin main                            │
│ 4. npm ci (의존성 설치)                            │
│ 5. npm run build (빌드)                            │
│ 6. pm2 restart edu (재시작)                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ 서버 (Ubuntu 서버)                                 │
│                                                     │
│ /var/www/edu/                                       │
│ ├─ src/                                             │
│ ├─ public/                                          │
│ ├─ .env.production                                  │
│ ├─ ecosystem.config.js                             │
│ ├─ .next/ (빌드 결과)                              │
│ └─ node_modules/                                    │
│                                                     │
│ PM2로 실행 중 (자동 재시작)                        │
└─────────────────────────────────────────────────────┘
```

---

## ✅ 설정 후 확인 사항

배포가 완료되면 다음을 확인하세요:

```bash
# 서버에서
ssh root@your-server-ip

# 1. PM2 상태 확인
pm2 status
# edu 프로세스가 "online" 상태인지 확인

# 2. 애플리케이션 로그 확인
pm2 logs edu
# 에러 없이 정상 작동하는지 확인

# 3. 포트 확인 (기본 3000)
netstat -tlnp | grep 3000
# 서버가 포트 3000에서 실행 중인지 확인

# 4. 브라우저에서 테스트
curl http://localhost:3000/api/health
# 200 OK 응답이 오는지 확인
```

---

## 🐛 자주 발생하는 문제 및 해결

### 문제 1: "git clone 실패"
```
Error: Could not read from remote repository
```
**해결:** SSH 키 문제. GitHub에 공개 키 등록 확인

### 문제 2: "npm ci 실패"
```
Error: ENOENT: no such file or directory, open '.env.production'
```
**해결:** `.env.production` 파일이 없음. 파일 생성 후 필요한 변수 설정

### 문제 3: "pm2 start 실패"
```
Error: Cannot find module 'next'
```
**해결:** `npm ci` 완료 확인, `npm run build` 완료 확인

### 문제 4: "GitHub Actions 실패"
```
Error: SSH: Could not connect to server
```
**해결:**
1. `SERVER_HOST` Secrets 확인
2. 서버 방화벽 포트 22 오픈 확인
3. `SSH_KEY` Secrets의 프라이빗 키 확인 (개행 포함)

---

## 📞 추가 도움말

### 자주 사용하는 명령어

```bash
# 서버에서
ssh root@your-server-ip          # 서버 접속
cd /var/www/edu                  # 프로젝트 폴더 이동
pm2 status                       # 상태 확인
pm2 restart edu                  # 재시작
pm2 logs edu                     # 로그 확인
pm2 stop edu                     # 중지
pm2 delete edu                   # 제거
pm2 startup                      # 부팅 시 자동 시작 설정
pm2 save                         # 현재 프로세스 목록 저장

# 로컬에서
git status                       # 변경 상태 확인
git diff                         # 변경 내용 확인
git add .                        # 모든 변경 스테이징
git commit -m "메시지"          # 커밋
git push origin main             # 푸시 (자동 배포)
git log --oneline               # 커밋 히스토리
```

### 환경 변수 설정 예시

```bash
# 서버에서 .env.production 편집
nano /var/www/edu/.env.production

# 다음 항목들을 설정하세요:
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=생성된-랜덤-시크릿-키
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://사용자:비밀번호@localhost:5432/edu_db
DIRECT_URL=postgresql://사용자:비밀번호@localhost:5432/edu_db

# 저장: Ctrl+X → Y → Enter
```

---

## 🎉 최종 확인

모든 설정이 완료되면:

✅ GitHub에 코드 푸시
✅ 자동으로 서버에 배포
✅ PM2로 애플리케이션 자동 재시작
✅ 서비스 운영 시작!

**수동으로 서버에 접속해서 배포할 필요가 없습니다!**

---

## 📖 추가 참고 자료

- `DEPLOYMENT_CHECKLIST.md` - 상세 체크리스트
- `NEXT_STEPS.md` - 이전 단계 기록
- `FINAL_SETUP.md` - 최종 설정 기록
- `.github/workflows/deploy.yml` - GitHub Actions 워크플로우
- `ecosystem.config.js` - PM2 설정
- `scripts/deploy.sh` - 배포 스크립트

---

**준비 완료! DEPLOYMENT_CHECKLIST.md를 읽고 시작하세요!** 🚀
