# 🚀 Root로 5분 안에 자동 배포 설정

당신의 상황에 맞는 **가장 간단한 방법입니다.**

---

## Step 1: GitHub Secrets 설정 (1분)

GitHub 리포지토리 → Settings → Secrets and variables → Actions

**추가할 항목:**
```
SERVER_HOST = your-server-ip (또는 도메인)
SERVER_PORT = 22
SSH_KEY = root 개인 키 (아래 생성)
```

---

## Step 2: SSH 키 생성 (로컬, 1분)

```bash
# 로컬 머신에서
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/root_deploy_key -N ""

# 공개 키 확인
cat ~/.ssh/root_deploy_key.pub
```

---

## Step 3: 서버에 공개 키 등록 (1분)

```bash
# 서버에 SSH로 접속
ssh root@your-server-ip

# 공개 키 등록
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC... github-actions
EOF

chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 확인
ls -la ~/.ssh/
# authorized_keys: -rw------- (600)
```

---

## Step 4: GitHub Actions 워크플로우 수정 (1분)

`.github/workflows/deploy.yml` 수정:

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: root
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SERVER_PORT }}
          script: |
            cd /var/www/edu
            git pull origin main
            npm ci
            npm run build
            pm2 restart "edu" || pm2 start npm --name "edu" -- start
            pm2 save
            echo "✅ Deployment completed!"

      - name: Send success notification
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '✅ Deployment successful!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Send failure notification
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '❌ Deployment failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Step 5: 서버 프로젝트 설정 (2분)

```bash
# Root로 로그인
ssh root@your-server-ip

# 프로젝트 디렉토리 생성
mkdir -p /root/projects
cd /root/projects

# GitHub에서 클론
git clone git@github.com:YOUR_USERNAME/edu.git
cd edu

# 초기 설정
npm ci
npm run build

# 환경 변수 파일 생성
nano .env.production
# 다음 내용 입력:
# NODE_ENV=production
# NEXT_PUBLIC_APP_URL=https://your-domain.com
# NEXTAUTH_SECRET=<value>
# NEXTAUTH_URL=https://your-domain.com
# DATABASE_URL=postgresql://...
# OPENAI_API_KEY=...

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

# 확인
pm2 status
pm2 logs edu
```

---

## Step 6: 테스트 (1분)

```bash
# 로컬에서
git push origin main

# GitHub Actions 확인
# → GitHub 리포지토리 → Actions 탭

# 배포 완료 확인
curl https://your-domain.com/api/health

# 또는 서버에서
pm2 logs edu
```

---

## 체크리스트

- [ ] SSH 키 생성됨
- [ ] 서버에 공개 키 등록됨
- [ ] GitHub Secrets 설정됨
- [ ] 워크플로우 파일 수정됨
- [ ] 프로젝트 클론됨
- [ ] PM2 실행 중
- [ ] 첫 배포 성공

---

## 문제 해결

### "Permission denied" 에러

```bash
# 로컬에서 키 권한 확인
chmod 600 ~/.ssh/root_deploy_key

# 서버에서 authorized_keys 확인
ssh root@your-server "ls -la ~/.ssh/authorized_keys"
# -rw------- 이어야 함
```

### SSH 연결 테스트

```bash
ssh -i ~/.ssh/root_deploy_key root@your-server-ip "whoami"
# 출력: root
```

### PM2 상태 확인

```bash
pm2 status
pm2 logs edu --err
```

---

## 다음: 보안 업그레이드 (선택사항)

나중에 deploy 계정으로 변경하려면:

```bash
# 1. 사용자 계정 생성
sudo useradd -m -s /bin/bash deploy

# 2. 프로젝트 복사
sudo cp -r /var/www/edu /home/deploy/projects/
sudo chown -R deploy:deploy /home/deploy/projects

# 3. GitHub Secrets 변경
# SSH_KEY → deploy의 개인 키로 변경

# 4. 워크플로우 수정
# username: root → deploy
# cd /root → cd /home/deploy

# 5. 배포 테스트
git push origin main
```

**총 5분 안에 업그레이드됨!**

---

## 최종 정리

| 항목 | 값 |
|------|-----|
| 설정 시간 | 5~6분 |
| 프로젝트 경로 | `/var/www/edu` |
| PM2 앱 이름 | `edu` |
| 배포 계정 | `root` |
| 환경 파일 | `/var/www/edu/.env.production` |

**준비 완료! 배포 자동화를 시작하세요.** 🚀
