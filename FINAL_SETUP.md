# 🚀 최종 배포 설정: /var/www/edu

서버 디렉토리: **`/var/www/edu`**로 확정되었습니다.

---

## 📋 현재 설정

| 항목 | 값 |
|------|-----|
| 프로젝트 경로 | `/var/www/edu` |
| 배포 계정 | `root` |
| PM2 앱 이름 | `edu` |
| 환경 파일 | `/var/www/edu/.env.production` |
| 로그 파일 | `/var/www/edu/logs/deploy.log` |
| 배포 스크립트 | `/var/www/edu/scripts/deploy.sh` |

---

## ✅ 최종 5단계 설정

### Step 1: SSH 키 생성 (로컬, 1분)

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/root_deploy_key -N ""
cat ~/.ssh/root_deploy_key.pub
```

### Step 2: 서버에 공개 키 등록 (1분)

```bash
ssh root@your-server-ip

mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC... github-actions
EOF

chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Step 3: GitHub Secrets 설정 (1분)

```
SERVER_HOST = your-server-ip
SERVER_PORT = 22
SSH_KEY = 위에서 생성한 개인 키 전체
```

### Step 4: 서버에서 프로젝트 설정 (2분)

```bash
ssh root@your-server-ip

# 디렉토리 생성
mkdir -p /var/www
cd /var/www

# GitHub에서 클론
git clone git@github.com:YOUR_USERNAME/edu.git
cd edu

# 초기 설정
npm ci
npm run build

# 환경 변수 파일
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=<생성된 시크릿>
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
EOF

# PM2 설정
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'edu',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/edu',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '500M',
  }],
};
EOF

# PM2 시작
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Step 5: 배포 테스트 (1분)

```bash
git push origin main

# 확인:
# 1. GitHub Actions 탭에서 배포 과정 확인
# 2. curl https://your-domain.com/api/health
# 3. pm2 logs edu (서버에서)
```

---

## 🔄 변경된 파일들

### `.github/workflows/deploy.yml`
```yaml
script: |
  cd /var/www/edu
  git pull origin main
  npm ci
  npm run build
  pm2 restart "edu"
```

### `scripts/deploy.sh`
```bash
PROJECT_DIR="/var/www/edu"
```

### `ecosystem.config.js`
```javascript
cwd: '/var/www/edu'
```

---

## 📚 참고 문서

- **`ROOT_DEPLOYMENT.md`** - Root 계정 빠른 시작
- **`docs/ROOT_QUICK_START.md`** - 상세 설정 가이드
- **`docs/SIMPLE_VS_SECURE.md`** - Root vs Deploy 비교

---

## 🎯 다음 단계

1. **SSH 키 생성** (Step 1)
2. **서버에 키 등록** (Step 2)
3. **GitHub Secrets 설정** (Step 3)
4. **서버 프로젝트 설정** (Step 4)
5. **첫 배포 테스트** (Step 5)

**총 6분 안에 완료!**

---

## ✨ 완료!

이제 `git push origin main`할 때마다 자동으로 배포됩니다.

```
git push
  ↓
GitHub Actions 트리거
  ↓
cd /var/www/edu
git pull + npm ci + npm run build
  ↓
pm2 restart edu
  ↓
배포 완료! ✅
```

---

## 🔧 자주 사용하는 명령어

```bash
# 서버에서
cd /var/www/edu

# 상태 확인
pm2 status
pm2 logs edu

# 재시작
pm2 restart edu

# 로그 확인
tail -f /var/www/edu/logs/deploy.log

# 환경 변수 수정
nano .env.production
```

---

**준비 완료! 배포 자동화를 시작하세요.** 🚀
