import { VideoProvider, VideoProviderType } from "./types";
import { VimeoProvider } from "./vimeo-provider";
import { CloudflareProvider } from "./cloudflare-provider";

/**
 * Video Provider Factory
 * 타입에 따라 적절한 Provider 인스턴스 생성
 */
export function createVideoProvider(
  type: VideoProviderType
): VideoProvider {
  switch (type) {
    case VideoProviderType.VIMEO:
      return new VimeoProvider();
    case VideoProviderType.CLOUDFLARE:
      return new CloudflareProvider();
    default:
      throw new Error(`지원하지 않는 제공자: ${type}`);
  }
}

/**
 * URL을 보고 자동으로 Provider 감지
 */
export function detectProvider(url: string): VideoProviderType | null {
  if (/vimeo\.com|player\.vimeo\.com/.test(url)) {
    return VideoProviderType.VIMEO;
  }

  if (/cloudflarestream\.com|videodelivery\.net/.test(url)) {
    return VideoProviderType.CLOUDFLARE;
  }

  return null;
}

/**
 * URL 유효성 검증 및 Provider 반환
 */
export function getProviderFromUrl(url: string): VideoProvider | null {
  const providerType = detectProvider(url);

  if (!providerType) {
    return null;
  }

  const provider = createVideoProvider(providerType);

  if (!provider.validateUrl(url)) {
    return null;
  }

  return provider;
}
