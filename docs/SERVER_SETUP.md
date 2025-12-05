# 서버 배포 가이드

## 서버 초기 설정

### 1. 환경 설치

```bash
# Node.js 18+ 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리)
npm install -g pm2

# Git 설치
sudo apt-get install -y git

# Nginx 설치 (리버스 프록시)
sudo apt-get install -y nginx

# Curl 설치 (헬스 체크용)
sudo apt-get install -y curl
```

### 2. 프로젝트 디렉토리 생성 및 클론

```bash
# 프로젝트 디렉토리 생성
mkdir -p /home/ubuntu/projects
cd /home/ubuntu/projects

# GitHub 저장소 클론 (SSH 키 필요)
git clone git@github.com:YOUR_USERNAME/edu.git
cd edu

# 의존성 설치
npm ci

# 초기 빌드
npm run build
```

### 3. 환경 변수 설정

`.env.production` 파일 생성:

```bash
# 서버에서
nano /home/ubuntu/projects/edu/.env.production
```

```env
# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# NextAuth
NEXTAUTH_SECRET=<생성된 시크릿 키>
NEXTAUTH_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/safety_edu

# OAuth (GitHub Secrets에 저장된 값)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
KAKAO_CLIENT_ID=<your-client-id>
KAKAO_CLIENT_SECRET=<your-client-secret>
NAVER_CLIENT_ID=<your-client-id>
NAVER_CLIENT_SECRET=<your-client-secret>

# API Keys
OPENAI_API_KEY=<your-api-key>
CLOUDFLARE_R2_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_R2_ACCESS_KEY=<your-access-key>
CLOUDFLARE_R2_SECRET_KEY=<your-secret-key>
CLOUDFLARE_R2_BUCKET=<your-bucket-name>

# Email (Resend)
RESEND_API_KEY=<your-api-key>
```

### 4. PM2 앱 설정

`ecosystem.config.js` 생성:

```bash
cat > /home/ubuntu/projects/edu/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'edu',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/projects/edu',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    autorestart: true,
    kill_timeout: 10000,
  }],
};
EOF
```

### 5. PM2 시작

```bash
cd /home/ubuntu/projects/edu

# PM2 시작
pm2 start ecosystem.config.js

# PM2 자동 시작 설정 (부팅 시 자동 실행)
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# 상태 확인
pm2 status
pm2 logs edu
```

### 6. Nginx 리버스 프록시 설정

```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/edu
```

```nginx
upstream safety_edu {
  server 127.0.0.1:3000;
  keepalive 64;
}

server {
  listen 80;
  listen [::]:80;
  server_name your-domain.com www.your-domain.com;

  # HTTP → HTTPS 리다이렉트
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name your-domain.com www.your-domain.com;

  # SSL 인증서 (Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # 보안 헤더
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # 로깅
  access_log /var/log/nginx/edu-access.log;
  error_log /var/log/nginx/edu-error.log;

  # 프록시 설정
  location / {
    proxy_pass http://safety_edu;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
  }

  # 정적 파일 캐싱
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # gzip 압축
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;
}
```

```bash
# Nginx 활성화
sudo ln -s /etc/nginx/sites-available/edu /etc/nginx/sites-enabled/

# 설정 검증
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 7. SSL 인증서 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 확인
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 8. 헬스 체크 엔드포인트

Next.js 앱에 `/api/health` 엔드포인트 추가:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

### 9. 배포 테스트

```bash
# 수동 배포 테스트
cd /home/ubuntu/projects/edu
./scripts/deploy.sh

# 로그 확인
tail -f logs/deploy.log
pm2 logs edu
```

---

## GitHub Actions에 필요한 Secrets 설정

GitHub 리포지토리 Settings → Secrets and variables → Actions에서 다음을 추가:

| 이름 | 설명 |
|------|------|
| `SERVER_HOST` | 서버 IP 또는 도메인 |
| `SERVER_USER` | SSH 사용자명 (예: ubuntu) |
| `SERVER_PORT` | SSH 포트 (기본: 22) |
| `SERVER_SSH_KEY` | 서버 SSH 개인 키 |
| `NEXTAUTH_SECRET` | NextAuth 시크릿 |
| `NEXTAUTH_URL` | 앱 URL |
| `DATABASE_URL` | 데이터베이스 연결 문자열 |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `SLACK_WEBHOOK` | (선택) Slack 알림용 |

---

## SSH 키 생성

### 로컬 머신에서:

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "github-actions" -f ./deploy_key -N ""

# 공개 키를 서버에 등록
cat deploy_key.pub | ssh ubuntu@your-server.com "cat >> ~/.ssh/authorized_keys"
```

### GitHub Secrets에 저장:

`deploy_key` (개인 키) 파일 내용을 `SERVER_SSH_KEY` Secret에 복사

---

## 모니터링 및 로깅

### PM2 모니터링

```bash
# 실시간 모니터링
pm2 monit

# 상세 로그 보기
pm2 logs edu --lines 100

# 특정 에러만 필터링
pm2 logs edu --err
```

### Nginx 로그

```bash
# 접근 로그
tail -f /var/log/nginx/edu-access.log

# 에러 로그
tail -f /var/log/nginx/edu-error.log
```

### Sentry 통합 (에러 모니터링)

```env
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

---

## 문제 해결

### 배포 후 502 Bad Gateway 에러

```bash
# 1. PM2 상태 확인
pm2 status

# 2. 앱 로그 확인
pm2 logs edu --err

# 3. 포트 확인 (3000이 사용 중인지)
lsof -i :3000

# 4. 앱 재시작
pm2 restart edu
```

### GitHub Actions 배포 실패

```bash
# SSH 키 권한 확인
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# SSH 접속 테스트
ssh -v -i deploy_key ubuntu@your-server.com "whoami"
```

### 디스크 공간 부족

```bash
# 디스크 사용량 확인
df -h

# PM2 로그 정리
pm2 flush

# 오래된 빌드 파일 제거
rm -rf /home/ubuntu/projects/edu/.next
npm run build
```

---

## 자동 배포 흐름

```
GitHub Push (main)
    ↓
GitHub Actions 트리거
    ↓
1. Node.js 설정
2. 의존성 설치
3. 빌드 (npm run build)
4. SSH로 서버 접속
5. 코드 풀링 (git pull)
6. 의존성 설치 (npm ci)
7. 빌드 (npm run build)
8. PM2 재시작
9. 헬스 체크
    ↓
배포 완료 (또는 실패 알림)
```
