# 배포 설정: Root vs Deploy 계정 - 최종 결정

## 당신의 선택: Root 계정 ✅

### 이유
1. **개인 프로젝트** - 혼자 운영하므로 책임 추적 불필요
2. **초기 단계** - 빠르게 배포 자동화 구축 필요
3. **비용 대비 효과** - 5분 vs 15분의 차이 (약 3배)
4. **나중에 변경 가능** - 필요하면 언제든 upgrade 가능

---

## 🚀 3가지 길

### 길 1️⃣: 빨리 시작하기 (추천)
```
ROOT_DEPLOYMENT.md 읽기 (2분)
   ↓
5단계 설정 (5분)
   ↓
배포 자동화 시작! 🎉
```

### 길 2️⃣: 상세하게 배우기
```
docs/SIMPLE_VS_SECURE.md (비교 분석)
   ↓
docs/ROOT_QUICK_START.md (상세 가이드)
   ↓
설정 진행
```

### 길 3️⃣: 나중에 업그레이드
```
현재: Root로 배포
   ↓
나중에: docs/DEPLOY_USER_SETUP.md 참조
   ↓
5분 안에 deploy 계정으로 변경
```

---

## 📁 당신을 위한 파일들

**지금 읽어야 할 파일:**
1. `ROOT_DEPLOYMENT.md` ← **여기서 시작**
2. `docs/ROOT_QUICK_START.md` (상세 가이드)

**참고 자료:**
- `docs/SIMPLE_VS_SECURE.md` (Root vs deploy 비교)
- `docs/SERVER_SETUP.md` (Nginx, SSL 등 고급 설정)

**이전 설정들 (더 이상 필요 없음):**
- `docs/DEPLOY_USER_SETUP.md` (deploy 계정용 - 나중에 필요)
- `DEPLOYMENT.md` (deploy 계정용 - 나중에 필요)
- `ACCOUNT_SETUP_SUMMARY.md` (deploy 계정용 - 나중에 필요)

---

## ✨ 변경사항

### 워크플로우 파일
- `.github/workflows/deploy.yml`
  - `username: root` (deploy → root)
  - `key: SSH_KEY` (DEPLOY_KEY → SSH_KEY)
  - `cd /var/www/edu` (/home/deploy → /root)

### 배포 스크립트
- `scripts/deploy.sh`
  - `PROJECT_DIR="/var/www/edu"` (/home/ubuntu → /root)

---

## 🎯 다음 단계

1. **지금:** `ROOT_DEPLOYMENT.md` 읽기
2. **5분:** 5단계 설정 완료
3. **1분:** GitHub Secrets 설정
4. **1분:** 첫 배포 테스트 (`git push origin main`)

**총 12분 안에 배포 자동화 완성!**

---

## 나중에 보안 업그레이드할 때

```bash
# docs/DEPLOY_USER_SETUP.md에서 찾아서 실행하면 됨
# 5분 안에 완료 가능
```

---

**준비 완료! ROOT_DEPLOYMENT.md에서 시작하세요.** 🚀
