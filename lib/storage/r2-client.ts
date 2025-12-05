/**
 * Cloudflare R2 Storage Client
 * AWS S3 호환 API 사용
 */

import { getSetting } from "@/lib/settings/settings-manager";
import { SettingKey } from "@/types/system-settings";

export interface UploadOptions {
  key: string; // 파일 경로/이름
  body: Buffer | Blob | File;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export class R2Client {
  private accessKeyId?: string;
  private secretAccessKey?: string;
  private bucketName?: string;
  private accountId?: string;
  private publicUrl?: string;
  private initialized: boolean = false;

  /**
   * DB에서 설정값 로드
   */
  private async initialize() {
    if (this.initialized) return;

    this.accessKeyId = (await getSetting(SettingKey.R2_ACCESS_KEY_ID)) || undefined;
    this.secretAccessKey = (await getSetting(SettingKey.R2_SECRET_ACCESS_KEY)) || undefined;
    this.bucketName = (await getSetting(SettingKey.R2_BUCKET_NAME)) || undefined;
    this.accountId = (await getSetting(SettingKey.R2_ACCOUNT_ID)) || undefined;

    // Public URL 생성
    if (this.accountId && this.bucketName) {
      this.publicUrl = `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}`;
    }

    if (!this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      console.warn("Cloudflare R2 설정이 완료되지 않았습니다. 시스템 설정에서 R2 정보를 입력하세요.");
    }

    this.initialized = true;
  }

  /**
   * 파일 업로드
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    await this.initialize();

    const { key, body, contentType, metadata } = options;

    if (!this.accessKeyId || !this.secretAccessKey || !this.bucketName) {
      throw new Error("R2 설정이 완료되지 않았습니다. 시스템 설정에서 R2 정보를 입력하세요.");
    }

    // S3 호환 업로드 구현
    // 실제 프로덕션에서는 @aws-sdk/client-s3 사용
    // 여기서는 간단한 fetch API 사용

    try {
      // Buffer나 Blob을 FormData로 변환
      const formData = new FormData();

      if (body instanceof File) {
        formData.append("file", body);
      } else if (body instanceof Blob) {
        formData.append("file", body, key);
      } else {
        // Buffer인 경우
        const blob = new Blob([body], { type: contentType });
        formData.append("file", blob, key);
      }

      // 메타데이터 추가
      if (metadata) {
        Object.entries(metadata).forEach(([k, v]) => {
          formData.append(`metadata[${k}]`, v);
        });
      }

      // R2 업로드 엔드포인트 호출
      const response = await fetch("/api/upload/r2", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`R2 업로드 실패: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        url: result.url,
        key: key,
        bucket: this.bucketName!,
      };
    } catch (error) {
      console.error("R2 upload error:", error);
      throw new Error("파일 업로드에 실패했습니다");
    }
  }

  /**
   * 파일 URL 생성
   */
  async getPublicUrl(key: string): Promise<string> {
    await this.initialize();
    return `${this.publicUrl}/${key}`;
  }

  /**
   * 파일 삭제
   */
  async delete(key: string): Promise<void> {
    await this.initialize();

    try {
      const response = await fetch(`/api/upload/r2?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`R2 삭제 실패: ${response.statusText}`);
      }
    } catch (error) {
      console.error("R2 delete error:", error);
      throw new Error("파일 삭제에 실패했습니다");
    }
  }

  /**
   * 랜덤 파일명 생성 (UUID)
   */
  generateKey(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}/${timestamp}-${random}.${extension}`;
  }
}

// 싱글톤 인스턴스
export const r2Client = new R2Client();
