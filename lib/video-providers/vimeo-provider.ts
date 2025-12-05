import {
  VideoProvider,
  VideoProviderType,
  VideoMetadata,
  PlayerOptions,
  EmbedOptions,
} from "./types";

export class VimeoProvider implements VideoProvider {
  type = VideoProviderType.VIMEO;

  /**
   * Vimeo URL에서 비디오 ID 추출
   */
  private extractVideoId(url: string): string | null {
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /vimeo\.com\/channels\/[\w-]+\/(\d+)/,
      /vimeo\.com\/groups\/[\w-]+\/videos\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
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
    return this.extractVideoId(url) !== null;
  }

  /**
   * Vimeo oEmbed API로 메타데이터 추출
   * 참고: https://developer.vimeo.com/api/oembed
   */
  async extractMetadata(url: string): Promise<VideoMetadata> {
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      throw new Error("유효하지 않은 Vimeo URL입니다");
    }

    // oEmbed API 호출 (무료, 인증 불필요)
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
      url
    )}`;

    try {
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        throw new Error(
          `Vimeo API 오류: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        providerId: videoId,
        title: data.title || "Untitled",
        duration: data.duration || 0,
        thumbnailUrl:
          data.thumbnail_url ||
          data.thumbnail_url_with_play_button ||
          "",
        author: data.author_name,
        embedHtml: data.html,
        width: data.width,
        height: data.height,
      };
    } catch (error) {
      console.error("Vimeo metadata extraction error:", error);
      throw new Error("Vimeo 메타데이터를 가져올 수 없습니다");
    }
  }

  /**
   * 플레이어 URL 생성
   */
  getPlayerUrl(providerId: string, options?: PlayerOptions): string {
    const params = new URLSearchParams();

    if (options?.autoplay) params.set("autoplay", "1");
    if (options?.loop) params.set("loop", "1");
    if (options?.muted) params.set("muted", "1");
    if (options?.language) params.set("texttrack", options.language);

    const queryString = params.toString();
    return `https://player.vimeo.com/video/${providerId}${
      queryString ? `?${queryString}` : ""
    }`;
  }

  /**
   * Embed HTML 생성
   */
  getEmbedHtml(providerId: string, options?: EmbedOptions): string {
    const playerUrl = this.getPlayerUrl(providerId, options);
    const width = options?.width || "100%";
    const height = options?.height || "100%";

    return `<iframe
      src="${playerUrl}"
      width="${width}"
      height="${height}"
      frameborder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    ></iframe>`;
  }
}
