// ===== 자막 관련 =====

export interface SubtitleTrack {
  language: string; // "en", "vi", "zh", "th"
  label: string; // "English", "Tiếng Việt"
  url: string; // Cloudflare R2 URL
  format: "srt" | "vtt";
  source: "MANUAL" | "AI"; // 수동 업로드 or AI 생성
  createdAt: string; // ISO 8601
}

// ===== 교육 노드 관련 =====

export enum NodeType {
  START = "START",
  VIDEO = "VIDEO",
  IMAGE = "IMAGE",
  PDF = "PDF",
  END = "END"
}

export interface EducationNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    videoId?: string; // VIDEO 타입
    videoTitle?: string;
    videoDuration?: number;
    videoThumbnail?: string;

    imageUrl?: string; // IMAGE 타입
    imageTitle?: string;

    pdfUrl?: string; // PDF 타입
    pdfTitle?: string;

    title?: string;
    description?: string;
  };
}

export interface EducationEdge {
  id: string;
  source: string; // 출발 노드 ID
  target: string; // 도착 노드 ID
  type?: "default" | "smooth" | "step";
  animated?: boolean;
}

// ===== 참석자 관련 =====

export interface Attendee {
  id: string;
  name: string;
  nationality: string; // "KO", "EN", "VN", "TH"
  language: string; // 선택한 언어
  signatureUrl: string; // 전자 서명 이미지 (R2 URL)
  selfieUrl: string; // 셀카 이미지 (R2 URL)
  gpsLatitude?: number; // GPS 위도
  gpsLongitude?: number; // GPS 경도
  completedAt: string; // ISO 8601
  deviceType: "PC" | "MOBILE";
  consentGiven: boolean; // 개인정보 동의
  consentAt: string; // 동의 시간
}

// ===== 회원가입 폼 =====

export interface SignUpForm {
  // OAuth에서 자동 수집
  email: string;
  provider: string; // "google", "kakao", "naver"
  providerId: string;

  // 사용자 입력
  name: string;
  phone: string;
  companyName: string;
  siteName?: string;
  industry: string;

  // 계정 유형
  accountType: "INDIVIDUAL" | "COMPANY";
}

// ===== 업종 정의 =====

export const INDUSTRIES = [
  { value: "CONSTRUCTION", label: "건설업", icon: "🏗️" },
  { value: "MANUFACTURING", label: "제조업", icon: "🏭" },
  { value: "LOGISTICS", label: "물류/운송", icon: "🚚" },
  { value: "FOOD", label: "식음료", icon: "🍔" },
  { value: "CHEMICAL", label: "화학", icon: "⚗️" },
  { value: "ELECTRICITY", label: "전기/전자", icon: "⚡" },
  { value: "SERVICE", label: "서비스업", icon: "💼" },
  { value: "ETC", label: "기타", icon: "📋" },
];

// ===== 언어 정의 =====

export const LANGUAGES = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
];

export const NATIONALITY_FLAGS: Record<string, string> = {
  KO: "🇰🇷",
  EN: "🇺🇸",
  VN: "🇻🇳",
  CN: "🇨🇳",
  TH: "🇹🇭",
};

// ===== Video Provider =====

export enum VideoProviderType {
  VIMEO = "VIMEO",
  CLOUDFLARE = "CLOUDFLARE"
}

export interface VideoMetadata {
  providerId: string;
  title: string;
  duration: number;
  thumbnailUrl: string;
  author?: string;
  embedHtml?: string;
  width?: number;
  height?: number;
}

export interface PlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  language?: string;
}

export interface EmbedOptions extends PlayerOptions {
  width?: string | number;
  height?: string | number;
}

// ===== QR Token =====

export interface QRTokenPayload {
  sessionId: string;
  courseId: string;
  tenantId: string;
  language: string;
  expiresAt: number;
}
