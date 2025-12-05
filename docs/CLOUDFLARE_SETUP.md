# Cloudflare Stream 설정 가이드

## 1. Cloudflare 계정 생성

1. [Cloudflare 대시보드](https://dash.cloudflare.com/)에 접속
2. 계정이 없다면 **Sign Up** 클릭하여 계정 생성
3. 로그인 후 Stream 섹션으로 이동

## 2. Stream 활성화

1. 왼쪽 메뉴에서 **Stream** 클릭
2. Stream을 처음 사용하는 경우, 활성화 버튼 클릭
3. 요금제 확인:
   - **저장**: $5 / 1,000분
   - **재생**: $1 / 1,000분

## 3. API 토큰 발급

### 3.1 Account ID 확인

1. Cloudflare 대시보드 우측 하단에서 **Account ID** 복사
   - 예: `1234567890abcdef1234567890abcdef`

### 3.2 API Token 생성

1. 우측 상단 프로필 아이콘 클릭 → **My Profile**
2. 왼쪽 메뉴에서 **API Tokens** 클릭
3. **Create Token** 버튼 클릭
4. **Custom Token** → **Get started**

#### 권한 설정:
```
Permissions:
  Account - Stream:Read - Stream:Edit

Account Resources:
  Include - [Your Account Name]
```

5. **Continue to summary** 클릭
6. **Create Token** 클릭
7. 생성된 토큰 복사 (한 번만 표시되므로 안전하게 보관!)
   - 예: `abcdef1234567890_1234567890abcdef`

## 4. 환경 변수 설정

`.env` 파일에 다음 값 추가:

```bash
# Cloudflare Stream
CLOUDFLARE_ACCOUNT_ID="1234567890abcdef1234567890abcdef"
CLOUDFLARE_API_TOKEN="abcdef1234567890_1234567890abcdef"
```

## 5. 테스트

### 5.1 파일 업로드 테스트

1. 로그인 후 대시보드로 이동
2. **영상 라이브러리** 클릭
3. **+ 영상 등록** 클릭
4. **📤 파일 업로드 (Cloudflare)** 탭 선택
5. 테스트 영상 파일 (MP4, WebM 등) 드래그 또는 클릭하여 선택
6. **업로드 시작** 버튼 클릭
7. 업로드 진행률 확인
8. 업로드 완료 후 제목, 설명 등 입력
9. **등록하기** 버튼 클릭

### 5.2 Cloudflare 대시보드에서 확인

1. [Cloudflare Stream 대시보드](https://dash.cloudflare.com/?to=/:account/stream) 접속
2. 업로드한 영상이 목록에 표시되는지 확인
3. 영상 클릭 → 재생 테스트

## 6. 지원 포맷

### 입력 포맷 (업로드 가능)
- MP4 (H.264, H.265)
- WebM (VP8, VP9)
- MOV (QuickTime)
- AVI
- MKV (Matroska)
- FLV
- MPEG

### 출력 포맷 (자동 변환)
Cloudflare Stream은 업로드된 영상을 자동으로 최적화:
- **적응형 비트레이트 스트리밍 (ABR)**
- **여러 해상도 자동 생성** (240p ~ 1080p)
- **자동 썸네일 생성**

## 7. 제한 사항

- **최대 파일 크기**: 30GB (플랫폼 제한: 2GB)
- **최대 재생 시간**: 24시간
- **지원 해상도**: 최대 1080p (Full HD)

## 8. 비용 절감 팁

### 8.1 무료 티어 활용
- Cloudflare Stream은 무료 티어가 없지만, 첫 1,000분은 저렴함
- 테스트용으로는 Vimeo 무료 계정 사용 권장

### 8.2 비용 모니터링
```bash
# Cloudflare Stream API로 사용량 조회
curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/analytics" \
  -H "Authorization: Bearer {api_token}"
```

## 9. 문제 해결

### 업로드 실패 시

**에러**: "Cloudflare 인증 정보가 설정되지 않았습니다"
- `.env` 파일에 `CLOUDFLARE_ACCOUNT_ID`와 `CLOUDFLARE_API_TOKEN`이 올바르게 설정되었는지 확인
- 서버 재시작 후 다시 시도

**에러**: "파일 크기는 2GB를 초과할 수 없습니다"
- 영상 압축 도구 사용 (HandBrake, FFmpeg 등)
- 해상도 낮추기 (예: 4K → 1080p)

**에러**: "지원하지 않는 파일 형식입니다"
- MP4, WebM, MOV 등 지원 포맷으로 변환
- FFmpeg 사용 예시:
```bash
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4
```

### API 토큰 권한 부족

**에러**: "Cloudflare API 오류: 403"
- API 토큰 권한 확인
- 필요 권한: `Account - Stream:Read`, `Stream:Edit`

## 10. 참고 자료

- [Cloudflare Stream 문서](https://developers.cloudflare.com/stream/)
- [Cloudflare Stream API](https://developers.cloudflare.com/api/operations/stream-videos-list-videos)
- [Cloudflare Stream 요금](https://www.cloudflare.com/products/cloudflare-stream/)

---

## 대체 방안: Vimeo 사용

Cloudflare Stream이 부담스러운 경우, Vimeo를 무료로 사용할 수 있습니다:

1. [Vimeo](https://vimeo.com/) 계정 생성 (무료)
2. 영상 업로드 (주당 500MB 제한)
3. 공유 URL 복사
4. 플랫폼에서 **🔗 URL 입력** 탭 사용
5. Vimeo URL 붙여넣기 → **미리보기** 클릭

**Vimeo 무료 계정 제한**:
- 주당 500MB 업로드
- 총 5GB 스토리지
- 광고 없음
- HD 재생 가능
