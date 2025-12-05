# 🔐 배포 전용 계정 설정 가이드

## 개요

**왜 전용 계정이 필요한가?**
- ✅ 최소 권한 원칙 (Principle of Least Privilege)
- ✅ 보안: 배포 계정 유출 시에만 영향 제한
- ✅ 감시: 모든 배포 활동 로깅 및 추적 가능
- ✅ 팀 협업: GitHub Actions의 배포 활동을 명확하게 구분

---

## Step 1: 배포 계정 생성 (Root로 실행)

```bash
# 1. 배포 전용 계정 생성
sudo useradd -m -s /bin/bash -d /home/deploy deploy

# 2. 그룹 확인
getent group deploy

# 3. 계정 확인
id deploy

# 예상 출력:
# uid=1001(deploy) gid=1001(deploy) groups=1001(deploy)
```

---

## Step 2: Sudo 권한 설정 (선택사항이지만 권장)

### 옵션 A: PM2 관리 권한만 부여 (보안 최적화)

```bash
# sudoers 파일 편집 (visudo 사용 - 문법 검증)
sudo visudo -f /etc/sudoers.d/deploy
```

다음 내용 추가:

```sudoers
# deploy 계정은 다음 명령만 sudo 없이 (NOPASSWD) 실행 가능
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 restart *
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 start *
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 stop *
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 reload *
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 status
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 logs *

# Nginx 재시작 (필요시)
deploy ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx

# 파일 권한 변경 (필요시)
deploy ALL=(ALL) NOPASSWD: /bin/chown -R deploy:deploy /home/deploy/projects/*
```

저장: `Ctrl + X` → `Y` → `Enter`

### 옵션 B: 전체 Sudo 권한 부여 (편의성, 낮은 보안)

```bash
sudo usermod -aG sudo deploy

# /etc/sudoers 수정 (NOPASSWD 설정)
sudo visudo
```

다음 줄 추가:
```sudoers
deploy ALL=(ALL) NOPASSWD:ALL
```

---

## Step 3: 디렉토리 및 권한 설정

```bash
# 1. 프로젝트 디렉토리 생성
sudo mkdir -p /home/deploy/projects
sudo mkdir -p /home/deploy/logs
sudo mkdir -p /home/deploy/.pm2/logs

# 2. 소유권 변경
sudo chown -R deploy:deploy /home/deploy
sudo chmod 755 /home/deploy
sudo chmod 755 /home/deploy/projects
sudo chmod 755 /home/deploy/logs

# 3. SSH 디렉토리 생성
sudo mkdir -p /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# 4. authorized_keys 파일 생성
sudo touch /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# 5. 권한 확인
ls -la /home/deploy/
ls -la /home/deploy/.ssh/
```

---

## Step 4: SSH 공개 키 추가

### 방법 A: 로컬에서 공개 키 복사하기

```bash
# 1. 로컬 머신에서 공개 키 생성 (아직 안 했다면)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# 2. 공개 키 내용 복사
cat ~/.ssh/deploy_key.pub
# 출력: ssh-ed25519 AAAAC3NzaC... github-actions-deploy
```

### 방법 B: 서버에 공개 키 추가하기

```bash
# 서버에서 deploy 사용자로 전환
sudo su - deploy

# authorized_keys에 공개 키 추가
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxx... github-actions-deploy
EOF

# 권한 확인
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 로그아웃
exit
```

### Step 5: SSH 연결 테스트 (로컬)

```bash
# SSH 연결 테스트
ssh -i ~/.ssh/deploy_key deploy@your-server-ip "whoami"

# 예상 출력: deploy

# 상세 연결 테스트
ssh -vv -i ~/.ssh/deploy_key deploy@your-server-ip "ls -la /home/deploy"
```

실패 시 문제 해결:

```bash
# 1. 권한 확인
ssh-keyscan -H your-server-ip >> ~/.ssh/known_hosts
ssh -vvv -i ~/.ssh/deploy_key deploy@your-server-ip

# 2. 서버의 SSH 설정 확인
sudo nano /etc/ssh/sshd_config
# 다음 항목 확인:
# PubkeyAuthentication yes
# PasswordAuthentication no (권장)

# SSH 서버 재시작
sudo systemctl restart sshd
```

---

## Step 6: 프로젝트 클론 및 초기 설정

```bash
# deploy 사용자로 로그인
sudo su - deploy

# 프로젝트 디렉토리로 이동
cd /home/deploy/projects

# GitHub에서 클론 (SSH 키 필요)
git clone git@github.com:YOUR_USERNAME/edu.git
cd edu

# 의존성 설치
npm ci

# 초기 빌드
npm run build

# 환경 변수 파일 생성
nano .env.production

# 다음 내용 추가:
# NODE_ENV=production
# NEXT_PUBLIC_APP_URL=https://your-domain.com
# NEXTAUTH_SECRET=<value>
# NEXTAUTH_URL=https://your-domain.com
# DATABASE_URL=postgresql://...
# (나머지 환경 변수들)

# 권한 설정
chmod 640 .env.production
```

---

## Step 7: PM2 설정 (Deploy 계정으로)

```bash
# deploy 사용자로 로그인 (아직 안 했다면)
sudo su - deploy
cd /home/deploy/projects/edu

# ecosystem.config.js 생성
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'edu',
    script: 'npm',
    args: 'start',
    cwd: '/home/deploy/projects/edu',
    instances: 'max',
    exec_mode: 'cluster',
    user: 'deploy',
    group: 'deploy',

    // 환경 변수
    env: {
      NODE_ENV: 'production',
    },

    // 로깅
    error_file: '/home/deploy/logs/pm2-error.log',
    out_file: '/home/deploy/logs/pm2-out.log',
    log_file: '/home/deploy/logs/pm2-combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // 감시 및 재시작
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git', '.env*'],
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    autorestart: true,
    kill_timeout: 10000,
  }],
};
EOF

# PM2 시작
pm2 start ecosystem.config.js

# 부팅 시 자동 시작 설정
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
pm2 save

# 상태 확인
pm2 status
pm2 logs edu --lines 20
```

---

## Step 8: GitHub Secrets 업데이트

GitHub 리포지토리 → Settings → Secrets and variables → Actions

기존 Secrets 업데이트:

| Secret Name | 값 |
|-------------|-----|
| `SERVER_HOST` | 서버 IP 또는 도메인 |
| `SERVER_PORT` | 22 (기본값) |
| `DEPLOY_KEY` | `~/.ssh/deploy_key` 파일 전체 내용 |

삭제할 항목 (더 이상 필요 없음):
- `SERVER_USER` (하드코딩된 `deploy`로 변경됨)
- `SERVER_SSH_KEY` (→ `DEPLOY_KEY`로 변경)

---

## Step 9: 배포 스크립트 업데이트

서버의 `scripts/deploy.sh` 업데이트:

```bash
#!/bin/bash

set -e

PROJECT_DIR="/home/deploy/projects/edu"
LOG_FILE="$PROJECT_DIR/logs/deploy.log"
BRANCH="${1:-main}"

mkdir -p "$PROJECT_DIR/logs"

echo "$(date '+%Y-%m-%d %H:%M:%S') - 🚀 배포 시작" | tee -a "$LOG_FILE"

# 코드 풀링
cd "$PROJECT_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 의존성 설치
npm ci

# 빌드
npm run build

# PM2 재시작
pm2 restart "edu" --update-env
pm2 save

# 헬스 체크
echo "$(date '+%Y-%m-%d %H:%M:%S') - 🏥 헬스 체크 시작..." | tee -a "$LOG_FILE"
sleep 5

for i in {1..30}; do
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ✅ 배포 완료" | tee -a "$LOG_FILE"
    exit 0
  fi
  sleep 2
done

echo "$(date '+%Y-%m-%d %H:%M:%S') - ❌ 헬스 체크 실패" | tee -a "$LOG_FILE"
exit 1
```

---

## Step 10: 배포 테스트

```bash
# 1. 수동 배포 테스트
sudo su - deploy
cd /home/deploy/projects/edu
./scripts/deploy.sh

# 2. PM2 로그 확인
pm2 logs edu

# 3. 헬스 체크
curl http://localhost:3000/api/health

# 4. GitHub Actions 테스트
# → 로컬에서: git push origin main
# → GitHub: Actions 탭에서 실행 상황 확인
```

---

## 보안 체크리스트

- [ ] `deploy` 계정 생성됨
- [ ] 불필요한 sudo 권한 제거됨 (필요한 명령만)
- [ ] SSH 공개 키만 등록됨 (비밀번호 로그인 비활성화)
- [ ] `/home/deploy` 디렉토리 소유권이 `deploy:deploy`
- [ ] `.ssh/authorized_keys` 권한이 `600`
- [ ] `.env.production` 파일 권한이 `640`
- [ ] PM2 자동 시작 설정됨
- [ ] 배포 로그 디렉토리 생성됨 (`/home/deploy/logs`)

---

## 문제 해결

### SSH "Permission denied" 에러

```bash
# 1. 키 권한 확인
ls -la ~/.ssh/deploy_key
# 결과: -rw------- (600)이어야 함

chmod 600 ~/.ssh/deploy_key

# 2. 서버의 authorized_keys 확인
ssh deploy@your-server "cat ~/.ssh/authorized_keys"

# 3. 키 지문 확인
ssh-keygen -lf ~/.ssh/deploy_key.pub
ssh deploy@your-server "ssh-keygen -lf ~/.ssh/authorized_keys"
# 지문이 같아야 함
```

### PM2 "permission denied" 에러

```bash
# 1. PM2 설치 경로 확인
which pm2

# 2. 권한 확인
ls -la /usr/local/bin/pm2

# 3. deploy 계정으로 다시 설치
sudo su - deploy
npm install -g pm2
```

### 배포 후 502 Bad Gateway

```bash
# 1. PM2 상태 확인
pm2 status

# 2. 에러 로그 확인
pm2 logs edu --err --lines 50

# 3. 포트 확인
netstat -tuln | grep 3000
lsof -i :3000

# 4. 앱 재시작
pm2 restart edu
```

---

## 모니터링

```bash
# deploy 계정에서 실행
pm2 monit          # 실시간 모니터링
pm2 status         # 상태 확인
pm2 logs           # 로그 확인
pm2 kill          # 프로세스 중지 (비상용)
```

---

## 정리

| 항목 | 값 |
|------|-----|
| 배포 계정 | `deploy` |
| 홈 디렉토리 | `/home/deploy` |
| 프로젝트 경로 | `/home/deploy/projects/edu` |
| 로그 경로 | `/home/deploy/logs` |
| 배포 키 | `~/.ssh/deploy_key` (로컬) |
| GitHub Secret | `DEPLOY_KEY` |
