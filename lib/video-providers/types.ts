// Video Provider 공통 인터페이스

export enum VideoProviderType {
  VIMEO = "VIMEO",
  CLOUDFLARE = "CLOUDFLARE"
}

export interface VideoMetadata {
  providerId: string;
  title: string;
  duration: number; // 초 단위
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

export interface VideoProvider {
  type: VideoProviderType;

  // URL에서 메타데이터 추출
  extractMetadata(url: string): Promise<VideoMetadata>;

  // 플레이어 URL 생성
  getPlayerUrl(providerId: string, options?: PlayerOptions): string;

  // Embed HTML 생성
  getEmbedHtml(providerId: string, options?: EmbedOptions): string;

  // URL 유효성 검증
  validateUrl(url: string): boolean;
}
