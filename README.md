# 안전교육 플랫폼 (Safety Education Platform)

건설 및 산업 현장을 위한 올인원 안전교육 플랫폼

## 주요 기능

- 📹 **영상 조합 교육**: 10분대 짧은 영상을 노드 조합 방식으로 커스텀 교육 과정 생성
- 📱 **QR 증빙 시스템**: QR 코드 + 모바일 증빙 (이름, 전자서명, 셀카) 자동 수집
- 🌍 **다국어 지원**: AI 자동 번역 및 외국인 전용 학습 경로
- 📄 **PDF 자동 생성**: 교육 이수 확인서 PDF 자동 생성 (법적 효력)
- 🏢 **다중 테넌트**: 회사별 독립 운영 지원

## 기술 스택

- **Frontend**: Next.js 15.0.0 (App Router), TypeScript 5.6.2, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16+ (Multi-Schema Tenant)
- **ORM**: Prisma 5.20+
- **Auth**: NextAuth.js 5.0 Beta
- **Video**: Vimeo, Cloudflare Stream
- **AI**: OpenAI Whisper + GPT-4
- **PDF**: @react-pdf/renderer
- **Node Editor**: React Flow

## 시작하기

### 필수 요구사항

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### 설치

1. 저장소 클론

```bash
git clone <repository-url>
cd plan
```

2. 패키지 설치

```bash
npm install
```

3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 필요한 값들을 입력하세요
```

4. 데이터베이스 설정

```bash
# Prisma 마이그레이션
npm run db:push

# Prisma Client 생성
npm run db:generate
```

5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

## 테스트

### E2E 테스트 (Playwright)

```bash
# Playwright 설치
npx playwright install

# E2E 테스트 실행
npm run test:e2e

# 모바일 테스트만 실행
npm run test:e2e:mobile

# UI 모드로 테스트
npx playwright test --ui
```

### 타입 체크

```bash
npm run type-check
```

### 빌드 테스트

```bash
npm run build
```

## 배포

프로덕션 배포에 대한 자세한 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### 빠른 배포 (Vercel)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

### 배포 전 체크리스트

- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] OAuth 앱 등록 및 콜백 URL 설정
- [ ] Cloudflare R2 버킷 생성 및 CORS 설정
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] E2E 테스트 통과
- [ ] 성능 테스트 (Lighthouse 90+ 목표)

## 프로젝트 구조

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드
│   └── mobile/            # 모바일 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 함수
├── prisma/               # Prisma 스키마
├── types/                # TypeScript 타입 정의
└── public/               # 정적 파일
```

## 개발 로드맵

현재 상태: **Phase 7 진행 중 - 테스트 및 배포** 🚀

### 완료된 단계

- [x] **Phase 1**: 기반 시스템 구축
  - Next.js 15 + TypeScript 프로젝트 설정
  - Prisma Schema (Multi-tenant)
  - NextAuth.js OAuth 인증
  - 대시보드 레이아웃

- [x] **Phase 2**: 영상 라이브러리
  - Vimeo/Cloudflare Provider 통합
  - 영상 등록 및 관리 UI
  - 메타데이터 자동 추출
  - 자막 업로드

- [x] **Phase 3**: 교육 조합 노드 에디터
  - React Flow 통합
  - 드래그 앤 드롭 노드 추가
  - 교육 과정 저장/불러오기
  - 공유 및 복사 기능

- [x] **Phase 4**: QR 기반 증빙 시스템
  - QR 토큰 생성 (JWT)
  - 모바일 학습 페이지
  - 셀카/서명 수집
  - 개인정보 동의 처리

- [x] **Phase 5**: PDF 생성 및 이력 관리
  - @react-pdf/renderer 템플릿
  - 교육 이력 조회 (필터링, 페이징)
  - 월별 통계 API
  - 대시보드 통계 UI

- [x] **Phase 6**: 관리자 기능
  - 회원 관리 (CRUD)
  - Excel 일괄 등록
  - 시스템 설정
  - 역할 기반 접근 제어

- [x] **Phase 7**: 테스트 및 배포 (진행 중)
  - [x] Playwright 설정 및 기본 테스트 구조
  - [x] 배포 문서 작성 (DEPLOYMENT.md)
  - [x] 환경 변수 템플릿 (.env.example)
  - [ ] E2E 테스트 구현 완료
  - [ ] 모바일 반응형 테스트
  - [ ] 성능 최적화 (Lighthouse 90+)
  - [ ] 프로덕션 배포

자세한 로드맵은 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

## 라이선스

MIT

## 문의

프로젝트 관련 문의사항은 이슈를 등록해주세요.

# Deployment test at Fri Dec  5 12:40:59 KST 2025
