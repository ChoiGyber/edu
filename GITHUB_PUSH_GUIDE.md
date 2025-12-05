# 🚀 GitHub에 푸시하기 (edu 저장소)

## ✅ 현재 상태

- ✅ 로컬 Git 초기화 완료
- ✅ 첫 커밋 완료  
- ✅ main 브랜치로 이름 변경 완료
- ⏳ GitHub에 푸시 남음

---

## 📍 다음 단계: GitHub 저장소 연결 및 푸시

### Step 1: 당신의 GitHub 정보 확인

GitHub에서 다음 정보를 확인하세요:
- 저장소 URL: `https://github.com/YOUR_USERNAME/edu`
- 저장소명: `edu`

### Step 2: 원격 저장소 추가

```bash
# SSH 방식 (권장)
git remote add origin git@github.com:YOUR_USERNAME/edu.git

# 또는 HTTPS 방식 (SSH 키 없으면)
git remote add origin https://github.com/YOUR_USERNAME/edu.git
```

**YOUR_USERNAME을 당신의 GitHub 사용자명으로 바꿔주세요!**

예시:
```bash
# SSH
git remote add origin git@github.com:rockg/edu.git

# HTTPS
git remote add origin https://github.com/rockg/edu.git
```

### Step 3: 원격 저장소 확인

```bash
git remote -v
# origin  git@github.com:YOUR_USERNAME/edu.git (fetch)
# origin  git@github.com:YOUR_USERNAME/edu.git (push)
```

### Step 4: GitHub에 푸시

```bash
git push -u origin main

# 완료!
```

---

## 🔑 SSH 키 설정 (처음 사용하면)

SSH 방식을 사용하려면 GitHub에 공개 키를 등록해야 합니다.

### SSH 키 생성

```bash
# SSH 키가 없으면 생성
ssh-keygen -t ed25519 -C "your-email@github.com"

# 엔터 누르기 (3번)
# 기본 위치에 저장됨: ~/.ssh/id_ed25519
```

### GitHub에 공개 키 등록

```bash
# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# 출력 예:
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... your-email@github.com
```

GitHub 설정에서 등록:
1. https://github.com/settings/keys 방문
2. "New SSH key" 클릭
3. 공개 키 내용 붙여넣기
4. "Add SSH key" 클릭

### SSH 연결 테스트

```bash
ssh -T git@github.com
# Hi YOUR_USERNAME! You've successfully authenticated.
```

---

## 📊 선택지

### 옵션 1: SSH 사용 (권장)

```bash
# Step 1: SSH 키 설정 (위 참조)

# Step 2: 원격 저장소 추가
git remote add origin git@github.com:YOUR_USERNAME/edu.git

# Step 3: 푸시
git push -u origin main
```

**장점:**
- 매번 비밀번호 입력 안 함
- 자동화에 최적
- 보안이 좋음

### 옵션 2: HTTPS 사용

```bash
# Step 1: 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/edu.git

# Step 2: 푸시
git push -u origin main

# 첫 푸시 시 GitHub 계정으로 인증
# Personal Access Token 필요 (생성 방법: GitHub Settings)
```

**장점:**
- 설정 간단
- SSH 키 불필요

**단점:**
- 매번 토큰/비밀번호 필요
- 자동화에는 SSH가 낫음

---

## ✅ 완료 확인

푸시가 완료되면:

```bash
# 1. 로컬 상태 확인
git log --oneline
# 3417155 Initial commit: Setup deployment automation

# 2. GitHub에서 확인
# https://github.com/YOUR_USERNAME/edu
# → 파일들이 보이는지 확인
```

---

## 🎯 푸시 완료 후

### GitHub Secrets 설정

다음 파일을 참조하세요:
- `FINAL_SETUP.md` → Step 3: GitHub Secrets 설정

### 서버 설정

다음 파일을 참조하세요:
- `FINAL_SETUP.md` → Step 4: 서버 프로젝트 설정

---

## 📝 앞으로 매일할 일

코드 수정 후:

```bash
# 1. 변경사항 확인
git status

# 2. 스테이징
git add .

# 3. 커밋
git commit -m "Describe your changes"

# 4. 푸시
git push origin main

# 5. 자동 배포 (GitHub Actions)
# → 서버의 /var/www/edu에 자동 배포됨
# → pm2 restart edu
```

---

## ⚠️ 주의사항

```bash
# ❌ 하지 말 것
git push origin main --force

# ✅ 올바른 방법
git push origin main
```

---

**GitHub 푸시 완료! 이제 배포 자동화 설정을 시작하세요.** 🚀
