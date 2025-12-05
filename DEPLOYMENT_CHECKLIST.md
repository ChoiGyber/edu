# 🚀 배포 완료 체크리스트

GitHub에 모든 파일이 푸시되었습니다! 이제 서버 배포 설정을 시작하세요.

---

## ✅ 완료된 항목

- ✅ GitHub 저장소 생성 (https://github.com/ChoiGyber/edu.git)
- ✅ 로컬 프로젝트 GitHub 연결
- ✅ 198개 파일 GitHub에 푸시
- ✅ CI/CD 파이프라인 설정 완료
- ✅ Next.js 15 빌드 성공
- ✅ .gitignore 업데이트 및 커밋

---

## 🔧 다음 단계 (순서대로 진행)

### 1단계: 서버 준비 (10분)

당신의 Ubuntu 서버에서 다음 명령어를 실행하세요:

```bash
# SSH로 서버 접속
ssh root@your-server-ip

# 디렉토리 생성
mkdir -p /var/www
cd /var/www

# GitHub에서 클론
git clone https://github.com/ChoiGyber/edu.git
cd edu

# 의존성 설치 및 빌드
npm ci
npm run build

# 환경 변수 파일 생성 (편집기로 열어서 필요한 값 입력)
nano .env.production

# PM2 설정 및 시작
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

**서버 환경 변수 (.env.production) 예시:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://user:password@localhost:5432/edu_prod
DIRECT_URL=postgresql://user:password@localhost:5432/edu_prod
```

### 2단계: SSH 키 생성 (로컬, 2분)

로컬 머신에서 실행:

```bash
# SSH 키 생성 (GitHub Actions용)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/root_deploy_key -N ""

# 공개 키 확인
cat ~/.ssh/root_deploy_key.pub
```

**공개 키를 서버에 등록:**

```bash
# 서버에 접속
ssh root@your-server-ip

# authorized_keys에 공개 키 추가
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... github-actions
EOF

chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3단계: GitHub Secrets 설정 (3분)

GitHub 저장소 → Settings → Secrets and variables → Actions

다음 항목을 추가:

| Secret Name | Value |
|---|---|
| `SERVER_HOST` | your-server-ip |
| `SERVER_PORT` | 22 |
| `SSH_KEY` | ~/.ssh/root_deploy_key의 전체 내용 (private key) |

**GitHub Secrets 추가 방법:**
1. https://github.com/ChoiGyber/edu/settings/secrets/actions 방문
2. "New repository secret" 클릭
3. Name: `SERVER_HOST`, Value: 서버 IP 입력, "Add secret" 클릭
4. 위 과정을 `SERVER_PORT`, `SSH_KEY` 반복

### 4단계: 배포 테스트 (1분)

로컬에서 코드 변경 후 푸시:

```bash
# 로컬 프로젝트에서
git add .
git commit -m "Test deployment"
git push origin main

# GitHub Actions 확인
# https://github.com/ChoiGyber/edu/actions
```

**배포 성공 확인:**

1. GitHub Actions 탭에서 배포 프로세스 확인
2. 서버에서 확인:
   ```bash
   pm2 status
   pm2 logs edu
   ```
3. 웹 브라우저에서 테스트:
   ```bash
   curl https://your-domain.com/api/health
   ```

---

## 📋 전체 체크리스트

### 서버 준비
- [ ] SSH로 서버 접속 완료
- [ ] `/var/www/edu` 디렉토리 생성
- [ ] GitHub 클론 완료
- [ ] `npm ci && npm run build` 성공
- [ ] `.env.production` 파일 생성 및 설정
- [ ] PM2 시작 완료

### SSH 키 설정
- [ ] 로컬에서 SSH 키 생성
- [ ] 공개 키를 서버에 등록
- [ ] SSH 연결 테스트 성공

### GitHub 설정
- [ ] `SERVER_HOST` Secret 추가
- [ ] `SERVER_PORT` Secret 추가
- [ ] `SSH_KEY` Secret 추가

### 배포 테스트
- [ ] 코드 변경 후 푸시
- [ ] GitHub Actions 실행 확인
- [ ] 서버에 배포 완료
- [ ] 웹 브라우저에서 접근 확인

---

## 🔄 배포 후 일상 업무

### 코드 수정 후 배포

```bash
# 1. 로컬에서 수정
nano src/components/Header.tsx

# 2. 변경사항 확인
git status

# 3. 커밋
git add .
git commit -m "Fix header styling"

# 4. 푸시 (자동 배포 시작)
git push origin main

# 5. 배포 확인
# → https://github.com/ChoiGyber/edu/actions에서 실시간 확인
# → 서버의 /var/www/edu에 자동 배포됨
```

### 서버 직접 관리

```bash
# 서버에 접속
ssh root@your-server-ip

# PM2 상태 확인
pm2 status

# 실시간 로그 확인
pm2 logs edu

# 애플리케이션 재시작 (필요시)
pm2 restart edu

# 로그 파일 위치
tail -f /var/www/edu/logs/deploy.log
```

---

## ⚠️ 주의사항

```bash
# ❌ 절대 하지 마세요
git push origin main --force
git reset --hard HEAD~1

# ✅ 정상 방법
git push origin main
git revert HEAD
```

---

## 📞 문제 해결

### 배포 실패 시
1. GitHub Actions 탭에서 에러 메시지 확인
2. 서버 로그 확인: `pm2 logs edu`
3. 환경 변수 재확인: `cat /var/www/edu/.env.production`

### 서버 접속 불가
1. IP 주소 및 포트 재확인
2. SSH 키 권한 확인: `ls -la ~/.ssh/`
3. 서버 방화벽 설정 확인

### PM2 관련 에러
```bash
# PM2 프로세스 목록 확인
pm2 list

# 프로세스 정보 상세 확인
pm2 show edu

# PM2 데몬 재시작
pm2 kill
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

---

## 🎯 완료!

모든 설정이 완료되면:

```
로컬에서 코드 수정
  ↓
git push origin main
  ↓
GitHub Actions 자동 실행 (1-2분)
  ↓
서버의 /var/www/edu에 자동 배포
  ↓
pm2 restart edu
  ↓
배포 완료! ✅
```

**매번 서버에 수동으로 접속할 필요 없음!**

---

마지막 질문이 없으면 위 4단계를 순서대로 진행하세요.
