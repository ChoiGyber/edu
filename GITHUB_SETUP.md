# 🔗 GitHub 연결 설정 (edu 저장소)

## 📋 필수 정보

먼저 다음 정보를 GitHub에서 확인하세요:

```
GitHub 저장소: https://github.com/YOUR_USERNAME/edu
저장소 이름: edu
```

---

## ⚡ 4단계 설정

### Step 1: 로컬 Git 초기화 (1분)

```bash
# 현재 디렉토리에서
cd /Users/rockg/Project/Edu

# Git 초기화
git init

# 확인
git status
# On branch master (또는 main)
```

### Step 2: GitHub 저장소 연결 (1분)

```bash
# 원격 저장소 추가
git remote add origin git@github.com:YOUR_USERNAME/edu.git

# 또는 HTTPS 방식 (SSH 키 없으면)
git remote add origin https://github.com/YOUR_USERNAME/edu.git

# 확인
git remote -v
# origin  git@github.com:YOUR_USERNAME/edu.git (fetch)
# origin  git@github.com:YOUR_USERNAME/edu.git (push)
```

### Step 3: 첫 커밋 (1분)

```bash
# 모든 파일 스테이징
git add .

# 초기 커밋
git commit -m "Initial commit: Setup deployment automation"

# 확인
git log --oneline | head -1
```

### Step 4: GitHub에 푸시 (1분)

```bash
# main 브랜치로 푸시
git branch -M main
git push -u origin main

# 완료!
# GitHub에서 확인: https://github.com/YOUR_USERNAME/edu
```

---

## ✅ 확인 체크리스트

```bash
# 1. Git 초기화 확인
git status
# On branch main

# 2. 원격 저장소 확인
git remote -v
# origin  git@github.com:YOUR_USERNAME/edu.git (fetch)
# origin  git@github.com:YOUR_USERNAME/edu.git (push)

# 3. 커밋 확인
git log
# commit ... Initial commit: Setup deployment automation

# 4. GitHub에서 확인
# https://github.com/YOUR_USERNAME/edu
# → 파일들이 보이는지 확인
```

---

## 🔧 SSH vs HTTPS 선택

### SSH 방식 (권장)
```bash
git remote add origin git@github.com:YOUR_USERNAME/edu.git

장점:
- 매번 비밀번호 입력 안 함
- GitHub Actions에서 사용
- 더 안전함

단점:
- SSH 키 설정 필요
```

### HTTPS 방식
```bash
git remote add origin https://github.com/YOUR_USERNAME/edu.git

장점:
- 설정 간단
- SSH 키 불필요

단점:
- 매번 토큰/비밀번호 입력
- 자동화 어려움
```

---

## 🔑 SSH 키가 없으면?

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your-email@example.com"
# 그냥 Enter 누르면 기본 위치에 저장됨

# GitHub에 공개 키 등록
cat ~/.ssh/id_ed25519.pub
# 복사하고 https://github.com/settings/keys에서 등록

# SSH 연결 테스트
ssh -T git@github.com
# Hi YOUR_USERNAME! You've successfully authenticated.
```

---

## 📝 변경사항이 있을 때

### 로컬에서 수정 후
```bash
# 변경사항 확인
git status

# 스테이징
git add .

# 커밋
git commit -m "Describe your changes"

# GitHub에 푸시
git push origin main
```

### 자동 배포
```bash
# main 브랜치에 push하면 자동으로:
# 1. GitHub Actions 실행
# 2. 서버의 /var/www/edu로 배포
# 3. pm2 restart edu

매번 서버에 수동으로 접속할 필요 없음!
```

---

## ⚠️ 실수 방지

```bash
# ❌ 하지 말 것
git push origin main --force
# 히스토리 덮어써짐, 위험함!

# ✅ 올바른 방법
git push origin main
# 그냥 일반적으로 푸시
```

---

## 🎯 완료!

이제:
- ✅ 로컬 프로젝트가 GitHub에 연결됨
- ✅ 모든 파일이 GitHub에 업로드됨
- ✅ GitHub Actions 자동 배포 준비 완료
- ✅ 서버의 /var/www/edu에 자동 배포됨

**다음: FINAL_SETUP.md의 Step 3 (GitHub Secrets)부터 진행하세요!**
