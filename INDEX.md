# 📑 배포 가이드 색인 (Complete Index)

자동 배포 설정 완료! 이 문서는 모든 배포 관련 문서의 색인입니다.

---

## 🚀 빠른 시작 (추천 순서)

### 1단계: 빠른 시작하기
- **`QUICK_START.md`** ⭐ **지금 읽으세요!**
  - 4단계 빠른 설정 가이드 (약 20분)
  - 복사-붙여넣기 가능한 명령어들
  - 각 단계별 확인 방법

### 2단계: 상세 설정하기
- **`DEPLOYMENT_CHECKLIST.md`** ⭐
  - Step별 상세 체크리스트
  - 자세한 설명 및 주의사항
  - 문제 해결 가이드

### 3단계: 개념 이해하기
- **`README_DEPLOYMENT.md`**
  - 배포 개요 및 아키텍처
  - 배포 흐름 다이어그램
  - 자주 사용하는 명령어 모음

### 4단계: 완료 확인하기
- **`SETUP_COMPLETE.md`**
  - 설정 완료 현황
  - 다음 단계 안내
  - 학습 자료 및 참고사항

---

## 📚 전체 가이드 문서 (주제별)

### 🎯 핵심 배포 가이드

| 문서 | 내용 | 난이도 | 소요시간 |
|------|------|--------|---------|
| `QUICK_START.md` | 4단계 빠른 설정 | ⭐ 쉬움 | 20분 |
| `DEPLOYMENT_CHECKLIST.md` | 상세 체크리스트 + 명령어 | ⭐⭐ 중간 | 30분 |
| `README_DEPLOYMENT.md` | 개요 + 흐름도 + 참고 | ⭐⭐ 중간 | 15분 |
| `SETUP_COMPLETE.md` | 완료 현황 + 가이드 | ⭐⭐ 중간 | 20분 |

### 📖 이전 단계 기록 (참고용)

| 문서 | 내용 | 용도 |
|------|------|------|
| `FINAL_SETUP.md` | Root 계정 최종 설정 | 이전 단계 기록 |
| `NEXT_STEPS.md` | 다음 단계 요약 | 이전 단계 기록 |
| `ROOT_DEPLOYMENT.md` | Root 계정 배포 가이드 | 참고용 |
| `GITHUB_SETUP.md` | GitHub 저장소 연결 | 참고용 |
| `GITHUB_PUSH_GUIDE.md` | GitHub 푸시 가이드 | 참고용 |
| `ACCOUNT_SETUP_SUMMARY.md` | 계정 설정 요약 | 참고용 |

### ⚠️ 선택 사항 (참고용)

| 문서 | 내용 |
|------|------|
| `DEPLOYMENT.md` | 초기 배포 설정 |
| `DEPLOYMENT_CHOICE.md` | Root vs Deploy 선택 |
| `DEPLOYMENT_GUIDE.md` | 배포 가이드 |
| `VERCEL_SETUP_CHECKLIST.md` | Vercel 배포 (선택사항) |

---

## 🔧 배포 설정 파일

### 핵심 파일들

```
.github/
  └─ workflows/
      └─ deploy.yml              # GitHub Actions 워크플로우

ecosystem.config.js              # PM2 설정

scripts/
  └─ deploy.sh                  # 서버 배포 스크립트

.gitignore                       # Git 무시 파일
```

---

## 🎯 상황별 가이드

### 배포를 처음 설정하는 경우
```
1. QUICK_START.md 읽기
2. Step 1부터 4까지 진행
3. 배포 테스트
4. 완료!
```

### 배포가 실패한 경우
```
1. DEPLOYMENT_CHECKLIST.md의 "문제 해결" 섹션 확인
2. README_DEPLOYMENT.md의 "자주 발생하는 문제" 확인
3. GitHub Actions 로그 확인
4. 서버 PM2 로그 확인
```

### 배포 개념을 이해하고 싶은 경우
```
1. README_DEPLOYMENT.md의 배포 흐름 다이어그램 확인
2. SETUP_COMPLETE.md의 학습 자료 읽기
3. .github/workflows/deploy.yml 파일 검토
4. ecosystem.config.js 파일 검토
```

### 매일 배포하는 방법
```
1. 코드 수정
2. git add .
3. git commit -m "메시지"
4. git push origin main
5. 자동 배포! ✅
```

---

## 📊 배포 설정 구조

```
당신의 컴퓨터
    ↓ (git push origin main)
GitHub 저장소 (main 브랜치)
    ↓ (webhook trigger)
GitHub Actions
    ↓ (SSH 연결)
서버 (/var/www/edu)
    ↓ (git pull, build, pm2 restart)
배포 완료! ✅
```

---

## ✅ 설정 완료 확인

### 기본 설정
- ✅ GitHub 저장소 생성
- ✅ 로컬 프로젝트 연결
- ✅ 198개 파일 푸시
- ✅ CI/CD 파이프라인 구성
- ✅ PM2 설정
- ✅ 빌드 성공 (83개 페이지)

### 남은 설정 (4단계)
- ⏳ Step 1: 서버 준비
- ⏳ Step 2: SSH 키 설정
- ⏳ Step 3: GitHub Secrets 설정
- ⏳ Step 4: 배포 테스트

---

## 🔐 보안 정보

**배포 계정**: root
**서버 디렉토리**: `/var/www/edu`
**인증 방식**: SSH 공개 키
**프로세스 관리**: PM2
**환경 변수**: `.env.production` (서버에만 존재)

### 주의사항
```bash
❌ 절대 하지 마세요:
- GitHub에 .env.production 푸시
- SSH 프라이빗 키를 저장소에 커밋
- --force 플래그로 푸시

✅ 올바른 방법:
- git push origin main (일반 푸시)
- .env.production은 서버에만 생성
- SSH 공개 키만 서버에 등록
```

---

## 📞 지원 및 문제 해결

### 빠른 해결책
1. **`DEPLOYMENT_CHECKLIST.md`** → "문제 해결" 섹션
2. **`README_DEPLOYMENT.md`** → "자주 발생하는 문제" 섹션
3. **GitHub Actions 로그** → 상세 에러 메시지 확인
4. **PM2 로그** → `pm2 logs edu` 명령어

### 주요 문제 및 해결

| 문제 | 해결책 |
|------|--------|
| GitHub Actions 실패 | Secrets 설정 확인, 서버 방화벽 확인 |
| 서버 배포 실패 | .env.production 확인, PM2 로그 확인 |
| SSH 연결 오류 | SSH 키 등록 확인, 서버 IP/포트 확인 |
| 배포됐지만 앱 안 뜸 | PM2 상태 확인, 재시작 시도 |

---

## 🎓 학습 자료

### 개념 이해
- **CI/CD**: Continuous Integration/Deployment (지속적 통합/배포)
- **GitHub Actions**: GitHub에서 제공하는 CI/CD 자동화 플랫폼
- **PM2**: Node.js 프로세스 관리 도구
- **SSH**: Secure Shell (안전한 원격 접속)

### 관련 링크
- GitHub Actions 문서: https://docs.github.com/en/actions
- PM2 문서: https://pm2.io/docs
- Next.js 배포: https://nextjs.org/docs/deployment

---

## 📋 문서 이용 팁

### 효율적인 읽기 순서
1. **QUICK_START.md** (5분) - 개요 파악
2. **DEPLOYMENT_CHECKLIST.md** (20분) - Step별 설정
3. **필요시** 다른 문서 참고

### 복사-붙여넣기
- 모든 명령어는 복사-붙여넣기 가능합니다
- `your-server-ip` 같은 부분은 자신의 정보로 변경하세요
- 주석(#)이 있는 부분도 함께 복사하세요

### 문제 발생 시
1. 현재 진행 중인 Step 확인
2. 해당 Step의 "확인 사항" 다시 읽기
3. 문서의 "문제 해결" 섹션 확인
4. GitHub Actions/PM2 로그 확인

---

## 🎊 시작하기

### 이제 해야 할 일:

1. **`QUICK_START.md` 열기**
   ```bash
   cat QUICK_START.md
   # 또는
   # GitHub 웹에서 보기: https://github.com/ChoiGyber/edu/blob/main/QUICK_START.md
   ```

2. **Step 1부터 4까지 순서대로 진행**
   ```bash
   # Step 1: 서버 준비
   ssh root@your-server-ip
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/ChoiGyber/edu.git
   # ... (나머지 명령어는 QUICK_START.md 참고)
   ```

3. **각 단계 완료 후 체크 ✓**
   ```bash
   # Step 완료 확인
   pm2 status
   git push origin main
   ```

4. **배포 테스트**
   ```bash
   # GitHub Actions 확인
   # https://github.com/ChoiGyber/edu/actions
   ```

---

## 💾 GitHub 저장소

- **저장소**: https://github.com/ChoiGyber/edu
- **브랜치**: main
- **파일**: 198개
- **최신 커밋**: 배포 설정 완료

---

## ✨ 축하합니다!

자동 배포 설정이 모두 준비되었습니다!

이제 코드를 작성하고 `git push origin main`만 하면 자동으로 서버에 배포됩니다! 🚀

**지금 바로 QUICK_START.md를 읽고 시작하세요!** 📖
