# Cloudflare R2 스토리지 설정 가이드

## 1. Cloudflare R2란?

Cloudflare R2는 S3 호환 객체 스토리지로, 자막, 이미지, PDF 등의 파일을 저장하는 데 사용됩니다.

**특징:**
- ✅ S3 API 완전 호환
- ✅ 송신(Egress) 비용 무료
- ✅ 저렴한 저장 비용 ($0.015/GB/월)
- ✅ 빠른 글로벌 CDN

## 2. R2 Bucket 생성

### 2.1 R2 활성화

1. [Cloudflare 대시보드](https://dash.cloudflare.com/) 접속
2. 왼쪽 메뉴에서 **R2** 클릭
3. R2를 처음 사용하는 경우, **Purchase R2** 버튼 클릭
4. 결제 정보 입력 (무료 플랜 사용 가능)

### 2.2 Bucket 생성

1. **Create bucket** 버튼 클릭
2. Bucket 이름 입력: `education` (또는 원하는 이름)
3. Location: **Automatic** (권장)
4. **Create bucket** 클릭

## 3. API 인증 정보 생성

### 3.1 R2 API Token 생성

1. R2 대시보드에서 **Manage R2 API Tokens** 클릭
2. **Create API token** 버튼 클릭
3. Token 이름 입력: `education-app`
4. Permissions 설정:
   - **Object Read & Write** 선택
   - Bucket: `education` 선택 (또는 생성한 버킷명)
5. **Create API Token** 클릭

### 3.2 인증 정보 복사

생성된 화면에서 다음 정보를 복사하여 안전하게 보관:

```
Access Key ID: abc123def456ghi789jkl012mno345pq
Secret Access Key: xyz789uvw456rst123opq890nml567klm234hij901
```

⚠️ **주의**: Secret Access Key는 한 번만 표시되므로 반드시 복사하여 저장하세요!

## 4. 환경 변수 설정

`.env` 파일에 다음 값을 추가:

```bash
# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID="abc123def456ghi789jkl012mno345pq"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="xyz789uvw456rst123opq890nml567klm234hij901"
CLOUDFLARE_R2_BUCKET_NAME="education"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-yourbucketid.r2.dev"
```

### 4.1 Public URL 설정 (선택사항)

Public URL을 사용하려면:

1. R2 대시보드에서 버킷 클릭
2. **Settings** 탭 이동
3. **Public Access** 섹션에서 **Allow Access** 클릭
4. 생성된 Public URL 복사 (예: `https://pub-abc123.r2.dev`)
5. `.env` 파일의 `CLOUDFLARE_R2_PUBLIC_URL`에 설정

⚠️ **보안 주의**: Public URL을 활성화하면 누구나 URL을 알면 파일에 접근할 수 있습니다.

## 5. 테스트

### 5.1 자막 업로드 테스트

1. 로그인 후 대시보드 이동
2. **영상 라이브러리** → 영상 클릭
3. **자막 관리** 섹션에서:
   - 언어 선택 (예: English)
   - SRT 또는 VTT 파일 선택
   - **자막 업로드** 클릭
4. 업로드 성공 시 자막 목록에 표시됨
5. **다운로드** 링크 클릭하여 파일 확인

### 5.2 R2 대시보드에서 확인

1. [Cloudflare R2 대시보드](https://dash.cloudflare.com/?to=/:account/r2) 접속
2. `education` 버킷 클릭
3. `subtitles/` 폴더에 업로드된 파일 확인

## 6. 파일 구조

R2 버킷의 파일 구조:

```
education/
├── subtitles/
│   └── {video_id}/
│       ├── en.srt      (영어 자막)
│       ├── vi.srt      (베트남어 자막)
│       └── zh.vtt      (중국어 자막)
├── signatures/
│   └── {history_id}/
│       └── {timestamp}-{random}.png
├── selfies/
│   └── {history_id}/
│       └── {timestamp}-{random}.jpg
└── certificates/
    └── {history_id}.pdf
```

## 7. 비용 계산

### 7.1 저장 비용

```
$0.015 per GB/month

예시:
- 1,000개 자막 파일 (각 50KB) = 50MB
- 월 비용: $0.015 * 0.05 = $0.00075 (약 1원)
```

### 7.2 Class A 작업 (쓰기)

```
$4.50 per million requests

예시:
- 1,000번 업로드 = $0.0045 (약 6원)
```

### 7.3 Class B 작업 (읽기)

```
$0.36 per million requests

예시:
- 10,000번 다운로드 = $0.0036 (약 5원)
```

### 7.4 송신(Egress) 비용

✅ **무료!** (Cloudflare R2의 최대 장점)

## 8. 보안 모범 사례

### 8.1 환경 변수 보호

```bash
# .gitignore에 추가 (이미 설정됨)
.env
.env.local
.env.production
```

### 8.2 API Token 권한 최소화

- 필요한 버킷에만 접근 권한 부여
- Read & Write만 허용 (Admin 권한 불필요)
- 정기적으로 토큰 재발급 (3~6개월)

### 8.3 Signed URL 사용 (비공개 파일)

```typescript
import { getSignedUrlFromR2 } from "@/lib/storage/r2";

// 1시간 동안 유효한 URL 생성
const signedUrl = await getSignedUrlFromR2("signatures/abc123/sig.png", 3600);
```

## 9. 문제 해결

### 업로드 실패

**에러**: "파일 업로드에 실패했습니다"

**원인 및 해결**:
1. API 인증 정보 확인
   - `.env` 파일의 Access Key ID와 Secret Access Key 확인
   - 공백이나 특수문자 확인

2. 버킷 이름 확인
   - `CLOUDFLARE_R2_BUCKET_NAME`이 실제 버킷명과 일치하는지 확인

3. 권한 확인
   - API Token이 Object Read & Write 권한을 가지고 있는지 확인

4. 서버 재시작
   - 환경 변수 변경 후 서버 재시작 필요

### CORS 오류

브라우저에서 직접 R2에 업로드하는 경우 CORS 설정 필요:

1. R2 대시보드 → 버킷 클릭
2. **Settings** 탭 → **CORS Policy**
3. 다음 정책 추가:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 10. 참고 자료

- [Cloudflare R2 문서](https://developers.cloudflare.com/r2/)
- [R2 API 참조](https://developers.cloudflare.com/r2/api/)
- [R2 요금](https://developers.cloudflare.com/r2/pricing/)
- [AWS S3 SDK (Node.js)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

---

## 대안: 로컬 파일 시스템

개발 중 R2 없이 테스트하려면 로컬 파일 시스템 사용:

```typescript
// lib/storage/local.ts (개발용)
import fs from "fs/promises";
import path from "path";

export async function uploadToLocal(file: File, key: string) {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, key);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${key}`,
    key,
  };
}
```

⚠️ **주의**: 프로덕션에서는 반드시 R2 사용 (Vercel은 파일 시스템 쓰기 불가)
