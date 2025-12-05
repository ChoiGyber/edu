#!/bin/bash

# 배포 스크립트
# 사용: ./scripts/deploy.sh

set -e  # 에러 발생 시 중단

PROJECT_DIR="/var/www/edu"
LOG_FILE="$PROJECT_DIR/logs/deploy.log"
BRANCH="${1:-main}"

# 로그 파일 디렉토리 생성
mkdir -p "$PROJECT_DIR/logs"

echo "$(date '+%Y-%m-%d %H:%M:%S') - 🚀 배포 시작" | tee -a "$LOG_FILE"

# 1. 최신 코드 가져오기
echo "$(date '+%Y-%m-%d %H:%M:%S') - 📥 최신 코드 풀링..." | tee -a "$LOG_FILE"
cd "$PROJECT_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

if [ $? -ne 0 ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ❌ 코드 풀링 실패" | tee -a "$LOG_FILE"
  exit 1
fi

# 2. 의존성 설치
echo "$(date '+%Y-%m-%d %H:%M:%S') - 📦 의존성 설치..." | tee -a "$LOG_FILE"
npm ci

if [ $? -ne 0 ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ❌ 의존성 설치 실패" | tee -a "$LOG_FILE"
  exit 1
fi

# 3. 빌드
echo "$(date '+%Y-%m-%d %H:%M:%S') - 🔨 빌드 시작..." | tee -a "$LOG_FILE"
npm run build

if [ $? -ne 0 ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ❌ 빌드 실패" | tee -a "$LOG_FILE"
  exit 1
fi

# 4. PM2로 재시작 (또는 systemd 사용)
echo "$(date '+%Y-%m-%d %H:%M:%S') - 🔄 애플리케이션 재시작..." | tee -a "$LOG_FILE"

# PM2 방식 (권장)
if command -v pm2 &> /dev/null; then
  pm2 restart "edu" --update-env
  pm2 save
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ✅ PM2로 재시작 완료" | tee -a "$LOG_FILE"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ⚠️ PM2를 찾을 수 없음. systemd를 사용합니다." | tee -a "$LOG_FILE"
  sudo systemctl restart edu
fi

# 5. 헬스 체크
echo "$(date '+%Y-%m-%d %H:%M:%S') - 🏥 헬스 체크 시작..." | tee -a "$LOG_FILE"
sleep 5

for i in {1..30}; do
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ✅ 서버 정상 응답" | tee -a "$LOG_FILE"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ✅ 배포 완료" | tee -a "$LOG_FILE"
    exit 0
  fi

  if [ $((i % 5)) -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ⏳ 헬스 체크 진행 중... ($i/30)" | tee -a "$LOG_FILE"
  fi

  sleep 2
done

echo "$(date '+%Y-%m-%d %H:%M:%S') - ❌ 헬스 체크 실패 - 배포가 불완전할 수 있습니다" | tee -a "$LOG_FILE"
exit 1
