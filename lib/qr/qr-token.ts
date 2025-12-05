import jwt from "jsonwebtoken";
import QRCode from "qrcode";

export interface QRTokenPayload {
  sessionId: string;
  courseId: string;
  historyId?: string; // 교육 이력 ID (VERIFY 타입에서 사용)
  tenantId?: string;
  language?: string;
  type: "LEARN" | "VERIFY"; // LEARN: 학습용, VERIFY: 증빙용
  expiresAt: number;
}

/**
 * QR 토큰 생성
 */
export function generateQRToken(payload: Omit<QRTokenPayload, "expiresAt">, expiryMinutes: number = 30): string {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  const token = jwt.sign(
    {
      ...payload,
      expiresAt,
    },
    process.env.JWT_SECRET || "default-secret",
    { expiresIn: `${expiryMinutes}m` }
  );

  return token;
}

/**
 * QR 토큰 검증
 */
export function verifyQRToken(token: string): QRTokenPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    ) as QRTokenPayload;

    // 만료 시간 확인
    if (decoded.expiresAt < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("QR token verification error:", error);
    return null;
  }
}

/**
 * QR 코드 이미지 생성 (Base64 Data URL)
 */
export async function generateQRCode(token: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(token, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("QR code generation error:", error);
    throw new Error("QR 코드 생성에 실패했습니다");
  }
}

/**
 * QR URL 생성 (모바일 접속용)
 */
export function generateQRUrl(token: string, type: "LEARN" | "VERIFY"): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (type === "LEARN") {
    return `${baseUrl}/mobile/learn?token=${token}`;
  } else {
    return `${baseUrl}/mobile/verify?token=${token}`;
  }
}
