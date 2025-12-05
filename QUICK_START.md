# ⚡ 빠른 시작 가이드 (Quick Start)

> 자동 배포 설정 완료! 이 파일은 나머지 4단계를 빠르게 진행하기 위한 가이드입니다.

---

## 🎯 4단계 빠른 진행

### Step 1️⃣ : 서버 준비 (10분)

```bash
# SSH로 접속
ssh root@your-server-ip

# 디렉토리 생성
mkdir -p /var/www
cd /var/www

# 프로젝트 클론
git clone https://github.com/ChoiGyber/edu.git
cd edu

# 의존성 설치 및 빌드
npm ci
npm run build

# 환경 변수 파일 생성 및 편집
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=생성된-시크릿-키
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://사용자:비밀번호@localhost:5432/edu_db
DIRECT_URL=postgresql://사용자:비밀번호@localhost:5432/edu_db
EOF

# PM2 설정 및 시작
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

✅ **Step 1 완료 확인:**
```bash
pm2 status  # edu가 online 상태인가?
pm2 logs edu  # 에러 없는가?
```

---

### Step 2️⃣ : SSH 키 설정 (2분)

**로컬 머신에서 실행:**

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/root_deploy_key -N ""

# 공개 키 확인 (전체 복사)
cat ~/.ssh/root_deploy_key.pub
```

**서버에서 실행:**

```bash
# 서버 접속
ssh root@your-server-ip

# 공개 키 추가
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... github-actions
EOF

# 권한 설정
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

✅ **Step 2 완료 확인 (로컬에서):**
```bash
ssh -T git@github.com  # SSH 연결 테스트
```

---

### Step 3️⃣ : GitHub Secrets 설정 (3분)

**GitHub 웹 인터페이스:**

1. https://github.com/ChoiGyber/edu/settings/secrets/actions 방문
2. "New repository secret" 클릭

**추가할 Secrets:**

| Name | Value |
|------|-------|
| `SERVER_HOST` | your-server-ip (예: 192.168.1.100) |
| `SERVER_PORT` | 22 |
| `SSH_KEY` | ~/.ssh/root_deploy_key 파일의 전체 내용 (프라이빗 키) |

각 Secret 추가 시:
- "Add secret" 클릭
- 다음 Secret 추가

✅ **Step 3 완료 확인:**
- 3개 Secret이 모두 등록되었는가?

---

### Step 4️⃣ : 배포 테스트 (1분)

**로컬에서 실행:**

```bash
# 테스트 커밋 생성
echo "# Deployment test" >> README.md
git add README.md
git commit -m "Test automatic deployment"
git push origin main
```

**배포 확인:**

1. **GitHub Actions 탭 확인:**
   - https://github.com/ChoiGyber/edu/actions
   - 최신 워크플로우가 실행 중인가?
   - 초록색 체크 표시가 보이는가?

2. **서버에서 확인:**
   ```bash
   ssh root@your-server-ip
   pm2 logs edu  # 최신 배포 로그 확인
   ```

3. **웹 브라우저에서 테스트:**
   ```bash
   curl https://your-domain.com/api/health
   # 응답이 오는가?
   ```

✅ **Step 4 완료 확인:**
- GitHub Actions 실행 완료?
- 서버에 배포 완료?
- 웹 브라우저에서 접근 가능?

---

## 🔄 일상 배포 흐름

```bash
# 1. 로컬에서 코드 수정
nano src/components/Header.tsx

# 2. 변경사항 커밋
git add .
git commit -m "Update header styling"

# 3. 푸시 (자동 배포 시작!)
git push origin main

# 완료! 서버에 자동 배포됩니다.
```

---

## 🐛 문제 해결

### "GitHub Actions 실패"

```bash
# 확인 사항
1. GitHub Secrets 재확인
2. 서버 방화벽 22번 포트 오픈 확인
3. SSH 키 권한 확인: ssh root@your-server-ip
```

### "서버 배포 실패"

```bash
# 서버에서 확인
ssh root@your-server-ip
pm2 logs edu  # 에러 메시지 확인

# 일반적인 문제
1. .env.production 파일 없음
2. DATABASE_URL 오류
3. npm 의존성 설치 실패
```

### "배포됐지만 앱이 안 뜸"

```bash
# 서버에서 확인
pm2 status  # edu 상태 확인 (online이어야 함)
pm2 logs edu  # 에러 로그 확인
pm2 restart edu  # 재시작
```

---

## 📋 최종 체크리스트

- [ ] Step 1: 서버 준비 완료
- [ ] Step 2: SSH 키 설정 완료
- [ ] Step 3: GitHub Secrets 설정 완료
- [ ] Step 4: 배포 테스트 완료
- [ ] 브라우저에서 앱 접근 확인
- [ ] GitHub Actions 실행 완료
- [ ] 서버 로그에 에러 없음

---

## 🎯 다음은?

모든 설정이 완료되면:

```
git push origin main
    ↓
자동 배포! ✅
```

더 이상 서버에 수동으로 접속할 필요가 없습니다!

---

## 📚 더 자세한 정보

- **`DEPLOYMENT_CHECKLIST.md`** - 상세 체크리스트
- **`README_DEPLOYMENT.md`** - 배포 개요 및 명령어
- **`SETUP_COMPLETE.md`** - 완료 현황 및 가이드

---

**준비 완료! 이제 Step 1부터 시작하세요!** 🚀
