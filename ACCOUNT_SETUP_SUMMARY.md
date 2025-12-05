# 📋 배포 계정 설정 요약

## 🎯 한 줄 결론

**전용 배포 계정(`deploy`)를 사용하세요. 간단하고 안전합니다.**

---

## 왜 배포 전용 계정을 만들어야 하나?

| 관점 | 효과 |
|------|------|
| 🔐 **보안** | GitHub Actions 키 유출 → 배포 기능만 영향 (다른 시스템 무영향) |
| 📊 **감시** | 모든 배포 활동 추적 가능 (누가, 언제, 뭘 배포했는지 기록) |
| 👥 **팀 협업** | GitHub = deploy 계정, 관리자 = 다른 계정 (역할 분명) |
| ⚙️ **운영** | Nginx, Redis, PostgreSQL 등과 격리 (한 계정의 문제가 다른 서비스에 영향 없음) |
| 📝 **책임** | 배포 오류 시 원인 추적 용이 |

---

## 3단계 빠른 설정

### Step 1: 서버에서 배포 계정 생성 (Root로, 2분)

```bash
sudo useradd -m -s /bin/bash deploy
sudo visudo -f /etc/sudoers.d/deploy
```

`/etc/sudoers.d/deploy` 에 추가:
```sudoers
deploy ALL=(ALL) NOPASSWD: /usr/bin/pm2 *
deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
```

### Step 2: SSH 키 생성 및 등록 (로컬, 2분)

```bash
# 로컬에서 키 생성
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# 서버에 등록
ssh-copy-id -i ~/.ssh/deploy_key.pub deploy@your-server
# 또는 수동:
# cat ~/.ssh/deploy_key.pub | ssh your-server "sudo tee -a /home/deploy/.ssh/authorized_keys"
```

### Step 3: GitHub Secrets 설정 (1분)

GitHub 리포지토리 Settings → Secrets and variables → Actions

**새로 추가:**
```
DEPLOY_KEY = deploy_key 파일 전체 내용
             (-----BEGIN ... END----- 포함)
```

**기존 변경:**
```
SERVER_SSH_KEY → 삭제 (DEPLOY_KEY로 변경됨)
SERVER_USER → 삭제 (워크플로우에 하드코딩됨)
```

---

## 생성된 파일들

| 파일 | 용도 |
|------|------|
| `.github/workflows/deploy.yml` | GitHub Actions (deploy 계정 사용) |
| `scripts/deploy.sh` | 배포 스크립트 |
| `docs/DEPLOY_USER_SETUP.md` | **상세 설정 가이드** |
| `docs/ACCOUNT_COMPARISON.md` | 계정별 비교 |
| `docs/SERVER_SETUP.md` | 전체 서버 설정 |

---

## 검증 체크리스트

```bash
# ✅ SSH 연결 테스트
ssh -i ~/.ssh/deploy_key deploy@your-server "whoami"
# 출력: deploy

# ✅ 권한 확인
ssh deploy@your-server "sudo pm2 status"
# PM2 프로세스 목록 출력

# ✅ GitHub Actions 실행
git push origin main
# GitHub Actions 탭에서 배포 과정 확인

# ✅ 헬스 체크
curl https://your-domain.com/api/health
# {"status":"ok",...}
```

---

## 자주 묻는 질문

**Q: 기존 ubuntu 계정은 어떻게 되나?**
A: 그대로 두셔도 괜찮습니다. GitHub Actions는 deploy 계정으로만 배포합니다.

**Q: deploy 계정에 비밀번호가 필요한가?**
A: 아닙니다. SSH 키 기반이라 비밀번호 불필요.

**Q: sudo 권한 설정이 복잡한가?**
A: PM2 관리만 허용하면 되므로 간단합니다. 복사-붙여넣기만 하면 됨.

**Q: 이전 설정으로 돌아갈 수 있나?**
A: 네. GitHub Secrets만 변경하면 원래대로 돌아갑니다.

---

## 다음 단계

1. **지금 바로:** `docs/DEPLOY_USER_SETUP.md` 읽고 Step 1-3 실행
2. **5분 후:** 서버 초기 설정 완료
3. **10분 후:** GitHub Secrets 설정 완료
4. **첫 배포:** `git push origin main`으로 자동 배포 테스트

---

## 참고 자료

- 상세 설정: `docs/DEPLOY_USER_SETUP.md`
- 계정 비교: `docs/ACCOUNT_COMPARISON.md`
- 전체 서버 설정: `docs/SERVER_SETUP.md`
- 배포 가이드: `DEPLOYMENT.md`

---

**🚀 준비 완료! 안전한 자동 배포를 시작하세요.**
