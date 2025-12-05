🏗️ 건설 안전교육 플랫폼 - 종합 개발 명세서
📌 목차

프로젝트 개요
기술 스택 및 아키텍처
데이터베이스 설계
핵심 기능 명세
영상 제공자 모듈 시스템
교육 조합 노드 에디터
다국어 및 자막 시스템
QR 기반 증빙 시스템
PDF 자동 생성
교육 이력 관리
보안 및 접근 제어
API 명세
개발 로드맵
배포 및 운영


1. 프로젝트 개요
1.1. 프로젝트명
안전교육 플랫폼 (Safety Education Platform)
1.2. 핵심 가치 제안

📹 10분대 짧은 영상을 노드 조합 방식으로 커스텀 교육 과정 생성
📱 QR 코드 + 모바일 증빙 (이름, 전자서명, 셀카) 자동 수집
🌍 다국어 자동 번역 및 외국인 전용 학습 경로
📄 교육 이수 확인서 PDF 자동 생성 (법적 효력)
🏢 다중 테넌트 지원 (회사별 독립 운영)

1.3. 타겟 사용자
사용자 유형역할주요 기능관리자 (ADMIN)회사 대표, 안전관리자영상 등록, 교육 과정 생성, 회원 관리, 증빙 확인보조 관리자 (SUB_ADMIN)현장 책임자교육 실시, QR 생성, 이력 조회 (편집 불가)일반 사용자 (USER)근로자교육 수강, 증빙 제출
1.4. 비즈니스 모델
┌─────────────────────────────────────────────┐
│ 구독 모델                                   │
├─────────────────────────────────────────────┤
│ • 개인 계정: 월 9,900원 (1인 사용)          │
│ • 회사 계정: 연 990,000원 (무제한 회원)     │
│                                             │
│ 추가 옵션:                                  │
│ • AI 자동 번역: 월 +50,000원                │
│ • 맞춤 영상 제작: 건당 협의                 │
│ • 엔터프라이즈: 맞춤 견적                   │
└─────────────────────────────────────────────┘

2. 기술 스택 및 아키텍처
2.1. 기술 스택
yaml# Frontend
Framework: Next.js 15.0.0 (App Router)
Language: TypeScript 5.6.2
UI: Tailwind CSS 3.4+
State: React Query + Zustand
Node Editor: React Flow 11.10+

# Backend
Runtime: Next.js API Routes (Edge Runtime)
Language: TypeScript
ORM: Prisma 5.20+
Database: PostgreSQL 16+

# Authentication
Auth: NextAuth.js 5.0 (Beta)
Providers: Google, Kakao, Naver OAuth

# Video
Vimeo: oEmbed API (링크 방식)
Cloudflare: Stream API (업로드 방식)
Player: Video.js 8.0 or Plyr.io 3.7

# Storage
Files: Cloudflare R2 (S3 Compatible)
Cache: Redis (Upstash)

# AI & Translation
STT: OpenAI Whisper API
Translation: OpenAI GPT-4 Turbo
Subtitles: SRT/VTT 파싱 (자체 구현)

# PDF Generation
Library: @react-pdf/renderer 3.4

# QR Code
Generation: qrcode.react 3.1
Scanning: jsQR (모바일)

# Deployment
Platform: Vercel (권장) or AWS EC2 + PM2
CDN: Cloudflare
Monitoring: Sentry + Vercel Analytics
```

### 2.2. 시스템 아키텍처
```
┌─────────────────────────────────────────────────────┐
│                    Users                            │
│  (PC 브라우저)         (모바일 브라우저)              │
└────────────┬────────────────────┬───────────────────┘
             │                    │
             │ HTTPS              │ HTTPS
             │                    │
┌────────────▼────────────────────▼───────────────────┐
│              Cloudflare (CDN + WAF)                 │
└────────────┬────────────────────┬───────────────────┘
             │                    │
┌────────────▼────────────────────▼───────────────────┐
│          Next.js 15 App (Vercel)                    │
│  ┌──────────────────────────────────────┐           │
│  │  Pages (SSR/SSG)                     │           │
│  │  - Dashboard, Video Library          │           │
│  │  - Education Node Editor             │           │
│  │  - History, Settings                 │           │
│  └──────────────────────────────────────┘           │
│  ┌──────────────────────────────────────┐           │
│  │  API Routes (Serverless)             │           │
│  │  - /api/auth/* (NextAuth.js)         │           │
│  │  - /api/videos/* (CRUD)              │           │
│  │  - /api/courses/* (Node Editor)      │           │
│  │  - /api/education/* (QR, 증빙)       │           │
│  │  - /api/pdf/* (PDF 생성)             │           │
│  └──────────────────────────────────────┘           │
└────────────┬────────────────────┬───────────────────┘
             │                    │
     ┌───────▼────────┐   ┌──────▼──────┐
     │   PostgreSQL   │   │    Redis    │
     │   (Supabase)   │   │  (Upstash)  │
     └────────────────┘   └─────────────┘
             │
     ┌───────▼────────────────────────────┐
     │     External Services              │
     │  • Vimeo (oEmbed API)              │
     │  • Cloudflare Stream               │
     │  • Cloudflare R2 (Storage)         │
     │  • OpenAI API (Whisper + GPT-4)    │
     │  • Email (Resend)                  │
     └────────────────────────────────────┘
2.3. 다중 테넌트 아키텍처 (PostgreSQL Schema 방식)
sql-- Public Schema: 테넌트 관리
CREATE SCHEMA public;

-- 회사 (테넌트) 테이블
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL, -- abc.edu.com
  schema_name VARCHAR(63) UNIQUE NOT NULL, -- tenant_abc123
  logo_url TEXT,
  ip_ranges TEXT[], -- ["192.168.1.0/24"]
  subscription_plan VARCHAR(50) DEFAULT 'INDIVIDUAL',
  subscription_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 테넌트별 독립 스키마 (동적 생성)
-- 예: tenant_abc123

CREATE SCHEMA tenant_abc123;

-- 사용자 테이블 (테넌트별)
CREATE TABLE tenant_abc123.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'USER', -- ADMIN, SUB_ADMIN, USER
  -- ... (상세 스키마는 3장 참조)
);
스키마 격리 장점:

✅ 완벽한 데이터 격리 (회사 간 데이터 유출 불가능)
✅ 테넌트별 백업/복원 가능
✅ 성능 최적화 (인덱스 독립 관리)
✅ 확장성 (샤딩 용이)

Prisma 설정:
prismagenerator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "tenant_abc123", "tenant_xyz789"]
}
```

---

## 3. 데이터베이스 설계

### 3.1. ERD (Entity Relationship Diagram)
```
┌─────────────────┐
│    companies    │ (Public Schema)
├─────────────────┤
│ id (PK)         │
│ name            │
│ schema_name     │◄──────┐
│ subscription    │        │
└─────────────────┘        │
                           │
        Tenant Schema      │
┌─────────────────┐        │
│      users      │        │
├─────────────────┤        │
│ id (PK)         │        │
│ email           │        │
│ role            │        │
└────────┬────────┘        │
         │                 │
         │ 1:N             │
         │                 │
┌────────▼────────┐        │
│ education_courses│       │
├─────────────────┤        │
│ id (PK)         │        │
│ owner_id (FK)   │        │
│ nodes (JSON)    │        │
│ edges (JSON)    │        │
└────────┬────────┘        │
         │                 │
         │ 1:N             │
         │                 │
┌────────▼────────────┐    │
│ education_histories │    │
├─────────────────────┤    │
│ id (PK)             │    │
│ course_id (FK)      │    │
│ attendees (JSON)    │    │
│ certificate_url     │    │
└─────────────────────┘    │
                           │
┌─────────────────┐        │
│     videos      │        │
├─────────────────┤        │
│ id (PK)         │        │
│ provider        │        │
│ provider_id     │        │
│ subtitles (JSON)│        │
└─────────────────┘        │
                           │
┌─────────────────┐        │
│    sessions     │        │
├─────────────────┤        │
│ id (PK)         │        │
│ user_id (FK)    │        │
│ ip_address      │◄───────┘ (IP 접근 제어)
└─────────────────┘
3.2. Prisma Schema (전체)
prisma// ===== Public Schema =====

model Company {
  id                    String   @id @default(uuid())
  name                  String
  domain                String   @unique
  schemaName            String   @unique @map("schema_name")
  logoUrl               String?  @map("logo_url")
  ipRanges              String[] @map("ip_ranges")
  subscriptionPlan      SubscriptionPlan @default(INDIVIDUAL) @map("subscription_plan")
  subscriptionExpiresAt DateTime? @map("subscription_expires_at")
  isActive              Boolean  @default(true) @map("is_active")
  createdAt             DateTime @default(now()) @map("created_at")
  
  @@map("companies")
  @@schema("public")
}

enum SubscriptionPlan {
  INDIVIDUAL  // 개인
  COMPANY     // 회사
  
  @@schema("public")
}

// ===== Tenant Schema (Example: tenant_abc123) =====

model User {
  id                  String   @id @default(uuid())
  email               String   @unique
  name                String
  phone               String?
  companyName         String?  @map("company_name")
  siteName            String?  @map("site_name")
  industry            Industry?
  
  // OAuth
  provider            String?  // "google", "kakao", "naver"
  providerId          String?  @map("provider_id")
  passwordHash        String?  @map("password_hash")
  
  // 역할 및 권한
  role                UserRole @default(USER)
  isActive            Boolean  @default(true) @map("is_active")
  
  // 설정
  preferredLanguages  String[] @default(["ko"]) @map("preferred_languages")
  notificationEmail   String?  @map("notification_email")
  emailNotification   Boolean  @default(false) @map("email_notification")
  
  // Relations
  sessions            Session[]
  ownedCourses        EducationCourse[]
  executedHistories   EducationHistory[] @relation("ExecutedBy")
  
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  @@map("users")
  @@schema("tenant_abc123")
}

enum UserRole {
  ADMIN       // 최고 관리자 (모든 권한)
  SUB_ADMIN   // 보조 관리자 (교육 실시, 조회만)
  USER        // 일반 사용자 (교육 수강)
  WITHDRAWN   // 탈퇴
  
  @@schema("tenant_abc123")
}

enum Industry {
  CONSTRUCTION   // 건설업
  MANUFACTURING  // 제조업
  LOGISTICS      // 물류/운송
  FOOD           // 식음료
  CHEMICAL       // 화학
  ELECTRICITY    // 전기/전자
  SERVICE        // 서비스업
  ETC            // 기타
  
  @@schema("tenant_abc123")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  ipAddress String   @unique @map("ip_address")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("sessions")
  @@schema("tenant_abc123")
}

// ===== 영상 관리 =====

model Video {
  id              String   @id @default(uuid())
  title           String
  description     String?
  duration        Int      // 초 단위
  thumbnailUrl    String   @map("thumbnail_url")
  
  // 영상 제공자
  provider        VideoProvider
  providerId      String   @map("provider_id")
  videoUrl        String   @map("video_url")
  embedHtml       String?  @map("embed_html")
  
  // 분류
  category        String[] @default([])
  industry        Industry[]
  
  // 다국어 자막
  hasKoreanAudio  Boolean  @default(true) @map("has_korean_audio")
  subtitles       Json?    // SubtitleTrack[]
  aiTranslation   Boolean  @default(false) @map("ai_translation")
  
  // 소유 및 공개
  uploadedBy      String   @map("uploaded_by")
  isPublic        Boolean  @default(true) @map("is_public")
  
  // 통계
  viewCount       Int      @default(0) @map("view_count")
  usedInCourses   Int      @default(0) @map("used_in_courses")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@index([provider, providerId])
  @@index([industry])
  @@map("videos")
  @@schema("tenant_abc123")
}

enum VideoProvider {
  VIMEO
  CLOUDFLARE
  
  @@schema("tenant_abc123")
}

// ===== 교육 과정 =====

model EducationCourse {
  id            String   @id @default(uuid())
  title         String
  description   String?
  thumbnail     String?
  
  // 노드 구조
  nodes         Json     // EducationNode[]
  edges         Json     // EducationEdge[]
  
  totalDuration Int      @default(0) @map("total_duration")
  
  // 소유 및 공유
  ownerId       String   @map("owner_id")
  owner         User     @relation(fields: [ownerId], references: [id])
  
  isPublic      Boolean  @default(false) @map("is_public")
  sharedWith    String[] @default([]) @map("shared_with")
  
  // 통계
  viewCount     Int      @default(0) @map("view_count")
  usedCount     Int      @default(0) @map("used_count")
  
  // Relations
  histories     EducationHistory[]
  
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  @@index([ownerId])
  @@map("education_courses")
  @@schema("tenant_abc123")
}

// ===== 교육 이력 =====

model EducationHistory {
  id                  String   @id @default(uuid())
  
  // 교육 과정 참조
  courseId            String   @map("course_id")
  course              EducationCourse @relation(fields: [courseId], references: [id])
  courseTitleSnapshot String   @map("course_title_snapshot")
  
  // 실행 정보
  startedAt           DateTime @map("started_at")
  completedAt         DateTime? @map("completed_at")
  totalAttendees      Int      @map("total_attendees")
  
  // 참석자 데이터 (JSON)
  attendees           Json     // Attendee[]
  byNationality       Json?    @map("by_nationality") // { "KO": 12, "VN": 3 }
  
  // PDF 증빙
  certificateUrl      String?  @map("certificate_url")
  screenshots         String[] @default([]) // 교육 화면 캡처
  
  // QR 설정
  qrTokenExpiry       Int      @default(30) @map("qr_token_expiry") // 분 단위
  
  // 실행자
  executedBy          String   @map("executed_by")
  executor            User     @relation("ExecutedBy", fields: [executedBy], references: [id])
  
  createdAt           DateTime @default(now()) @map("created_at")
  
  @@index([courseId])
  @@index([executedBy, completedAt])
  @@map("education_histories")
  @@schema("tenant_abc123")
}

// ===== 설정 =====

model SystemSetting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("system_settings")
  @@schema("tenant_abc123")
}
3.3. JSON 필드 상세 스키마
SubtitleTrack (자막)
typescriptinterface SubtitleTrack {
  language: string;    // "en", "vi", "zh", "th"
  label: string;       // "English", "Tiếng Việt"
  url: string;         // Cloudflare R2 URL
  format: "srt" | "vtt";
  source: "MANUAL" | "AI"; // 수동 업로드 or AI 생성
  createdAt: string;   // ISO 8601
}
EducationNode (교육 노드)
typescriptinterface EducationNode {
  id: string;
  type: "START" | "VIDEO" | "IMAGE" | "PDF" | "END";
  position: { x: number; y: number };
  data: {
    videoId?: string;       // VIDEO 타입
    imageUrl?: string;      // IMAGE 타입
    pdfUrl?: string;        // PDF 타입
    duration?: number;      // 재생 시간 (초)
    title?: string;
    description?: string;
  };
}
EducationEdge (노드 연결)
typescriptinterface EducationEdge {
  id: string;
  source: string;  // 출발 노드 ID
  target: string;  // 도착 노드 ID
  type?: "default" | "smooth";
}
Attendee (참석자)
typescriptinterface Attendee {
  id: string;
  name: string;
  nationality: string;     // "KO", "EN", "VN", "TH"
  language: string;        // 선택한 언어
  signatureUrl: string;    // 전자 서명 이미지 (R2 URL)
  selfieUrl: string;       // 셀카 이미지 (R2 URL)
  gpsLatitude?: number;    // GPS 위도
  gpsLongitude?: number;   // GPS 경도
  completedAt: string;     // ISO 8601
  deviceType: "PC" | "MOBILE";
  consentGiven: boolean;   // 개인정보 동의
  consentAt: string;       // 동의 시간
}

4. 핵심 기능 명세
4.1. 회원가입 및 인증
4.1.1. 소셜 로그인 (OAuth)
지원 제공자:

Google OAuth 2.0
Kakao Login API
Naver Login API

NextAuth.js 설정:
typescript// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 회원가입 추가 정보 입력 페이지로 리다이렉트
      return true;
    },
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
4.1.2. 회원가입 폼
필수 입력 항목:
typescriptinterface SignUpForm {
  // OAuth에서 자동 수집
  email: string;           // example@company.com
  provider: string;        // "google", "kakao", "naver"
  providerId: string;
  
  // 사용자 입력
  name: string;            // 실명
  phone: string;           // 010-1234-5678
  companyName: string;     // 회사명
  siteName?: string;       // 현장명 (선택)
  industry: Industry;      // 업종 드롭다운
  
  // 계정 유형
  accountType: "INDIVIDUAL" | "COMPANY";
}
업종 분류 (추천 영상용):
typescriptconst INDUSTRIES = [
  { value: "CONSTRUCTION", label: "건설업", icon: "🏗️" },
  { value: "MANUFACTURING", label: "제조업", icon: "🏭" },
  { value: "LOGISTICS", label: "물류/운송", icon: "🚚" },
  { value: "FOOD", label: "식음료", icon: "🍔" },
  { value: "CHEMICAL", label: "화학", icon: "⚗️" },
  { value: "ELECTRICITY", label: "전기/전자", icon: "⚡" },
  { value: "SERVICE", label: "서비스업", icon: "💼" },
  { value: "ETC", label: "기타", icon: "📋" },
];

#### 회원가입 폼 검증 규칙

**이메일 (아이디)**
- **중복 확인 필수**: 회원가입 전 반드시 이메일 중복 확인 버튼 클릭
- 중복 확인 API 호출: `GET /api/auth/check-email?email={email}`
- 이메일 형식 검증: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 중복 확인 완료 후 이메일 입력 필드 비활성화
- 중복 확인 버튼 상태: "중복 확인" → "확인 완료"

typescript// 이메일 중복 확인 로직
const checkEmailDuplicate = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formData.email)) {
    setErrors({ ...errors, email: "올바른 이메일 형식이 아닙니다" });
    return;
  }

  const response = await fetch(
    `/api/auth/check-email?email=${encodeURIComponent(formData.email)}`
  );

  const data = await response.json();

  if (data.available) {
    setEmailAvailable(true);
    setEmailChecked(true);
    alert("사용 가능한 이메일입니다.");
  } else {
    setErrors({ ...errors, email: "이미 사용 중인 이메일입니다" });
  }
};


**휴대전화번호**
- **형식**: 3자리 - 4자리 - 4자리 (예: 010-1234-5678)
- **3개 입력 필드로 분리**: phone1 (3자리), phone2 (4자리), phone3 (4자리)
- **자동 포커스 이동**:
  - phone1에 3자리 입력 완료 → phone2로 자동 이동
  - phone2에 4자리 입력 완료 → phone3로 자동 이동
  - phone3은 마지막 필드이므로 자동 이동 없음
- **입력 제한**: 숫자만 입력 가능 (`replace(/[^0-9]/g, "")`)

typescript// 휴대전화번호 자동 포커스 구현
const phone2Ref = useRef<HTMLInputElement>(null);
const phone3Ref = useRef<HTMLInputElement>(null);

const handlePhoneChange = (
  field: "phone1" | "phone2" | "phone3",
  value: string
) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  setFormData({ ...formData, [field]: numericValue });

  // 자동 포커스 이동
  if (field === "phone1" && numericValue.length === 3) {
    phone2Ref.current?.focus();
  } else if (field === "phone2" && numericValue.length === 4) {
    phone3Ref.current?.focus();
  }
};

// JSX 구조
<div className="flex gap-2">
  <input
    type="text"
    maxLength={3}
    value={formData.phone1}
    onChange={(e) => handlePhoneChange("phone1", e.target.value)}
    placeholder="010"
  />
  <span>-</span>
  <input
    ref={phone2Ref}
    type="text"
    maxLength={4}
    value={formData.phone2}
    onChange={(e) => handlePhoneChange("phone2", e.target.value)}
    placeholder="1234"
  />
  <span>-</span>
  <input
    ref={phone3Ref}
    type="text"
    maxLength={4}
    value={formData.phone3}
    onChange={(e) => handlePhoneChange("phone3", e.target.value)}
    placeholder="5678"
  />
</div>


**비밀번호**
- **최소 길이**: 6자 이상
- **특수문자 필수 포함**: `!@#$%^&*(),.?":{}|<>` 중 1개 이상
- **실시간 검증**: 입력 중 조건 충족 여부 시각적 피드백 제공
- **비밀번호 확인**: 재입력 필드와 일치 여부 확인

typescript// 비밀번호 실시간 검증
const [passwordValid, setPasswordValid] = useState(false);
const [passwordMatch, setPasswordMatch] = useState(false);

useEffect(() => {
  const hasMinLength = formData.password.length >= 6;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  setPasswordValid(hasMinLength && hasSpecialChar);
}, [formData.password]);

useEffect(() => {
  if (formData.passwordConfirm) {
    setPasswordMatch(formData.password === formData.passwordConfirm);
  }
}, [formData.password, formData.passwordConfirm]);

// 시각적 피드백
<div className="text-sm mt-1">
  <p className={passwordValid ? "text-green-600" : "text-gray-500"}>
    {passwordValid ? "✓" : "○"} 6자 이상, 특수문자 포함
  </p>
  <p className={passwordMatch ? "text-green-600" : "text-gray-500"}>
    {passwordMatch ? "✓" : "○"} 비밀번호 확인 일치
  </p>
</div>


**회원가입 API 검증**

typescript// POST /api/auth/signup

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    email,
    password,
    name,
    phone, // "010-1234-5678" 형식
    companyName,
    siteName,
    industry,
    accountType,
  } = body;

  // 1. 필수 필드 검증
  if (!email || !password || !name || !phone || !companyName || !industry || !accountType) {
    return NextResponse.json(
      { error: "필수 항목을 모두 입력하세요" },
      { status: 400 }
    );
  }

  // 2. 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "올바른 이메일 형식이 아닙니다" },
      { status: 400 }
    );
  }

  // 3. 비밀번호 검증 (6자 이상, 특수문자 포함)
  if (password.length < 6) {
    return NextResponse.json(
      { error: "비밀번호는 6자 이상이어야 합니다" },
      { status: 400 }
    );
  }

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecialChar) {
    return NextResponse.json(
      { error: "비밀번호는 특수문자를 포함해야 합니다" },
      { status: 400 }
    );
  }

  // 4. 휴대전화번호 형식 검증 (010-1234-5678)
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return NextResponse.json(
      { error: "휴대전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)" },
      { status: 400 }
    );
  }

  // 5. 이메일 중복 확인
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "이미 사용 중인 이메일입니다" },
      { status: 409 }
    );
  }

  // 6. 비밀번호 해싱
  const passwordHash = await bcrypt.hash(password, 12);

  // 7. 사용자 생성
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone,
      companyName,
      siteName,
      industry,
      role: 'ADMIN', // 첫 가입자는 관리자
      provider: 'credentials',
      isActive: true,
    },
  });

  // 8. 무료 체험 기간 부여 (14일)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  await prisma.subscription.create({
    data: {
      userId: user.id,
      planType: accountType,
      status: 'TRIAL',
      startedAt: new Date(),
      trialEndsAt: trialEndDate,
    },
  });

  await prisma.freeTrial.create({
    data: {
      userId: user.id,
      planType: accountType,
      startDate: new Date(),
      endDate: trialEndDate,
      status: 'ACTIVE',
    },
  });

  return NextResponse.json({
    success: true,
    message: "회원가입이 완료되었습니다",
  });
}


**이메일 중복 확인 API**

typescript// GET /api/auth/check-email?email={email}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "이메일을 입력하세요" },
      { status: 400 }
    );
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "올바른 이메일 형식이 아닙니다" },
      { status: 400 }
    );
  }

  // 중복 확인
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  return NextResponse.json({
    available: !existingUser,
    email,
  });
}


**에러 메시지 표준**
- 이메일 형식 오류: "올바른 이메일 형식이 아닙니다"
- 이메일 중복: "이미 사용 중인 이메일입니다"
- 비밀번호 길이: "비밀번호는 6자 이상이어야 합니다"
- 비밀번호 특수문자: "비밀번호는 특수문자를 포함해야 합니다"
- 비밀번호 불일치: "비밀번호가 일치하지 않습니다"
- 휴대전화 형식: "휴대전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)"
- 필수 항목 누락: "필수 항목을 모두 입력하세요"

4.1.3. IP 기반 동시 접속 제어
목적: 계정 공유 방지 (1 계정 = 1 IP 동시 접속)
로그인 프로세스:
typescript// app/api/auth/login/route.ts

export async function POST(request: Request) {
  const { email, provider } = await request.json();
  const clientIp = request.headers.get('x-forwarded-for') || request.ip;
  
  // 1. 사용자 인증
  const user = await prisma.user.findUnique({ where: { email } });
  
  // 2. 기존 세션 확인
  const existingSession = await prisma.session.findFirst({
    where: { userId: user.id, ipAddress: { not: clientIp } }
  });
  
  if (existingSession) {
    // 3. 다른 IP에서 로그인 중 → 기존 세션 종료
    await prisma.session.delete({ where: { id: existingSession.id } });
  }
  
  // 4. 새 세션 생성
  const token = generateJWT({ userId: user.id, tenantId: user.tenantId });
  
  await prisma.session.create({
    data: {
      userId: user.id,
      ipAddress: clientIp,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간
    },
  });
  
  return NextResponse.json({ token });
}
```

---

## 5. 영상 제공자 모듈 시스템

### 5.1. 영상 제공자 선택 구조
```
┌───────────────────────────────────────┐
│     Video Provider Module             │
├───────────────────────────────────────┤
│                                       │
│  ┌─────────────┐   ┌──────────────┐  │
│  │   Vimeo     │   │  Cloudflare  │  │
│  │  Provider   │   │   Provider   │  │
│  └─────────────┘   └──────────────┘  │
│         ▲                 ▲           │
│         │                 │           │
│         └─────────┬───────┘           │
│                   │                   │
│         ┌─────────▼─────────┐         │
│         │  Provider Factory │         │
│         └───────────────────┘         │
│                   ▲                   │
│                   │                   │
│         ┌─────────▼─────────┐         │
│         │  Video Interface  │         │
│         └───────────────────┘         │
└───────────────────────────────────────┘
5.2. Vimeo Provider (링크 방식)
5.2.1. Vimeo 영상 등록 프로세스
mermaidsequenceDiagram
    participant A as 관리자
    participant V as Vimeo.com
    participant P as 플랫폼
    participant DB as Database
    
    A->>V: 1. 영상 업로드
    V-->>A: 2. 공유 URL 생성
    A->>P: 3. Vimeo URL 입력
    P->>V: 4. oEmbed API 호출
    V-->>P: 5. 메타데이터 반환
    P-->>A: 6. 자동 입력 (제목, 썸네일)
    A->>P: 7. 추가 정보 입력 + 등록
    P->>DB: 8. 영상 정보 저장
5.2.2. Vimeo oEmbed API 연동
typescript// app/lib/video-providers/vimeo-provider.ts

export class VimeoProvider implements VideoProvider {
  type = VideoProviderType.VIMEO;
  
  async extractMetadata(url: string): Promise<VideoMetadata> {
    // 1. URL 검증
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error('유효하지 않은 Vimeo URL입니다');
    }
    
    const videoId = match[1];
    
    // 2. oEmbed API 호출 (무료, 인증 불필요)
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error('Vimeo 메타데이터를 가져올 수 없습니다');
    }
    
    const data = await response.json();
    
    // 3. 메타데이터 매핑
    return {
      providerId: videoId,
      title: data.title,
      duration: data.duration,
      thumbnailUrl: data.thumbnail_url,
      author: data.author_name,
      embedHtml: data.html,
      width: data.width,
      height: data.height,
    };
  }
  
  getPlayerUrl(providerId: string, options?: PlayerOptions): string {
    const params = new URLSearchParams();
    
    if (options?.autoplay) params.set('autoplay', '1');
    if (options?.loop) params.set('loop', '1');
    if (options?.muted) params.set('muted', '1');
    if (options?.language) params.set('texttrack', options.language);
    
    return `https://player.vimeo.com/video/${providerId}?${params.toString()}`;
  }
  
  getEmbedHtml(providerId: string, options?: EmbedOptions): string {
    const playerUrl = this.getPlayerUrl(providerId, options);
    
    return `
      <iframe 
        src="${playerUrl}"
        width="${options?.width || '100%'}"
        height="${options?.height || '100%'}"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
      ></iframe>
    `;
  }
}
Vimeo API 사용 제한:

✅ oEmbed API: 무료, 인증 불필요, 무제한
❌ 직접 업로드: Pro 이상 계정 필요 ($20/월)
✅ Player API: 무료, 재생 제어 가능

5.3. Cloudflare Stream Provider
5.3.1. Cloudflare Stream 업로드 방식
방법 1: 파일 직접 업로드
typescriptasync uploadVideo(file: File): Promise<VideoMetadata> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: formData,
    }
  );
  
  const data = await response.json();
  
  return {
    providerId: data.result.uid,
    title: file.name,
    duration: data.result.duration,
    thumbnailUrl: data.result.thumbnail,
  };
}
방법 2: URL 입력
typescriptasync extractMetadata(url: string): Promise<VideoMetadata> {
  // Cloudflare Stream URL 파싱
  const regex = /cloudflarestream\.com\/([a-f0-9]+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('유효하지 않은 Cloudflare Stream URL입니다');
  }
  
  const uid = match[1];
  
  // Cloudflare API로 메타데이터 조회
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${uid}`,
    {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` },
    }
  );
  
  const data = await response.json();
  
  return {
    providerId: uid,
    title: data.result.meta?.name || 'Untitled',
    duration: data.result.duration,
    thumbnailUrl: data.result.thumbnail,
  };
}
Cloudflare Stream 가격:

저장: $5/1,000분
재생: $1/1,000분

5.4. Provider Factory
typescript// app/lib/video-providers/provider-factory.ts

import { VimeoProvider } from './vimeo-provider';
import { CloudflareProvider } from './cloudflare-provider';

export function createVideoProvider(type: VideoProviderType): VideoProvider {
  switch (type) {
    case VideoProviderType.VIMEO:
      return new VimeoProvider();
    case VideoProviderType.CLOUDFLARE:
      return new CloudflareProvider();
    default:
      throw new Error(`지원하지 않는 제공자: ${type}`);
  }
}
5.5. 영상 등록 API
typescript// app/api/videos/route.ts

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const {
    provider,      // "VIMEO" or "CLOUDFLARE"
    videoUrl,      // Vimeo/Cloudflare URL
    file,          // Cloudflare 파일 업로드 시
    title,
    description,
    industry,
    category,
    subtitles,
    aiTranslation,
    isPublic,
  } = await request.json();
  
  // 1. Provider 선택
  const videoProvider = createVideoProvider(provider);
  
  // 2. 메타데이터 추출
  let metadata: VideoMetadata;
  
  if (file && provider === 'CLOUDFLARE') {
    metadata = await videoProvider.uploadVideo(file);
  } else {
    metadata = await videoProvider.extractMetadata(videoUrl);
  }
  
  // 3. DB 저장
  const video = await prisma.video.create({
    data: {
      title: title || metadata.title,
      description,
      duration: metadata.duration,
      thumbnailUrl: metadata.thumbnailUrl,
      provider,
      providerId: metadata.providerId,
      videoUrl: videoUrl || '',
      embedHtml: metadata.embedHtml,
      industry,
      category,
      subtitles,
      aiTranslation,
      uploadedBy: session.user.id,
      isPublic,
    },
  });
  
  return NextResponse.json(video);
}

6. 교육 조합 노드 에디터
6.1. React Flow 기반 노드 에디터
6.1.1. 노드 타입 정의
typescript// app/types/education-node.ts

export enum NodeType {
  START = "START",     // 시작점
  VIDEO = "VIDEO",     // 영상
  IMAGE = "IMAGE",     // 이미지 (표지, 중간)
  PDF = "PDF",         // PDF 문서
  END = "END"          // 종료점
}

export interface EducationNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    videoId?: string;       // VIDEO 타입
    videoTitle?: string;
    videoDuration?: number;
    videoThumbnail?: string;
    
    imageUrl?: string;      // IMAGE 타입
    imageTitle?: string;
    
    pdfUrl?: string;        // PDF 타입
    pdfTitle?: string;
    
    title?: string;
    description?: string;
  };
}

export interface EducationEdge {
  id: string;
  source: string;
  target: string;
  type?: "default" | "smooth" | "step";
  animated?: boolean;
}
```

#### 6.1.2. 노드 에디터 UI 구조
```
┌─────────────────────────────────────────────────────────┐
│ 내 교육 만들기                                           │
│ 교육명: [___________________________] [저장] [미리보기]  │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│ 🔍 검색      │         [시작]                           │
│ [________]   │           │                              │
│              │           ▼                              │
│ 영상 리스트  │     ┌──────────┐                         │
│ ┌──────────┐│     │ 표지이미지 │                         │
│ │포크리프트 ││     └─────┬────┘                         │
│ │10:20     ││           │                              │
│ │[+추가]   ││           ▼                              │
│ └──────────┘│     ┌──────────┐                         │
│ ┌──────────┐│     │ 영상 1   │                         │
│ │전기안전  ││     │ 10:20    │                         │
│ │08:45     ││     └─────┬────┘                         │
│ │[+추가]   ││           │                              │
│ └──────────┘│           ▼                              │
│              │     ┌──────────┐                         │
│ [내 영상]    │     │중간 PDF  │                         │
│ [업로드]     │     └─────┬────┘                         │
│              │           │                              │
│ [이미지]     │           ▼                              │
│ [업로드]     │     ┌──────────┐                         │
│              │     │ 영상 2   │                         │
│ [PDF]        │     │ 15:10    │                         │
│ [업로드]     │     └─────┬────┘                         │
│              │           │                              │
│              │           ▼                              │
│              │        [종료]                            │
│              │                                          │
│              │ 총 시간: 25분 30초                       │
└──────────────┴──────────────────────────────────────────┘
6.1.3. React Flow 구현
typescript// components/EducationNodeEditor.tsx

'use client';

import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function EducationNodeEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'start',
      type: 'START',
      position: { x: 250, y: 0 },
      data: { label: '시작' },
    },
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };
  
  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    const videoData = JSON.parse(event.dataTransfer.getData('video'));
    const position = {
      x: event.clientX,
      y: event.clientY,
    };
    
    const newNode: Node = {
      id: `video-${Date.now()}`,
      type: 'VIDEO',
      position,
      data: {
        videoId: videoData.id,
        videoTitle: videoData.title,
        videoDuration: videoData.duration,
        videoThumbnail: videoData.thumbnailUrl,
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  };
  
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
6.2. 교육 과정 저장
typescript// app/api/courses/route.ts

export async function POST(request: Request) {
  const session = await getServerSession();
  const { title, description, nodes, edges } = await request.json();
  
  // 1. 총 시간 계산
  const totalDuration = nodes
    .filter((node: EducationNode) => node.type === 'VIDEO')
    .reduce((sum: number, node: EducationNode) => {
      return sum + (node.data.videoDuration || 0);
    }, 0);
  
  // 2. 대표 썸네일 (첫 영상)
  const firstVideoNode = nodes.find((n: EducationNode) => n.type === 'VIDEO');
  const thumbnail = firstVideoNode?.data.videoThumbnail;
  
  // 3. DB 저장
  const course = await prisma.educationCourse.create({
    data: {
      title,
      description,
      thumbnail,
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      totalDuration,
      ownerId: session.user.id,
    },
  });
  
  return NextResponse.json(course);
}
6.3. 교육 과정 공유
typescript// app/api/courses/[id]/share/route.ts

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userIds } = await request.json(); // 공유 대상 사용자 ID 배열
  
  await prisma.educationCourse.update({
    where: { id: params.id },
    data: {
      sharedWith: {
        push: userIds,
      },
    },
  });
  
  return NextResponse.json({ success: true });
}

7. 다국어 및 자막 시스템
7.1. 자막 파일 관리
7.1.1. 자막 업로드 (SRT/VTT)
typescript// app/api/videos/[id]/subtitles/route.ts

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const language = formData.get('language') as string;
  const label = formData.get('label') as string; // "English", "Tiếng Việt"
  
  // 1. Cloudflare R2에 업로드
  const fileName = `${params.id}/${language}.${file.name.endsWith('.vtt') ? 'vtt' : 'srt'}`;
  const uploadResponse = await uploadToR2(file, fileName);
  
  // 2. DB 업데이트
  const video = await prisma.video.findUnique({
    where: { id: params.id },
  });
  
  const subtitles = video.subtitles as SubtitleTrack[] || [];
  
  subtitles.push({
    language,
    label,
    url: uploadResponse.url,
    format: file.name.endsWith('.vtt') ? 'vtt' : 'srt',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
  });
  
  await prisma.video.update({
    where: { id: params.id },
    data: { subtitles },
  });
  
  return NextResponse.json({ success: true });
}
7.2. AI 자동 번역 (OpenAI Whisper + GPT-4)
7.2.1. 음성 → 텍스트 (Whisper)
typescript// app/lib/ai/whisper-transcribe.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeVideo(videoUrl: string): Promise<string> {
  // 1. 영상에서 오디오 추출 (FFmpeg)
  const audioBuffer = await extractAudio(videoUrl);
  
  // 2. Whisper API 호출
  const transcription = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: 'whisper-1',
    language: 'ko', // 한국어 음성
    response_format: 'srt', // SRT 형식으로 반환
  });
  
  return transcription.text;
}
7.2.2. 번역 (GPT-4)
typescript// app/lib/ai/translate-subtitles.ts

export async function translateSubtitles(
  srtContent: string,
  targetLanguage: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following SRT subtitle file from Korean to ${targetLanguage}. Preserve the SRT format and timing codes exactly.`,
      },
      {
        role: 'user',
        content: srtContent,
      },
    ],
    temperature: 0.3,
  });
  
  return completion.choices[0].message.content;
}
7.2.3. 전체 프로세스
typescript// app/api/videos/[id]/ai-translate/route.ts

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { targetLanguages } = await request.json(); // ["en", "vi", "zh"]
  
  const video = await prisma.video.findUnique({
    where: { id: params.id },
  });
  
  // 1. Whisper로 한국어 자막 생성
  const koreanSRT = await transcribeVideo(video.videoUrl);
  
  // 2. 각 언어로 번역
  for (const lang of targetLanguages) {
    const translatedSRT = await translateSubtitles(koreanSRT, lang);
    
    // 3. R2에 업로드
    const fileName = `${params.id}/${lang}.srt`;
    const uploadResponse = await uploadToR2(
      new Blob([translatedSRT]),
      fileName
    );
    
    // 4. DB 업데이트
    const subtitles = video.subtitles as SubtitleTrack[] || [];
    subtitles.push({
      language: lang,
      label: LANGUAGE_LABELS[lang],
      url: uploadResponse.url,
      format: 'srt',
      source: 'AI',
      createdAt: new Date().toISOString(),
    });
    
    await prisma.video.update({
      where: { id: params.id },
      data: { subtitles },
    });
  }
  
  return NextResponse.json({ success: true });
}
7.3. 영상 재생 시 자막 표시
typescript// components/VideoPlayer.tsx

export default function VideoPlayer({ video, language }: VideoPlayerProps) {
  const subtitle = (video.subtitles as SubtitleTrack[])?.find(
    (s) => s.language === language
  );
  
  if (video.provider === 'VIMEO') {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${video.providerId}?texttrack=${language}`}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }
  
  if (video.provider === 'CLOUDFLARE') {
    return (
      <video controls width="100%">
        <source src={video.videoUrl} />
        {subtitle && (
          <track
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={language === 'ko'}
          />
        )}
      </video>
    );
  }
}

8. QR 기반 증빙 시스템
8.1. 교육 실행 흐름
mermaidgraph TD
    A[교육 시작] --> B{언어 선택 팝업}
    B -->|한국어| C[PC 화면 재생]
    B -->|외국어| D[QR 코드 생성 + 표시]
    
    D --> E[외국인: 모바일로 QR 스캔]
    E --> F[모바일에서 언어 재선택]
    F --> G[모바일 재생 + 자막]
    
    C --> H[교육 완료]
    G --> H
    
    H --> I[PC에 QR 코드 표시]
    I --> J[모든 참석자: 모바일로 QR 스캔]
    J --> K[증빙 수집 페이지]
    
    K --> L[이름 입력]
    L --> M[셀카 촬영]
    M --> N[전자 서명]
    N --> O[개인정보 동의 체크]
    O --> P[완료 버튼]
    
    P --> Q[서버: PDF 생성]
    Q --> R[대시보드 알림]
8.2. 언어 선택 팝업
typescript// components/LanguageSelectionModal.tsx

export default function LanguageSelectionModal({ onSelect }: Props) {
  const languages = [
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  ];
  
  return (
    <Modal isOpen>
      <h2>언어를 선택하세요 / Select Language</h2>
      <div className="grid grid-cols-2 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="p-4 border rounded-lg hover:bg-blue-50"
          >
            <span className="text-4xl">{lang.flag}</span>
            <p className="mt-2">{lang.label}</p>
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        ℹ️ 외국어 선택 시 QR 코드가 표시됩니다.
      </p>
    </Modal>
  );
}
8.3. QR 토큰 생성
typescript// app/lib/qr/generate-qr-token.ts

import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

interface QRTokenPayload {
  sessionId: string;
  courseId: string;
  tenantId: string;
  language: string;
  expiresAt: number;
}

export async function generateQRToken(payload: QRTokenPayload): Promise<string> {
  // 1. JWT 토큰 생성
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '30m' } // 기본 30분
  );
  
  // 2. QR 코드 URL
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mobile/learn?token=${token}`;
  
  // 3. QR 코드 이미지 생성 (Base64)
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 400,
    margin: 2,
  });
  
  return qrCodeDataUrl;
}
8.4. 모바일 학습 페이지
typescript// app/mobile/learn/page.tsx

export default async function MobileLearnPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  // 1. 토큰 검증
  const payload = verifyQRToken(searchParams.token);
  
  if (!payload) {
    return <div>유효하지 않은 QR 코드입니다.</div>;
  }
  
  // 2. 교육 과정 정보 조회
  const course = await prisma.educationCourse.findUnique({
    where: { id: payload.courseId },
  });
  
  return (
    <div className="mobile-learn-container">
      <h1>{course.title}</h1>
      
      {/* 언어 재선택 */}
      <LanguageSelector defaultLanguage={payload.language} />
      
      {/* 영상 재생 */}
      <VideoPlayer course={course} language={payload.language} />
      
      {/* 진행률 */}
      <ProgressBar />
    </div>
  );
}
8.5. 증빙 수집 페이지
typescript// app/mobile/verify/page.tsx

export default function VerifyPage({ searchParams }: { searchParams: { token: string } }) {
  const [name, setName] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  
  const handleSubmit = async () => {
    const response = await fetch('/api/education/verify', {
      method: 'POST',
      body: JSON.stringify({
        token: searchParams.token,
        name,
        selfieUrl,
        signatureUrl,
        consentGiven,
        gps: await getCurrentPosition(),
      }),
    });
    
    if (response.ok) {
      alert('증빙이 제출되었습니다!');
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1>📸 교육 이수 확인</h1>
      
      {/* 이름 입력 */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
        className="w-full px-4 py-2 border rounded"
      />
      
      {/* 셀카 촬영 */}
      <SelfieCapture onCapture={setSelfieUrl} />
      
      {/* 전자 서명 */}
      <SignatureCanvas onSave={setSignatureUrl} />
      
      {/* 개인정보 동의 */}
      <label className="flex items-center mt-4">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
        />
        <span className="ml-2">개인정보 수집 및 이용 동의 (필수)</span>
      </label>
      
      <button
        onClick={handleSubmit}
        disabled={!name || !selfieUrl || !signatureUrl || !consentGiven}
        className="w-full mt-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        완료
      </button>
    </div>
  );
}
8.6. 셀카 촬영 컴포넌트
typescript// components/SelfieCapture.tsx

'use client';

import { useRef, useState } from 'react';

export default function SelfieCapture({ onCapture }: { onCapture: (url: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // 전면 카메라
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
    } catch (error) {
      alert('카메라 권한을 허용해주세요');
    }
  };
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    
    // Canvas → Blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      // Cloudflare R2 업로드
      const formData = new FormData();
      formData.append('file', blob, 'selfie.jpg');
      
      const response = await fetch('/api/upload/selfie', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      onCapture(data.url);
      
      // 카메라 종료
      stream?.getTracks().forEach((track) => track.stop());
    }, 'image/jpeg', 0.9);
  };
  
  return (
    <div className="my-4">
      <h3 className="font-medium mb-2">📷 셀카 촬영</h3>
      
      <video ref={videoRef} autoPlay className="w-full rounded" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="flex gap-2 mt-2">
        <button onClick={startCamera} className="px-4 py-2 bg-blue-600 text-white rounded">
          카메라 시작
        </button>
        <button onClick={capturePhoto} className="px-4 py-2 bg-green-600 text-white rounded">
          촬영하기
        </button>
      </div>
    </div>
  );
}
8.7. 전자 서명 컴포넌트
typescript// components/SignatureCanvas.tsx

'use client';

import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function Signature({ onSave }: { onSave: (url: string) => void }) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  
  const handleSave = async () => {
    if (!sigPadRef.current) return;
    
    const dataUrl = sigPadRef.current.toDataURL('image/png');
    
    // Base64 → Blob
    const blob = await (await fetch(dataUrl)).blob();
    
    // Cloudflare R2 업로드
    const formData = new FormData();
    formData.append('file', blob, 'signature.png');
    
    const response = await fetch('/api/upload/signature', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    onSave(data.url);
  };
  
  const handleClear = () => {
    sigPadRef.current?.clear();
  };
  
  return (
    <div className="my-4">
      <h3 className="font-medium mb-2">✍️ 전자 서명</h3>
      
      <div className="border border-gray-300 rounded">
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width: 400,
            height: 200,
            className: 'signature-canvas',
          }}
        />
      </div>
      
      <div className="flex gap-2 mt-2">
        <button onClick={handleClear} className="px-4 py-2 bg-gray-300 rounded">
          지우기
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
          저장
        </button>
      </div>
    </div>
  );
}

9. PDF 자동 생성
9.1. PDF 템플릿 (@react-pdf/renderer)
typescript// app/lib/pdf/certificate-template.tsx

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

// 한글 폰트 등록
Font.register({
  family: 'Noto Sans KR',
  src: '/fonts/NotoSansKR-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans KR',
    padding: 40,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'table' as any,
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 5,
  },
});

interface CertificateProps {
  companyName: string;
  siteName?: string;
  educationTitle: string;
  educationDate: string;
  totalDuration: number;
  attendees: Attendee[];
  screenshots: string[];
}

export default function CertificateTemplate(props: CertificateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <Text style={styles.header}>안전교육 이수 확인서</Text>
        
        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text>회사명: {props.companyName}</Text>
          {props.siteName && <Text>현장명: {props.siteName}</Text>}
          <Text>교육명: {props.educationTitle}</Text>
          <Text>교육일시: {props.educationDate}</Text>
          <Text>총 시간: {Math.floor(props.totalDuration / 60)}분 {props.totalDuration % 60}초</Text>
        </View>
        
        {/* 교육 스크린샷 */}
        <View style={styles.section}>
          <Text>교육 내용:</Text>
          {props.screenshots.map((url, idx) => (
            <Image key={idx} src={url} style={{ width: 200, height: 112, margin: 5 }} />
          ))}
        </View>
        
        {/* 참석자 서명 리스트 */}
        <View style={styles.section}>
          <Text>참석자 서명 리스트:</Text>
          
          <View style={styles.table}>
            {/* 테이블 헤더 */}
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>번호</Text>
              <Text style={styles.tableCell}>이름</Text>
              <Text style={styles.tableCell}>국적</Text>
              <Text style={styles.tableCell}>서명/셀카</Text>
            </View>
            
            {/* 참석자 행 */}
            {props.attendees.map((attendee, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{idx + 1}</Text>
                <Text style={styles.tableCell}>{attendee.name}</Text>
                <Text style={styles.tableCell}>{NATIONALITY_FLAGS[attendee.nationality]}</Text>
                <View style={styles.tableCell}>
                  <Image src={attendee.signatureUrl} style={{ width: 40, height: 20 }} />
                  <Image src={attendee.selfieUrl} style={{ width: 30, height: 40 }} />
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* QR 코드 */}
        <View style={{ textAlign: 'center', marginTop: 20 }}>
          <Text>문서 검증용 QR 코드</Text>
          <Image src={props.qrCode} style={{ width: 100, height: 100, margin: 'auto' }} />
        </View>
      </Page>
    </Document>
  );
}
9.2. PDF 생성 API
typescript// app/api/pdf/generate/route.ts

import { renderToStream } from '@react-pdf/renderer';
import CertificateTemplate from '@/lib/pdf/certificate-template';

export async function POST(request: Request) {
  const {
    historyId,
    companyName,
    siteName,
    educationTitle,
    educationDate,
    totalDuration,
    attendees,
    screenshots,
  } = await request.json();
  
  // 1. QR 코드 생성 (문서 검증용)
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${historyId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
  
  // 2. PDF 렌더링
  const stream = await renderToStream(
    <CertificateTemplate
      companyName={companyName}
      siteName={siteName}
      educationTitle={educationTitle}
      educationDate={educationDate}
      totalDuration={totalDuration}
      attendees={attendees}
      screenshots={screenshots}
      qrCode={qrCodeDataUrl}
    />
  );
  
  // 3. Cloudflare R2에 업로드
  const fileName = `certificates/${historyId}.pdf`;
  const pdfBuffer = await streamToBuffer(stream);
  const uploadResponse = await uploadToR2(pdfBuffer, fileName);
  
  // 4. DB 업데이트
  await prisma.educationHistory.update({
    where: { id: historyId },
    data: {
      certificateUrl: uploadResponse.url,
    },
  });
  
  return NextResponse.json({ url: uploadResponse.url });
}

10. 교육 이력 관리
10.1. 교육 이력 조회 API
typescript// app/api/histories/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const courseId = searchParams.get('courseId');
  const attendeeName = searchParams.get('attendeeName');
  const nationality = searchParams.get('nationality');
  
  const histories = await prisma.educationHistory.findMany({
    where: {
      AND: [
        startDate ? { completedAt: { gte: new Date(startDate) } } : {},
        endDate ? { completedAt: { lte: new Date(endDate) } } : {},
        courseId ? { courseId } : {},
        // JSON 필드 검색 (PostgreSQL)
        attendeeName ? {
          attendees: {
            path: '$[*].name',
            array_contains: attendeeName,
          },
        } : {},
      ],
    },
    include: {
      course: true,
      executor: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  });
  
  return NextResponse.json(histories);
}
10.2. 월별 통계 API
typescript// app/api/statistics/monthly/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const histories = await prisma.educationHistory.findMany({
    where: {
      completedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      course: true,
    },
  });
  
  // 통계 계산
  const stats = {
    totalSessions: histories.length,
    totalAttendees: histories.reduce((sum, h) => sum + h.totalAttendees, 0),
    byNationality: {},
    popularCourses: {},
  };
  
  histories.forEach((history) => {
    // 국적별 집계
    const byNat = history.byNationality as any;
    Object.entries(byNat || {}).forEach(([nat, count]) => {
      stats.byNationality[nat] = (stats.byNationality[nat] || 0) + count;
    });
    
    // 인기 교육 집계
    const courseTitle = history.courseTitleSnapshot;
    stats.popularCourses[courseTitle] = (stats.popularCourses[courseTitle] || 0) + 1;
  });
  
  return NextResponse.json(stats);
}
10.3. Excel 보고서 생성
typescript// app/api/reports/excel/route.ts

import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  const { historyIds } = await request.json();
  
  const histories = await prisma.educationHistory.findMany({
    where: { id: { in: historyIds } },
    include: { course: true },
  });
  
  // Excel 데이터 준비
  const rows = [];
  
  histories.forEach((history) => {
    const attendees = history.attendees as Attendee[];
    
    attendees.forEach((attendee, idx) => {
      rows.push({
        '교육일시': new Date(history.completedAt!).toLocaleString('ko-KR'),
        '교육명': history.courseTitleSnapshot,
        '번호': idx + 1,
        '이름': attendee.name,
        '국적': attendee.nationality,
        '언어': attendee.language,
        '완료 시간': new Date(attendee.completedAt).toLocaleString('ko-KR'),
        '기기': attendee.deviceType,
      });
    });
  });
  
  // Excel 워크북 생성
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '교육 이력');
  
  // Buffer로 변환
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  // Cloudflare R2 업로드
  const fileName = `reports/education-${Date.now()}.xlsx`;
  const uploadResponse = await uploadToR2(excelBuffer, fileName);
  
  return NextResponse.json({ url: uploadResponse.url });
}

11. 보안 및 접근 제어
11.1. Middleware (IP 검증 + 테넌트 식별)
typescript// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Public 경로는 검증 스킵
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // 1. JWT 토큰 검증
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // 2. 테넌트 정보 조회 (캐싱)
  const tenant = await getTenantById(token.tenantId);
  
  if (!tenant) {
    return NextResponse.json({ error: 'Invalid tenant' }, { status: 403 });
  }
  
  // 3. IP 검증
  const clientIp = request.ip || request.headers.get('x-forwarded-for');
  
  if (!isIpAllowed(clientIp, tenant.ipRanges)) {
    return NextResponse.json(
      { error: '허용되지 않은 IP 주소입니다' },
      { status: 403 }
    );
  }
  
  // 4. 요청 헤더에 테넌트 정보 추가
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-schema', tenant.schemaName);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
11.2. RBAC (Role-Based Access Control)
typescript// app/lib/auth/check-permission.ts

export function checkPermission(userRole: UserRole, action: string): boolean {
  const permissions = {
    ADMIN: [
      'video:create',
      'video:update',
      'video:delete',
      'course:create',
      'course:update',
      'course:delete',
      'course:share',
      'education:execute',
      'history:view',
      'user:manage',
      'settings:manage',
    ],
    SUB_ADMIN: [
      'video:view',
      'course:view',
      'education:execute',
      'history:view',
    ],
    USER: [
      'video:view',
      'course:view',
      'education:attend',
    ],
  };
  
  return permissions[userRole]?.includes(action) || false;
}
11.3. 암호화 및 보안
typescript// app/lib/security/encryption.ts

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 비밀번호 검증
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 민감 데이터 암호화 (AES-256)
export function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

// 복호화
export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

12. API 명세
12.1. 인증 API
MethodEndpointDescriptionPOST/api/auth/signup회원가입 (추가 정보 입력)POST/api/auth/signin로그인 (NextAuth.js)GET/api/auth/session현재 세션 조회POST/api/auth/signout로그아웃
12.2. 영상 API
MethodEndpointDescriptionPOST/api/videos영상 등록 (Vimeo URL or Cloudflare 업로드)GET/api/videos영상 목록 조회 (필터링, 페이징)GET/api/videos/[id]영상 상세 조회PUT/api/videos/[id]영상 정보 수정DELETE/api/videos/[id]영상 삭제POST/api/videos/[id]/subtitles자막 업로드POST/api/videos/[id]/ai-translateAI 자동 번역POST/api/videos/preview메타데이터 미리보기 (URL 입력 시)
12.3. 교육 과정 API
MethodEndpointDescriptionPOST/api/courses교육 과정 생성 (노드 저장)GET/api/courses교육 과정 목록 조회GET/api/courses/[id]교육 과정 상세 조회PUT/api/courses/[id]교육 과정 수정DELETE/api/courses/[id]교육 과정 삭제POST/api/courses/[id]/share교육 과정 공유POST/api/courses/[id]/duplicate교육 과정 복사
12.4. 교육 실행 API
MethodEndpointDescriptionPOST/api/education/start교육 시작 (세션 생성)POST/api/education/qr-tokenQR 토큰 생성GET/api/education/qr-verifyQR 토큰 검증POST/api/education/verify증빙 제출 (이름, 셀카, 서명)POST/api/education/complete교육 완료
12.5. 교육 이력 API
MethodEndpointDescriptionGET/api/histories교육 이력 목록 조회 (필터링)GET/api/histories/[id]교육 이력 상세 조회GET/api/statistics/monthly월별 통계POST/api/reports/excelExcel 보고서 생성
12.6. PDF API
MethodEndpointDescriptionPOST/api/pdf/generatePDF 생성GET/api/pdf/[id]PDF 다운로드
12.7. 사용자 관리 API (회사 계정)
MethodEndpointDescriptionPOST/api/users회원 추가GET/api/users회원 목록 조회PUT/api/users/[id]회원 정보 수정DELETE/api/users/[id]회원 삭제POST/api/users/bulk-importExcel 일괄 등록

12.8. 결제 API

#### 사용자용 결제 API
MethodEndpointDescriptionGET/api/payments/subscription사용자 구독 정보 조회PUT/api/payments/subscription구독 플랜 변경DELETE/api/payments/subscription구독 취소GET/api/payments/history사용자 결제 내역 조회GET/api/payments/methods사용자 결제 수단 조회POST/api/payments/methods새 결제 수단 추가PUT/api/payments/methods/[id]결제 수단 수정DELETE/api/payments/methods/[id]결제 수단 삭제

#### 관리자용 결제 API
MethodEndpointDescriptionGET/api/admin/payments/history전체 사용자 결제 내역 조회GET/api/admin/payments/plans구독 플랜 목록 조회PUT/api/admin/payments/plans구독 플랜 설정 업데이트POST/api/admin/payments/plans새 구독 플랜 생성POST/api/admin/payments/refund환불 처리POST/api/admin/payments/cancel-transaction카드 거래 취소GET/api/admin/payments/trials무료 체험 목록 조회POST/api/admin/payments/trials무료 체험 부여PUT/api/admin/payments/trials/[id]/extend무료 체험 연장

---

## 12.9. 결제 시스템 상세 명세

### 12.9.1. 구독 플랜 구조

```typescript
interface SubscriptionPlan {
  id: string;
  type: "INDIVIDUAL" | "COMPANY";
  name: string;
  monthlyPrice: number;  // 월간 가격 (원)
  yearlyPrice: number;   // 연간 가격 (원)
  features: string[];    // 포함된 기능 목록
  maxUsers: number | null; // 최대 사용자 수 (null = 무제한)
  isActive: boolean;     // 플랜 활성화 여부
  trialDays: number;     // 무료 체험 기간 (일)
}
```

#### 기본 플랜 설정

**개인 계정 (INDIVIDUAL)**
- 월간: ₩9,900/월
- 연간: ₩99,000/년 (2개월 무료)
- 최대 사용자: 1명
- 포함 기능:
  - 1인 사용
  - 기본 교육 기능
  - QR 증빙 시스템
  - PDF 생성
  - 교육 이력 조회

**회사 계정 (COMPANY)**
- 월간: ₩99,000/월
- 연간: ₩990,000/년 (2개월 무료)
- 최대 사용자: 무제한
- 포함 기능:
  - 무제한 회원 등록
  - 영상 조합 교육 무제한
  - QR 증빙 시스템
  - 다국어 지원 (19개 언어)
  - AI 자동 번역
  - PDF 자동 생성
  - 교육 이력 관리
  - 통계 분석 대시보드
  - 우선 고객 지원
  - 맞춤 브랜딩

### 12.9.2. 무료 체험 시스템

```typescript
interface FreeTrial {
  id: string;
  userId: string;
  planType: "INDIVIDUAL" | "COMPANY";
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "converted";
  convertedAt?: Date;
  convertedToPlanId?: string;
}
```

#### 무료 체험 정책
- 기본 체험 기간: 14일
- 신규 가입 시 자동 부여
- 체험 기간 중 모든 기능 사용 가능
- 관리자가 수동으로 체험 기간 연장 가능
- 체험 종료 전 7일, 3일, 1일에 이메일 알림
- 체험 종료 후 자동으로 유료 플랜으로 전환 (카드 등록 시)

### 12.9.3. 결제 수단 관리

```typescript
interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "bank";

  // 카드 정보
  cardBrand?: "VISA" | "MASTERCARD" | "AMEX" | "JCB";
  cardLast4?: string;
  expiryDate?: string;

  // 계좌 정보
  bankName?: string;
  accountLast4?: string;

  isDefault: boolean;
  pgCustomerKey: string; // PG사 고객 키
  pgPaymentKey: string;  // PG사 결제 수단 키

  createdAt: Date;
  updatedAt: Date;
}
```

#### PG사 연동
- **권장 PG사**: PortOne (구 아임포트) 또는 Toss Payments
- 카드 정보는 PG사에 저장 (PCI-DSS 준수)
- 플랫폼에는 토큰과 마스킹된 정보만 저장
- 정기 결제 (빌링키) 사용

### 12.9.4. 결제 내역

```typescript
interface Payment {
  id: string;
  userId: string;
  planType: "INDIVIDUAL" | "COMPANY";
  interval: "monthly" | "yearly";
  amount: number;

  // 결제 정보
  method: string;
  cardLast4?: string;
  pgTransactionId: string;

  // 상태
  status: "pending" | "completed" | "failed" | "refunded";

  // 날짜
  date: Date;
  refundedAt?: Date;
  refundReason?: string;

  // 영수증
  receiptUrl?: string;

  createdAt: Date;
}
```

#### 결제 흐름

1. **정기 결제 설정**
   ```
   사용자 → 플랜 선택 → 결제 수단 등록 → 빌링키 발급 → 첫 결제
   ```

2. **자동 갱신**
   ```
   결제일 도래 → 빌링키로 결제 시도 → 성공/실패 처리 → 이메일 알림
   ```

3. **결제 실패 처리**
   ```
   결제 실패 → 3일 후 재시도 → 실패 시 7일 후 재시도 → 실패 시 구독 일시정지
   ```

### 12.9.5. 환불 정책

```typescript
interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: "pending" | "completed" | "rejected";
  processedBy: string; // 관리자 ID
  processedAt?: Date;
  pgRefundId?: string;
  createdAt: Date;
}
```

#### 환불 규정
- **7일 이내**: 100% 환불
- **7일 이후 ~ 1개월 이내**: 사용 일수 제외 후 환불
- **1개월 이후**: 환불 불가 (단, 서비스 장애 시 예외)
- 관리자 승인 필요
- 환불 처리 후 3-5영업일 내 계좌 입금

### 12.9.6. 카드 거래 취소

```typescript
interface CardTransaction {
  id: string;
  userId: string;
  paymentId: string;
  cardLast4: string;
  cardBrand: string;
  amount: number;
  status: "completed" | "cancelled";
  canCancel: boolean; // 24시간 이내만 true
  cancelledAt?: Date;
  cancelledBy?: string; // 관리자 ID
  pgTransactionId: string;
  date: Date;
}
```

#### 거래 취소 규정
- **24시간 이내**: 관리자가 즉시 취소 가능
- **24시간 경과**: 환불 절차 진행
- PG사 API를 통한 실시간 취소 처리

### 12.9.7. 관리자 기능

#### 구독 통계 대시보드
```typescript
interface SubscriptionStats {
  totalSubscribers: number;        // 총 구독자 수
  activeTrials: number;             // 활성 무료체험 수
  monthlyRevenue: number;           // 이번 달 수익
  monthlyRefunds: number;           // 이번 달 환불액
  conversionRate: number;           // 체험→유료 전환율
  churnRate: number;                // 이탈률

  // 플랜별 분포
  planDistribution: {
    individual: number;
    company: number;
  };

  // 월별 추이
  monthlyTrend: {
    month: string;
    revenue: number;
    newSubscribers: number;
    churn: number;
  }[];
}
```

#### 관리자 권한
- **구독 설정**
  - 플랜 생성/수정/삭제
  - 가격 변경
  - 기능 추가/제거
  - 플랜 활성화/비활성화

- **무료 체험 관리**
  - 체험 기간 부여
  - 체험 기간 연장
  - 강제 전환 (체험 → 유료)

- **결제 관리**
  - 전체 결제 내역 조회
  - 환불 처리
  - 카드 거래 취소
  - 결제 실패 사용자 관리

### 12.9.8. 이메일 알림

#### 알림 종류
- **구독 시작**: 결제 완료 및 이용 안내
- **결제 성공**: 월간/연간 정기결제 성공
- **결제 실패**: 결제 실패 및 재시도 안내
- **체험 종료 예정**: 7일전, 3일전, 1일전
- **체험 종료**: 체험 종료 및 플랜 선택 안내
- **구독 갱신 예정**: 7일전
- **구독 취소**: 취소 확인 및 환불 안내
- **환불 완료**: 환불 처리 완료

### 12.9.9. Prisma Schema 추가

```prisma
// 구독 플랜
model SubscriptionPlan {
  id            String   @id @default(uuid())
  type          PlanType
  name          String
  monthlyPrice  Int
  yearlyPrice   Int
  features      String[]
  maxUsers      Int?
  isActive      Boolean  @default(true)
  trialDays     Int      @default(14)

  subscriptions Subscription[]

  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("subscription_plans")
}

enum PlanType {
  INDIVIDUAL
  COMPANY
}

// 사용자 구독
model Subscription {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  user            User     @relation(fields: [userId], references: [id])

  planId          String   @map("plan_id")
  plan            SubscriptionPlan @relation(fields: [planId], references: [id])

  interval        Interval
  status          SubscriptionStatus @default(TRIAL)

  // 날짜
  startedAt       DateTime @map("started_at")
  trialEndsAt     DateTime? @map("trial_ends_at")
  nextBillingDate DateTime? @map("next_billing_date")
  cancelledAt     DateTime? @map("cancelled_at")

  // 결제
  paymentMethodId String?  @map("payment_method_id")
  paymentMethod   PaymentMethod? @relation(fields: [paymentMethodId], references: [id])

  payments        Payment[]

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("subscriptions")
}

enum Interval {
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
  EXPIRED
}

// 결제 수단
model PaymentMethod {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id])

  type            PaymentType

  // 카드
  cardBrand       String?  @map("card_brand")
  cardLast4       String?  @map("card_last4")
  expiryDate      String?  @map("expiry_date")

  // 계좌
  bankName        String?  @map("bank_name")
  accountLast4    String?  @map("account_last4")

  isDefault       Boolean  @default(false) @map("is_default")

  // PG사 정보
  pgCustomerKey   String   @map("pg_customer_key")
  pgPaymentKey    String   @map("pg_payment_key")

  subscriptions   Subscription[]
  payments        Payment[]

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("payment_methods")
}

enum PaymentType {
  CARD
  BANK
}

// 결제 내역
model Payment {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id])

  subscriptionId  String   @map("subscription_id")
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])

  planType        PlanType @map("plan_type")
  interval        Interval
  amount          Int

  // 결제 수단
  paymentMethodId String?  @map("payment_method_id")
  paymentMethod   PaymentMethod? @relation(fields: [paymentMethodId], references: [id])

  method          String
  cardLast4       String?  @map("card_last4")

  // PG사 정보
  pgTransactionId String   @unique @map("pg_transaction_id")

  // 상태
  status          PaymentStatus @default(PENDING)

  // 날짜
  date            DateTime @default(now())
  refundedAt      DateTime? @map("refunded_at")
  refundReason    String?  @map("refund_reason")

  // 영수증
  receiptUrl      String?  @map("receipt_url")

  refund          Refund?

  createdAt       DateTime @default(now()) @map("created_at")

  @@map("payments")
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// 환불
model Refund {
  id          String   @id @default(uuid())
  paymentId   String   @unique @map("payment_id")
  payment     Payment  @relation(fields: [paymentId], references: [id])

  amount      Int
  reason      String
  status      RefundStatus @default(PENDING)

  processedBy String?  @map("processed_by")
  processedAt DateTime? @map("processed_at")

  pgRefundId  String?  @map("pg_refund_id")

  createdAt   DateTime @default(now()) @map("created_at")

  @@map("refunds")
}

enum RefundStatus {
  PENDING
  COMPLETED
  REJECTED
}

// 무료 체험
model FreeTrial {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id])

  planType        PlanType @map("plan_type")
  startDate       DateTime @map("start_date")
  endDate         DateTime @map("end_date")

  status          TrialStatus @default(ACTIVE)

  convertedAt     DateTime? @map("converted_at")
  convertedToPlanId String? @map("converted_to_plan_id")

  createdAt       DateTime @default(now()) @map("created_at")

  @@map("free_trials")
}

enum TrialStatus {
  ACTIVE
  EXPIRED
  CONVERTED
}
```

---

13. 개발 로드맵
Phase 1: 기반 시스템 (3주)

Week 1

 Next.js 15 프로젝트 초기 설정
 Prisma Schema 정의 (Public + Tenant)
 NextAuth.js 설정 (Google, Kakao, Naver)
 회원가입 폼 + DB 저장


Week 2

 로그인 + IP 동시 접속 제어
 Middleware (테넌트 식별, IP 검증)
 RBAC 구현 (권한 체크 함수)


Week 3

 대시보드 레이아웃 (Tailwind CSS)
 화이트/다크 모드 토글
 사이드바 네비게이션



Phase 2: 영상 라이브러리 (4주)

Week 4

 Vimeo Provider 구현 (oEmbed API)
 영상 등록 UI (URL 입력 → 메타데이터 자동)


Week 5

 Cloudflare Stream Provider 구현
 파일 업로드 UI (Drag & Drop)


Week 6

 자막 파일 업로드 (SRT/VTT)
 Cloudflare R2 연동


Week 7

 OpenAI Whisper + GPT-4 자동 번역
 영상 카드 UI (마우스 오버: 미리보기)
 검색 + 필터링



Phase 3: 교육 조합 노드 에디터 (4주)

Week 8

 React Flow 설치 및 기본 설정
 노드 타입 정의 (VIDEO, IMAGE, PDF)


Week 9

 Drag & Drop으로 노드 추가
 노드 연결 (엣지)


Week 10

 노드 정보 편집 UI
 교육 과정 저장/불러오기


Week 11

 교육 과정 공유 기능
 교육 과정 복사 기능



Phase 4: 교육 실행 및 QR 시스템 (5주)

Week 12

 언어 선택 팝업 UI
 한국어: PC 재생 (Video.js)


Week 13

 외국어: QR 코드 생성 (JWT)
 모바일 QR 스캔 페이지


Week 14

 모바일 영상 재생 + 자막
 진행률 트래킹


Week 15

 교육 완료 후 QR 코드 표시
 QR 토큰 만료 처리


Week 16

 증빙 수집 UI (이름, 셀카, 서명)
 개인정보 동의 체크박스



Phase 5: PDF 생성 및 이력 관리 (3주)

Week 17

 @react-pdf/renderer 설정
 PDF 템플릿 작성 (한글 폰트)


Week 18

 PDF 생성 API
 Cloudflare R2 업로드
 대시보드 알림 표시


Week 19

 교육 이력 목록 (필터링)
 월별 통계 대시보드
 Excel 보고서 생성



Phase 6: 관리자 기능 및 운영 (2주)

Week 20

 회원 관리 (회사 계정)
 Excel 일괄 등록


Week 21

 업종별 추천 영상 설정
 QR 토큰 시간 설정
 이메일 알림 (Resend)



Phase 7: 테스트 및 배포 (2주)

Week 22

 E2E 테스트 (Playwright)
 모바일 반응형 테스트
 다국어 자막 정확도 검증


Week 23

 Vercel 배포
 Sentry 에러 모니터링
 성능 최적화 (Lighthouse 90+)



총 예상 기간: 23주 (약 5.5개월)
---

## 업데이트 이력 (2025-01-21)

### 최근 구현된 기능

#### 1. 아이디/비밀번호 찾기 시스템 (모달 방식)

**구현 내용:**
- 6자리 랜덤 인증번호를 이용한 본인 확인 시스템
- 휴대폰 번호 또는 이메일을 선택하여 인증 가능
- 모달 UI로 구현하여 사용자 경험 개선

**주요 파일:**
- `/components/FindEmailModal.tsx` - 아이디 찾기 모달
- `/components/FindPasswordModal.tsx` - 비밀번호 찾기 모달
- `/app/api/auth/send-verification/route.ts` - 인증번호 발송 API
- `/app/api/auth/verify-code/route.ts` - 인증번호 검증 API
- `/app/api/auth/reset-password/route.ts` - 비밀번호 재설정 API

**주요 기능:**

1. **아이디 찾기 흐름:**
   ```
   방법 선택 (휴대폰/이메일) 
   → 정보 입력 
   → 6자리 인증번호 입력 
   → 아이디 표시 
   → 비밀번호 찾기로 이동 옵션 제공
   ```

2. **비밀번호 찾기 흐름:**
   ```
   방법 선택 (휴대폰/이메일) 
   → 정보 입력 
   → 6자리 인증번호 입력 
   → 새 비밀번호 설정 
   → 로그인 페이지로 리다이렉트
   ```

3. **보안 기능:**
   - 인증번호는 5분간 유효
   - 인증번호는 global Map에 저장 (프로덕션에서는 Redis 사용 권장)
   - 비밀번호 검증: 6자 이상, 특수문자 필수 포함
   - 비밀번호 해싱: bcrypt (salt rounds: 12)
   - 리셋 토큰은 10분간 유효

**코드 예시:**

```typescript
// 인증번호 생성 및 저장
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const verificationCodes = new Map();
verificationCodes.set(key, {
  code,
  expiresAt: Date.now() + 5 * 60 * 1000,
  type: "phone" | "email",
  purpose: "find-email" | "find-password"
});
```

---

#### 2. 화이트 모드 폰트 색상 수정

**구현 내용:**
- 모든 텍스트 입력 필드의 화이트 모드 폰트 색상을 일관되게 수정
- `text-gray-900 dark:text-white` → `text-black dark:text-white` 로 전면 변경

**영향 받은 파일:** 
- 52개 파일 수정 (app 폴더 및 components 폴더 전체)
- 모든 input, textarea, select 요소

**변경 이유:**
- 화이트 모드에서 더 명확한 가독성 제공
- UI 일관성 개선
- 사용자 피드백 반영

---

#### 3. 영상 카테고리 관리 모달

**구현 내용:**
- 관리자가 영상 카테고리를 직접 생성/수정/삭제할 수 있는 모달 UI
- 영상 라이브러리 페이지에서 "카테고리 관리" 버튼으로 접근

**주요 파일:**
- `/components/CategoryManagementModal.tsx`
- `/app/dashboard/videos/page.tsx` (통합)

**기본 카테고리:**
```typescript
const categories = [
  { id: "1", name: "제조", icon: "🏭" },
  { id: "2", name: "화학", icon: "⚗️" },
  { id: "3", name: "건설", icon: "🏗️" },
  { id: "4", name: "공통", icon: "📚" },
  { id: "5", name: "일반", icon: "📋" },
];
```

**주요 기능:**
1. **카테고리 추가:** 아이콘과 이름을 입력하여 새 카테고리 생성
2. **카테고리 수정:** 인라인 편집으로 이름과 아이콘 변경
3. **카테고리 삭제:** 삭제 전 확인 다이얼로그 표시
4. **실시간 업데이트:** 변경사항이 즉시 UI에 반영

**UI 구조:**
```
┌─────────────────────────────────────┐
│ 카테고리 관리                 [X]   │
├─────────────────────────────────────┤
│ 새 카테고리 추가                     │
│ [🏭] [카테고리 이름] [추가]         │
├─────────────────────────────────────┤
│ 등록된 카테고리                      │
│ 🏭 제조          [수정] [삭제]      │
│ ⚗️ 화학          [수정] [삭제]      │
│ 🏗️ 건설          [수정] [삭제]      │
│ 📚 공통          [수정] [삭제]      │
│ 📋 일반          [수정] [삭제]      │
└─────────────────────────────────────┘
```

---

#### 4. 영상 등록 모달 (리치 텍스트 에디터 포함)

**구현 내용:**
- 영상 등록을 모달 방식으로 변경
- React Quill 기반 리치 텍스트 에디터 통합
- 카테고리 선택, 태그 입력, 상세 내용 작성 기능 추가

**주요 파일:**
- `/components/VideoUploadModal.tsx`
- `/app/dashboard/videos/page.tsx` (통합)

**설치된 라이브러리:**
```bash
npm install react-quill quill
```

**주요 기능:**

1. **업로드 방식 선택:**
   - URL 입력 (Vimeo, Cloudflare Stream)
   - 파일 업로드 (최대 2GB, MP4/WebM/MOV 등)
   - Drag & Drop 지원

2. **상세 정보 입력:**
   - **교육 제목*** (필수)
   - **카테고리*** (필수, 드롭다운)
   - **태그** (검색용, 다중 입력 가능)
   - **교육 내용 요약** (간단한 설명)
   - **상세 내용** (리치 텍스트 에디터)

3. **리치 텍스트 에디터 기능:**
   - 헤더 (H1, H2, H3)
   - 텍스트 스타일 (굵게, 기울임, 밑줄, 취소선)
   - 색상 및 배경색
   - 리스트 (순서, 비순서)
   - 정렬
   - 링크 및 이미지 삽입
   - 서식 지우기

4. **업로드 진행률 표시:**
   - 파일 업로드 시 실시간 진행률 표시
   - 프로그레스 바 (0-100%)

**코드 구조:**

```typescript
interface VideoUploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const [formData, setFormData] = useState({
  title: "",
  summary: "",
  detailedContent: "",  // 리치 텍스트 에디터 내용
  category: "",
  tags: [] as string[],
  isPublic: true,
});

// Quill 에디터 설정
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};
```

**모달 UI 구조:**
```
┌───────────────────────────────────────────┐
│ 영상 등록                           [X]   │
├───────────────────────────────────────────┤
│ [🔗 URL 입력] [📤 파일 업로드]           │
├───────────────────────────────────────────┤
│ 영상 URL: [________________] [미리보기]  │
│                                           │
│ 미리보기:                                 │
│ [썸네일] 제공자: Vimeo                    │
│          시간: 10분 30초                  │
├───────────────────────────────────────────┤
│ 교육 제목*: [_________________________]  │
│                                           │
│ 카테고리*: [제조 ▼]                      │
│                                           │
│ 태그: [태그 입력] [추가]                 │
│ [안전교육 x] [산업안전 x] [제조업 x]     │
│                                           │
│ 교육 내용 요약:                           │
│ [_____________________________________]  │
│ [_____________________________________]  │
│                                           │
│ 상세 내용:                                │
│ [상세 내용 작성하기 (클릭)]              │
│                                           │
│ ☑ 다른 사용자에게 공개                   │
│                                           │
│                     [취소] [등록하기]     │
└───────────────────────────────────────────┘

상세 내용 편집 모달 (별도):
┌───────────────────────────────────────────┐
│ 상세 내용 작성                      [X]   │
├───────────────────────────────────────────┤
│ [H] [B] [I] [U] [S] [색] [배경] [정렬].. │
│ ┌───────────────────────────────────────┐ │
│ │                                       │ │
│ │   리치 텍스트 편집 영역                │ │
│ │                                       │ │
│ │   - 폰트 스타일 변경                   │ │
│ │   - 이미지 삽입                        │ │
│ │   - 링크 삽입                          │ │
│ │                                       │ │
│ └───────────────────────────────────────┘ │
│                              [완료]        │
└───────────────────────────────────────────┘
```

**사용 예시:**

```typescript
// 영상 라이브러리 페이지에서 사용
<button
  onClick={() => setShowUploadModal(true)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
  <span className="material-symbols-outlined text-sm">add</span>
  <span>영상 등록</span>
</button>

{showUploadModal && (
  <VideoUploadModal
    onClose={() => setShowUploadModal(false)}
    onSuccess={() => {
      setShowUploadModal(false);
      fetchVideos(); // 목록 새로고침
    }}
  />
)}
```

---

### 기술 스택 업데이트

**추가된 라이브러리:**

```json
{
  "dependencies": {
    "react-quill": "^2.0.0",
    "quill": "^1.3.7"
  }
}
```

**Rich Text Editor 설정:**

```typescript
// Next.js에서 react-quill을 dynamic import로 사용 (SSR 방지)
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// CSS 임포트
import "react-quill/dist/quill.snow.css";
```

---

### UI/UX 개선 사항

1. **모달 UI 일관성:**
   - 모든 모달에서 동일한 디자인 패턴 적용
   - 닫기 버튼 위치 통일 (우측 상단)
   - 버튼 스타일 일관성 (취소/확인)

2. **다크 모드 지원:**
   - 모든 새 컴포넌트에서 다크 모드 완벽 지원
   - `dark:` prefix를 사용한 Tailwind CSS 클래스

3. **반응형 디자인:**
   - 모바일, 태블릿, 데스크톱 모두 지원
   - 모달 크기 및 레이아웃 자동 조정

4. **접근성:**
   - Material Symbols Icons 사용
   - 키보드 네비게이션 지원 (Enter 키로 제출 등)
   - 포커스 관리 (자동 포커스 이동)

---

### 보안 개선 사항

1. **인증번호 시스템:**
   - 5분 타임아웃 자동 적용
   - 일회용 코드 (사용 후 삭제)
   - Rate limiting 고려 필요 (프로덕션)

2. **비밀번호 정책:**
   - 최소 6자 이상
   - 특수문자 필수 포함
   - bcrypt 해싱 (salt rounds: 12)

3. **파일 업로드 검증:**
   - 파일 크기 제한 (최대 2GB)
   - 파일 형식 검증 (video/* MIME 타입)
   - XHR 기반 업로드로 진행률 추적

---

### 다음 단계 (권장 사항)

1. **API 통합:**
   - 카테고리 관리 API 구현 (`/api/categories`)
   - 영상 상세 정보 저장 필드 확장 (tags, detailedContent)

2. **Redis 마이그레이션:**
   - 인증번호 저장을 global Map에서 Redis로 전환
   - 세션 관리 개선

3. **이미지 업로드:**
   - 리치 텍스트 에디터에서 이미지 업로드 기능 구현
   - Cloudflare R2 연동

4. **검색 최적화:**
   - 태그 기반 전체 텍스트 검색 (PostgreSQL full-text search)
   - Elasticsearch 통합 고려

5. **테스트:**
   - 모달 컴포넌트 단위 테스트
   - E2E 테스트 (Playwright)
   - 모바일 반응형 테스트

---

### 버그 수정 및 마이너 개선

1. **회원가입 폼:**
   - 회사명(업체명) 필드를 선택사항으로 변경
   - 관리자 회원 추가 모달에도 회사명 필드 추가

2. **폰트 일관성:**
   - 모든 입력 필드에서 화이트 모드 시 검은색 폰트 적용
   - 다크 모드 시 흰색 폰트 유지

3. **빌드 최적화:**
   - Dynamic import 사용으로 번들 크기 최적화
   - react-quill을 클라이언트 사이드에서만 로드

---

### 커밋 이력

```bash
# 2025-01-21
feat: ID/Password finding with 6-digit verification and optional company name
feat: Convert ID/Password finding to modal components
feat: white mode font fixes and category management modal
feat: video upload modal with rich text editor
feat: video upload modal improvements and icon picker
```

---

#### 5. 아이콘 선택기 및 영상 등록 모달 개선 (2025-01-21 업데이트)

**구현 내용:**
- 카테고리 관리 모달에 아이콘 선택 팝업 추가
- 영상 등록 모달 UX 개선 (미리보기 필수 제거)
- 권한 기반 공개 옵션 표시 (일반 사용자만)
- "첫 영상 등록하기" 버튼을 모달 방식으로 변경

**주요 파일:**
- `/components/CategoryManagementModal.tsx` - 아이콘 선택기 추가
- `/components/VideoUploadModal.tsx` - UX 개선 및 권한 기반 UI
- `/app/dashboard/videos/page.tsx` - 역할 감지 및 모달 통합

**주요 기능:**

1. **아이콘 선택기 (Icon Picker):**
   - 64개 이모지 아이콘 제공
   - 8x8 그리드 레이아웃
   - 클릭 시 팝업 모달로 표시
   - 새 카테고리 추가 및 편집 모드 모두 지원

   ```typescript
   const AVAILABLE_ICONS = [
     "🏭", "⚗️", "🏗️", "📚", "📋", "🔧", "⚙️", "🔨",
     "🏢", "🏪", "🏬", "🏭", "🏗️", "⛏️", "🔩", "⚡",
     // ... 총 64개
   ];

   // 아이콘 버튼 (텍스트 입력 대체)
   <button
     onClick={() => setShowIconPicker(true)}
     className="w-20 px-3 py-2 border text-2xl text-center"
   >
     {newCategoryIcon}
   </button>

   // 아이콘 선택 팝업 (z-[60]로 메인 모달 위에 표시)
   {showIconPicker && (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
       <div className="grid grid-cols-8 gap-2">
         {AVAILABLE_ICONS.map((icon, idx) => (
           <button onClick={() => {
             setNewCategoryIcon(icon);
             setShowIconPicker(false);
           }}>
             {icon}
           </button>
         ))}
       </div>
     </div>
   )}
   ```

2. **영상 등록 모달 UX 개선:**
   - **미리보기 필수 제거:** 이제 URL 입력/파일 선택 후 바로 모든 입력 필드 표시
   - **미리보기는 선택사항:** 정보 확인용으로만 사용
   - **즉시 입력 가능:** 제목, 카테고리, 태그, 요약, 상세 내용을 바로 작성 가능

   변경 전:
   ```
   URL 입력 → [미리보기 버튼 클릭 필수] → 메타데이터 로드 → 입력 필드 표시
   ```

   변경 후:
   ```
   URL 입력 또는 파일 선택 → 입력 필드 즉시 표시 (미리보기는 선택사항)
   ```

3. **권한 기반 공개 옵션:**
   - **관리자/보조 관리자:** "다른 사용자에게 공개" 체크박스 숨김
   - **일반 사용자:** 공개 옵션 표시

   ```typescript
   interface VideoUploadModalProps {
     onClose: () => void;
     onSuccess?: () => void;
     userRole?: string; // "ADMIN", "SUB_ADMIN", "USER"
   }

   // 권한 기반 렌더링
   {userRole !== "ADMIN" && userRole !== "SUB_ADMIN" && (
     <div>
       <label className="flex items-center">
         <input type="checkbox" checked={formData.isPublic} />
         <span>다른 사용자에게 공개</span>
       </label>
     </div>
   )}
   ```

4. **첫 영상 등록하기 버튼:**
   - `/dashboard/videos/new` 링크를 모달 트리거 버튼으로 변경
   - 기존 "영상 등록" 버튼과 동일한 모달 사용

   변경 전:
   ```tsx
   <Link href="/dashboard/videos/new">첫 영상 등록하기</Link>
   ```

   변경 후:
   ```tsx
   <button onClick={() => setShowUploadModal(true)}>
     첫 영상 등록하기
   </button>
   ```

**기술적 개선사항:**

1. **역할 감지 시스템:**
   ```typescript
   // videos/page.tsx
   const [userRole, setUserRole] = useState<string>("USER");

   const fetchUserRole = async () => {
     const response = await fetch("/api/auth/session");
     const data = await response.json();
     if (data.user?.role) {
       setUserRole(data.user.role);
     }
   };

   // VideoUploadModal에 전달
   <VideoUploadModal userRole={userRole} />
   ```

2. **TypeScript 타입 안전성:**
   - 미리보기 데이터가 null일 수 있는 경우 처리
   - Optional chaining 사용

   ```typescript
   videoUrl: uploadMethod === "url"
     ? videoUrl
     : preview
     ? `https://videodelivery.net/${preview.providerId}`
     : ""
   ```

3. **검증 로직 개선:**
   ```typescript
   // URL 방식
   if (uploadMethod === "url" && !videoUrl.trim()) {
     setError("영상 URL을 입력해주세요");
     return;
   }

   // 파일 업로드 방식
   if (uploadMethod === "file" && !selectedFile && !preview) {
     setError("파일을 선택하고 업로드해주세요");
     return;
   }
   ```

**UI 계층 구조:**
```
메인 모달 (z-50)
  └─ 영상 등록 폼
      └─ 카테고리 관리 모달 (z-50)
          └─ 아이콘 선택 팝업 (z-[60])
```

**빌드 결과:**
- ✅ TypeScript 컴파일 성공
- ✅ 모든 타입 검증 통과
- ✅ 80개 라우트 정적 생성 완료

---
