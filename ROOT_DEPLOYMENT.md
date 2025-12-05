# 🚀 Root로 5분 안에 배포 자동화 설정

## 당신의 상황에 맞는 가장 간단한 방법

- 개인 프로젝트
- 혼자 운영
- 빠르게 구축하고 싶음

**→ Root 계정으로 진행하세요. 나중에 언제든 변경 가능합니다.**

---

## 📋 필요한 것

1. GitHub 저장소
2. Ubuntu/Linux 서버 (Root 접근 가능)
3. 로컬 머신 (SSH 키 생성용)
4. 5분

---

## ⚡ 5단계 빠른 설정

### Step 1️⃣: SSH 키 생성 (로컬, 1분)

```bash
# 로컬 머신에서 실행
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/root_deploy_key -N ""

# 공개 키 확인 (GitHub Secret에 복사할 것)
cat ~/.ssh/root_deploy_key.pub
# 출력: ssh-ed25519 AAAAC3NzaC... github-actions
```

### Step 2️⃣: 서버에 공개 키 등록 (1분)

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
```

### Step 3️⃣: GitHub Secrets 설정 (1분)

GitHub 리포지토리 → Settings → Secrets and variables → Actions

**추가:**
```
SERVER_HOST = your-server-ip (또는 도메인)
SERVER_PORT = 22
SSH_KEY = Step 1에서 생성한 개인 키 내용
        (-----BEGIN ED25519 PRIVATE KEY----- 포함 전체)
```

**기존 삭제:**
```
DEPLOY_KEY (더 이상 필요 없음)
```

### Step 4️⃣: 서버 초기 설정 (2분)

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

### Step 5️⃣: 테스트 (1분)

```bash
# 로컬에서
git push origin main

# 확인
# 1. GitHub Actions 탭 → 배포 과정 확인
# 2. curl https://your-domain.com/api/health
# 3. pm2 logs edu (서버에서)
```

---

## ✅ 체크리스트

- [ ] SSH 키 생성됨
- [ ] 서버에 공개 키 등록됨
- [ ] GitHub Secrets 설정됨
- [ ] 프로젝트 클론 및 빌드 완료
- [ ] PM2 실행 중
- [ ] 첫 배포 테스트 성공
- [ ] curl /api/health 정상 응답

---

## 🔧 유용한 명령어

```bash
# 서버에서
pm2 status              # 상태 확인
pm2 logs edu            # 로그 확인
pm2 logs edu --err      # 에러만 확인
pm2 restart edu         # 재시작
pm2 stop edu            # 중단
pm2 start ecosystem.config.js  # 시작

# 배포 로그
tail -f /var/www/edu/logs/deploy.log
```

---

## ⚠️ 문제 해결

### SSH 연결 실패

```bash
# 1. 로컬에서 키 권한 확인
chmod 600 ~/.ssh/root_deploy_key

# 2. SSH 연결 테스트
ssh -i ~/.ssh/root_deploy_key root@your-server-ip "whoami"
# 출력: root

# 3. 서버의 authorized_keys 확인
ssh root@your-server-ip "ls -la ~/.ssh/authorized_keys"
# -rw------- 이어야 함
```

### "Permission denied" 에러

```bash
# authorized_keys 권한 문제
ssh root@your-server-ip
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 배포 후 502 에러

```bash
# 서버에서 확인
pm2 status
pm2 logs edu --err --lines 50
pm2 restart edu
```

---

## 🔄 나중에 deploy 계정으로 업그레이드하기

필요하면 언제든 이렇게 변경 가능:

```bash
# 1. deploy 계정 생성
sudo useradd -m -s /bin/bash deploy

# 2. 프로젝트 복사
sudo cp -r /var/www/edu /home/deploy/projects/
sudo chown -R deploy:deploy /home/deploy/projects

# 3. GitHub Secrets 변경
# SSH_KEY → deploy의 개인 키

# 4. 워크플로우 수정
# username: root → deploy
# /root → /home/deploy

# 5. 배포 테스트
git push origin main

# 완료! 5분 안에 업그레이드됨
```

---

## 📁 최종 구조

```
/root/
├── projects/
│   └── edu/
│       ├── .github/workflows/deploy.yml
│       ├── .env.production
│       ├── ecosystem.config.js
│       ├── scripts/deploy.sh
│       ├── logs/
│       │   └── deploy.log
│       └── (Next.js 프로젝트 파일들)
```

---

## 📊 설정 비교

| 방법 | 시간 | 복잡도 | 보안 |
|------|------|--------|------|
| **Root (현재)** | 5분 | 매우 낮음 | 낮음 |
| deploy 계정 | 15분 | 높음 | 높음 |

**당신의 상황:** Root가 최적 → 나중에 upgrade 가능

---

## 🎉 완료!

이제 `git push origin main` 할 때마다 자동으로 배포됩니다.

- GitHub Actions이 빌드
- 서버에 SSH로 접속
- PM2로 앱 재시작
- 헬스 체크 통과
- 배포 완료

**모든 것이 자동화되었습니다!** 🚀

---

## 📚 더 알아보기

- `docs/SIMPLE_VS_SECURE.md` - Root vs deploy 계정 비교
- `docs/ROOT_QUICK_START.md` - 상세 설정 가이드
- `docs/SERVER_SETUP.md` - 고급 설정 (Nginx, SSL 등)
- `DEPLOYMENT.md` - 배포 가이드
