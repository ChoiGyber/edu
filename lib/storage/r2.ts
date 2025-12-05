// Cloudflare R2 Storage 유틸리티 (S3 호환)

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 클라이언트 설정
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "safety-education";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";

/**
 * R2에 파일 업로드
 * @param file - 업로드할 파일 (File 또는 Buffer)
 * @param key - 저장할 경로/파일명
 * @param contentType - MIME 타입
 */
export async function uploadToR2(
  file: File | Buffer,
  key: string,
  contentType?: string
): Promise<{ url: string; key: string }> {
  try {
    // File 객체인 경우 Buffer로 변환
    let buffer: Buffer;
    let detectedContentType = contentType;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      detectedContentType = contentType || file.type;
    } else {
      buffer = file;
    }

    // R2에 업로드
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: detectedContentType,
    });

    await r2Client.send(command);

    // 공개 URL 생성
    const url = PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `https://${BUCKET_NAME}.r2.dev/${key}`;

    return { url, key };
  } catch (error) {
    console.error("R2 upload error:", error);
    throw new Error("파일 업로드에 실패했습니다");
  }
}

/**
 * R2에서 파일 삭제
 * @param key - 삭제할 파일 경로/파일명
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error("R2 delete error:", error);
    throw new Error("파일 삭제에 실패했습니다");
  }
}

/**
 * R2에서 Signed URL 생성 (비공개 파일 접근용)
 * @param key - 파일 경로/파일명
 * @param expiresIn - 만료 시간 (초), 기본 1시간
 */
export async function getSignedUrlFromR2(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("R2 signed URL error:", error);
    throw new Error("파일 URL 생성에 실패했습니다");
  }
}

/**
 * 파일명 생성 유틸리티 (UUID + 확장자)
 * @param originalName - 원본 파일명
 * @param prefix - 경로 접두사 (예: "subtitles", "signatures")
 */
export function generateR2Key(originalName: string, prefix: string = ""): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalName.split(".").pop()?.toLowerCase() || "";
  const fileName = `${timestamp}-${randomString}${extension ? `.${extension}` : ""}`;

  return prefix ? `${prefix}/${fileName}` : fileName;
}

/**
 * 자막 파일 업로드 (영상 ID별로 구분)
 * @param file - 자막 파일
 * @param videoId - 영상 ID
 * @param language - 언어 코드 (예: "en", "vi")
 */
export async function uploadSubtitleToR2(
  file: File | Buffer,
  videoId: string,
  language: string
): Promise<{ url: string; key: string }> {
  const extension = file instanceof File ? file.name.split(".").pop() : "srt";
  const key = `subtitles/${videoId}/${language}.${extension}`;

  return uploadToR2(file, key, "text/plain");
}

/**
 * 서명 이미지 업로드
 * @param file - 서명 이미지 파일
 * @param historyId - 교육 이력 ID
 */
export async function uploadSignatureToR2(
  file: File | Buffer,
  historyId: string
): Promise<{ url: string; key: string }> {
  const key = generateR2Key("signature.png", `signatures/${historyId}`);
  return uploadToR2(file, key, "image/png");
}

/**
 * 셀카 이미지 업로드
 * @param file - 셀카 이미지 파일
 * @param historyId - 교육 이력 ID
 */
export async function uploadSelfieToR2(
  file: File | Buffer,
  historyId: string
): Promise<{ url: string; key: string }> {
  const key = generateR2Key("selfie.jpg", `selfies/${historyId}`);
  return uploadToR2(file, key, "image/jpeg");
}

/**
 * PDF 증빙서류 업로드
 * @param file - PDF 파일
 * @param historyId - 교육 이력 ID
 */
export async function uploadCertificateToR2(
  file: Buffer,
  historyId: string
): Promise<{ url: string; key: string }> {
  const key = `certificates/${historyId}.pdf`;
  return uploadToR2(file, key, "application/pdf");
}
