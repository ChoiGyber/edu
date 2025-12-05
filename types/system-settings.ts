// 시스템 설정 타입 정의

export enum SettingKey {
  // Auth
  NEXTAUTH_URL = 'NEXTAUTH_URL',
  NEXTAUTH_SECRET = 'NEXTAUTH_SECRET',

  // OAuth - Google
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',

  // OAuth - Kakao
  KAKAO_CLIENT_ID = 'KAKAO_CLIENT_ID',
  KAKAO_CLIENT_SECRET = 'KAKAO_CLIENT_SECRET',

  // OAuth - Naver
  NAVER_CLIENT_ID = 'NAVER_CLIENT_ID',
  NAVER_CLIENT_SECRET = 'NAVER_CLIENT_SECRET',

  // Cloudflare R2
  R2_ACCOUNT_ID = 'R2_ACCOUNT_ID',
  R2_ACCESS_KEY_ID = 'R2_ACCESS_KEY_ID',
  R2_SECRET_ACCESS_KEY = 'R2_SECRET_ACCESS_KEY',
  R2_BUCKET_NAME = 'R2_BUCKET_NAME',

  // OpenAI
  OPENAI_API_KEY = 'OPENAI_API_KEY',

  // Security
  ENCRYPTION_KEY = 'ENCRYPTION_KEY',
  JWT_SECRET = 'JWT_SECRET',
}

export interface SystemSettingValue {
  key: SettingKey;
  value: string;
  encrypted: boolean;
  updatedAt?: Date;
}

export interface SettingCategory {
  title: string;
  description: string;
  icon: string;
  settings: SettingField[];
}

export interface SettingField {
  key: SettingKey;
  label: string;
  description: string;
  type: 'text' | 'password' | 'textarea';
  required: boolean;
  encrypted: boolean;
  placeholder?: string;
  validation?: (value: string) => boolean;
  errorMessage?: string;
}

// 설정 카테고리 정의
export const SETTING_CATEGORIES: SettingCategory[] = [
  {
    title: '인증 설정',
    description: 'NextAuth.js 기본 설정',
    icon: '🔐',
    settings: [
      {
        key: SettingKey.NEXTAUTH_URL,
        label: 'NextAuth URL',
        description: '애플리케이션 기본 URL (예: https://your-domain.com)',
        type: 'text',
        required: true,
        encrypted: false,
        placeholder: 'https://your-domain.com',
      },
      {
        key: SettingKey.NEXTAUTH_SECRET,
        label: 'NextAuth Secret',
        description: 'JWT 서명을 위한 비밀 키',
        type: 'password',
        required: true,
        encrypted: true,
        placeholder: '최소 32자 이상의 랜덤 문자열',
      },
    ],
  },
  {
    title: 'Google OAuth',
    description: 'Google 소셜 로그인 설정',
    icon: '🔵',
    settings: [
      {
        key: SettingKey.GOOGLE_CLIENT_ID,
        label: 'Client ID',
        description: 'Google Cloud Console에서 발급받은 Client ID',
        type: 'text',
        required: false,
        encrypted: false,
        placeholder: '123456789-abc.apps.googleusercontent.com',
      },
      {
        key: SettingKey.GOOGLE_CLIENT_SECRET,
        label: 'Client Secret',
        description: 'Google Cloud Console에서 발급받은 Client Secret',
        type: 'password',
        required: false,
        encrypted: true,
        placeholder: 'GOCSPX-...',
      },
    ],
  },
  {
    title: 'Kakao OAuth',
    description: 'Kakao 소셜 로그인 설정',
    icon: '💛',
    settings: [
      {
        key: SettingKey.KAKAO_CLIENT_ID,
        label: 'REST API 키',
        description: 'Kakao Developers에서 발급받은 REST API 키',
        type: 'text',
        required: false,
        encrypted: false,
        placeholder: 'abc123...',
      },
      {
        key: SettingKey.KAKAO_CLIENT_SECRET,
        label: 'Client Secret',
        description: 'Kakao Developers에서 발급받은 Client Secret (선택)',
        type: 'password',
        required: false,
        encrypted: true,
        placeholder: '...',
      },
    ],
  },
  {
    title: 'Naver OAuth',
    description: 'Naver 소셜 로그인 설정',
    icon: '🟢',
    settings: [
      {
        key: SettingKey.NAVER_CLIENT_ID,
        label: 'Client ID',
        description: 'Naver Developers에서 발급받은 Client ID',
        type: 'text',
        required: false,
        encrypted: false,
        placeholder: 'abc123...',
      },
      {
        key: SettingKey.NAVER_CLIENT_SECRET,
        label: 'Client Secret',
        description: 'Naver Developers에서 발급받은 Client Secret',
        type: 'password',
        required: false,
        encrypted: true,
        placeholder: '...',
      },
    ],
  },
  {
    title: 'Cloudflare R2',
    description: '파일 스토리지 설정 (셀카, 서명, PDF 저장)',
    icon: '☁️',
    settings: [
      {
        key: SettingKey.R2_ACCOUNT_ID,
        label: 'Account ID',
        description: 'Cloudflare Account ID',
        type: 'text',
        required: true,
        encrypted: false,
        placeholder: 'abc123...',
      },
      {
        key: SettingKey.R2_ACCESS_KEY_ID,
        label: 'Access Key ID',
        description: 'R2 API Access Key ID',
        type: 'text',
        required: true,
        encrypted: false,
        placeholder: '...',
      },
      {
        key: SettingKey.R2_SECRET_ACCESS_KEY,
        label: 'Secret Access Key',
        description: 'R2 API Secret Access Key',
        type: 'password',
        required: true,
        encrypted: true,
        placeholder: '...',
      },
      {
        key: SettingKey.R2_BUCKET_NAME,
        label: 'Bucket Name',
        description: 'R2 버킷 이름',
        type: 'text',
        required: true,
        encrypted: false,
        placeholder: 'safety-education',
      },
    ],
  },
  {
    title: 'OpenAI API',
    description: 'AI 자동 번역 기능 (선택사항)',
    icon: '🤖',
    settings: [
      {
        key: SettingKey.OPENAI_API_KEY,
        label: 'API Key',
        description: 'OpenAI API Key (Whisper + GPT-4 번역용)',
        type: 'password',
        required: false,
        encrypted: true,
        placeholder: 'sk-...',
      },
    ],
  },
  {
    title: '보안 설정',
    description: '암호화 및 JWT 서명 키',
    icon: '🔒',
    settings: [
      {
        key: SettingKey.ENCRYPTION_KEY,
        label: 'Encryption Key',
        description: 'AES-256 암호화 키 (64자 HEX)',
        type: 'password',
        required: true,
        encrypted: false, // 이미 암호화 키 자체이므로 평문 저장
        placeholder: '64자 HEX 문자열',
      },
      {
        key: SettingKey.JWT_SECRET,
        label: 'JWT Secret',
        description: 'JWT 토큰 서명 키',
        type: 'password',
        required: true,
        encrypted: true,
        placeholder: '최소 32자 이상',
      },
    ],
  },
];
