# 🚀 자동 배포 설정 가이드

## 개요

GitHub 저장소의 `main` 브랜치에 푸시할 때마다 자동으로 개인 서버에 배포됩니다.

**배포 흐름:**
```
git push origin main → GitHub Actions → 배포 계정(deploy)으로 배포 → PM2 재시작 → 완료
```

---

## 빠른 시작 (6단계)

### Step 1: 배포 전용 계정 생성 (서버에서 Root로)

```bash
# 배포 전용 계정 생성
sudo useradd -m -s /bin/bash -d /home/deploy deploy

# Sudo 권한 설정 (선택사항이지만 권장)
sudo visudo -f /etc/sudoers.d/deploy
```

다음 내용 추가:
```sudoers
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 *
deploy ALL=(ALL) NOPASSWD: /usr/sbin/nginx *
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
deploy ALL=(ALL) NOPASSWD: /bin/chown -R deploy:deploy /home/deploy/projects/*
```

자세한 내용: `docs/DEPLOY_USER_SETUP.md` → "Step 1-2"

### Step 2: SSH 키 생성 (로컬 머신에서)

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# 공개 키 복사
cat ~/.ssh/deploy_key.pub
```

### Step 3: 서버에 공개 키 등록 (Root로)

```bash
# 1. deploy 계정의 SSH 디렉토리 생성
sudo mkdir -p /home/deploy/.ssh
sudo touch /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# 2. 공개 키 추가 (Step 2에서 복사한 내용)
echo "ssh-ed25519 AAAAC3NzaC... github-actions-deploy" | sudo tee -a /home/deploy/.ssh/authorized_keys

# 3. 권한 확인
sudo ls -la /home/deploy/.ssh/
```

자세한 내용: `docs/DEPLOY_USER_SETUP.md` → "Step 3-5"

### Step 4: 서버 초기 설정 (Deploy 계정으로)

```bash
# deploy 계정으로 로그인
sudo su - deploy

# 프로젝트 클론
mkdir -p /home/deploy/projects
cd /home/deploy/projects
git clone git@github.com:YOUR_USERNAME/edu.git
cd edu

# 초기 설정
npm ci
npm run build

# 환경 변수 파일 생성
nano .env.production
# NODE_ENV=production
# NEXT_PUBLIC_APP_URL=https://your-domain.com
# NEXTAUTH_SECRET=<value>
# DATABASE_URL=postgresql://...
# (필요한 모든 환경 변수)

# PM2 설정
cat > ecosystem.config.js << 'INNER_EOF'
module.exports = {
  apps: [{
    name: 'edu',
    script: 'npm',
    args: 'start',
    cwd: '/home/deploy/projects/edu',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '500M',
  }],
};
INNER_EOF

# PM2 시작
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

자세한 내용: `docs/DEPLOY_USER_SETUP.md` → "Step 6-7"

### Step 5: GitHub Secrets 설정

GitHub 리포지토리 → Settings → Secrets and variables → Actions

필수 항목:
| Secret Name | 예시 |
|-------------|------|
| `SERVER_HOST` | `192.168.1.100` 또는 `your-domain.com` |
| `SERVER_PORT` | `22` |
| `DEPLOY_KEY` | `deploy_key` 파일 전체 내용 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 실행 결과 |
| `NEXTAUTH_URL` | `https://your-domain.com` |
| `DATABASE_URL` | `postgresql://...` |
| `OPENAI_API_KEY` | OpenAI API 키 |

선택 항목:
| Secret Name | 설명 |
|-------------|------|
| `SLACK_WEBHOOK` | Slack 배포 알림 |

### Step 6: 배포 테스트

```bash
# 1. 수동 배포 (서버에서 deploy 계정으로)
sudo su - deploy
cd /home/deploy/projects/edu
./scripts/deploy.sh

# 2. GitHub Actions 자동 배포 테스트
git push origin main

# 3. 확인
# → GitHub 리포지토리 → Actions 탭
# → PM2 로그: pm2 logs edu
# → 헬스 체크: curl https://your-domain.com/api/health
```

---

## 주요 파일 설명

| 파일 | 설명 |
|------|------|
| `.github/workflows/deploy.yml` | GitHub Actions 워크플로우 |
| `scripts/deploy.sh` | 서버 배포 스크립트 |
| `ecosystem.config.js` | PM2 설정 |
| `app/api/health/route.ts` | 헬스 체크 엔드포인트 |
| `docs/DEPLOY_USER_SETUP.md` | 배포 계정 상세 설정 |
| `docs/SERVER_SETUP.md` | 서버 전체 설정 (Nginx, SSL 등) |

---

## 배포 흐름도

```
1. 로컬에서 코드 커밋
   git commit && git push origin main
          ↓
2. GitHub Actions 트리거
   - 코드 체크아웃
   - Node.js 설정
   - npm ci && npm run build
          ↓
3. SSH로 deploy 계정에 접속
   deploy@server:/home/deploy/projects/edu
          ↓
4. 서버에서 배포 스크립트 실행
   - git pull origin main
   - npm ci && npm run build
   - pm2 restart edu
   - 헬스 체크 (curl /api/health)
          ↓
5. 배포 완료/실패 알림
   GitHub Actions 로그 또는 Slack
```

---

## 일반적인 문제 해결

### SSH 연결 실패

```bash
# 1. 키 권한 확인
ls -la ~/.ssh/deploy_key
chmod 600 ~/.ssh/deploy_key

# 2. 서버의 authorized_keys 확인
ssh deploy@your-server "cat ~/.ssh/authorized_keys"

# 3. SSH 연결 테스트
ssh -vv -i ~/.ssh/deploy_key deploy@your-server "whoami"
```

### GitHub Actions에서 "Permission denied"

```bash
# 1. GitHub Secret 확인
# DEPLOY_KEY에 deploy_key 파일의 전체 내용이 복사되었는지 확인
# (-----BEGIN ED25519 PRIVATE KEY----- 포함)

# 2. deploy 계정의 권한 확인 (서버에서)
ls -la /home/deploy/.ssh/
# authorized_keys 권한이 600이어야 함

# 3. SSH 서버 재시작
sudo systemctl restart sshd
```

### 배포 후 502 Bad Gateway

```bash
# 1. PM2 상태 확인
pm2 status

# 2. 에러 로그 확인
pm2 logs edu --err --lines 50

# 3. 앱 재시작
pm2 restart edu
```

### 배포 로그가 안 보임

```bash
# 1. PM2 로그 위치 확인
ls -la /home/deploy/logs/

# 2. 최근 로그 확인
tail -f /home/deploy/logs/pm2-out.log
tail -f /home/deploy/logs/pm2-error.log

# 3. deploy.log 확인
tail -f /home/deploy/projects/edu/logs/deploy.log
```

---

## 배포 성공 확인 체크리스트

- [ ] `deploy` 계정 생성됨
- [ ] 배포 계정에 SSH 공개 키 등록됨
- [ ] `DEPLOY_KEY` Secret에 개인 키 복사됨
- [ ] 서버에서 SSH 연결 테스트 성공 (`ssh -i deploy_key deploy@server`)
- [ ] 프로젝트 클론됨 (`/home/deploy/projects/edu`)
- [ ] 환경 변수 파일 생성됨 (`.env.production`)
- [ ] PM2 실행 중 (`pm2 status`)
- [ ] 헬스 체크 통과 (`curl http://localhost:3000/api/health`)
- [ ] GitHub Actions 워크플로우 실행됨 (`git push` 후 Actions 확인)
- [ ] 배포 로그 생성됨 (`tail -f /home/deploy/projects/edu/logs/deploy.log`)

---

## 보안 권장사항

### 1. Sudo 권한 최소화
```sudoers
# 필요한 명령만 허용
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 restart *
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 start *
```

### 2. 비밀번호 로그인 비활성화 (SSH)
```bash
sudo nano /etc/ssh/sshd_config

# 다음 항목 확인:
# PasswordAuthentication no
# PubkeyAuthentication yes

sudo systemctl restart sshd
```

### 3. 방화벽 설정
```bash
# SSH 포트만 특정 IP에서 허용
sudo ufw allow from 0.0.0.0/0 to any port 22
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 4. 로그 모니터링
```bash
# 배포 계정의 활동 기록
sudo lastlog -u deploy
sudo grep deploy /var/log/auth.log | tail -20
```

---

## 참고 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- [PM2 공식 문서](https://pm2.keymetrics.io/)
- [Linux 최소 권한 원칙](https://en.wikipedia.org/wiki/Principle_of_least_privilege)

자세한 설정: `docs/DEPLOY_USER_SETUP.md`, `docs/SERVER_SETUP.md` 참조
