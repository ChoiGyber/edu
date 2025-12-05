import {
  VideoProvider,
  VideoProviderType,
  VideoMetadata,
  PlayerOptions,
  EmbedOptions,
} from "./types";

export class CloudflareProvider implements VideoProvider {
  type = VideoProviderType.CLOUDFLARE;
  private accountId: string;
  private apiToken: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
  }

  /**
   * Cloudflare Stream URL에서 비디오 UID 추출
   */
  private extractVideoUid(url: string): string | null {
    const patterns = [
      /cloudflarestream\.com\/([a-f0-9]+)/,
      /videodelivery\.net\/([a-f0-9]+)/,
      /customer-[a-z0-9]+\.cloudflarestream\.com\/([a-f0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * URL 유효성 검증
   */
  validateUrl(url: string): boolean {
    return this.extractVideoUid(url) !== null;
  }

  /**
   * Cloudflare Stream API로 메타데이터 추출
   * 참고: https://developers.cloudflare.com/stream/
   */
  async extractMetadata(url: string): Promise<VideoMetadata> {
    const uid = this.extractVideoUid(url);

    if (!uid) {
      throw new Error("유효하지 않은 Cloudflare Stream URL입니다");
    }

    if (!this.accountId || !this.apiToken) {
      throw new Error("Cloudflare 인증 정보가 설정되지 않았습니다");
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Cloudflare API 오류: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const video = data.result;

      return {
        providerId: uid,
        title: video.meta?.name || "Untitled",
        duration: video.duration || 0,
        thumbnailUrl: video.thumbnail || this.getThumbnailUrl(uid),
        embedHtml: this.getEmbedHtml(uid),
        width: video.input?.width,
        height: video.input?.height,
      };
    } catch (error) {
      console.error("Cloudflare metadata extraction error:", error);
      throw new Error("Cloudflare Stream 메타데이터를 가져올 수 없습니다");
    }
  }

  /**
   * 파일 업로드
   */
  async uploadVideo(file: File): Promise<VideoMetadata> {
    if (!this.accountId || !this.apiToken) {
      throw new Error("Cloudflare 인증 정보가 설정되지 않았습니다");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Cloudflare 업로드 오류: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const video = data.result;

      return {
        providerId: video.uid,
        title: file.name.replace(/\.[^/.]+$/, ""), // 확장자 제거
        duration: video.duration || 0,
        thumbnailUrl: this.getThumbnailUrl(video.uid),
      };
    } catch (error) {
      console.error("Cloudflare upload error:", error);
      throw new Error("영상 업로드에 실패했습니다");
    }
  }

  /**
   * 썸네일 URL 생성
   */
  private getThumbnailUrl(uid: string): string {
    return `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg`;
  }

  /**
   * 플레이어 URL 생성
   */
  getPlayerUrl(providerId: string, options?: PlayerOptions): string {
    const params = new URLSearchParams();

    if (options?.autoplay) params.set("autoplay", "true");
    if (options?.loop) params.set("loop", "true");
    if (options?.muted) params.set("muted", "true");

    const queryString = params.toString();
    return `https://videodelivery.net/${providerId}${
      queryString ? `?${queryString}` : ""
    }`;
  }

  /**
   * Embed HTML 생성
   */
  getEmbedHtml(providerId: string, options?: EmbedOptions): string {
    const width = options?.width || "100%";
    const height = options?.height || "100%";

    return `<iframe
      src="https://iframe.videodelivery.net/${providerId}"
      style="border: none; width: ${width}; height: ${height};"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
      allowfullscreen="true"
    ></iframe>`;
  }
}
