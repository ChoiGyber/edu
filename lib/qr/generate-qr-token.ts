import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

/**
 * QR 토큰 페이로드 인터페이스
 */
export interface QRTokenPayload {
  sessionId: string;
  courseId: string;
  historyId: string;
  language: string;
  type: 'MOBILE_LEARN' | 'ATTENDANCE_VERIFY';
  expiresAt: number;
}

/**
 * QR 토큰 생성
 */
export async function generateQRToken(
  payload: Omit<QRTokenPayload, 'expiresAt'>,
  expiryMinutes: number = 30
): Promise<string> {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  const token = jwt.sign(
    {
      ...payload,
      expiresAt,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: `${expiryMinutes}m` }
  );

  return token;
}

/**
 * QR 코드 이미지 생성 (Base64)
 */
export async function generateQRCodeImage(
  url: string,
  options?: {
    width?: number;
    margin?: number;
  }
): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: options?.width || 400,
      margin: options?.margin || 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('QR 코드 생성에 실패했습니다');
  }
}

/**
 * QR 토큰 검증
 */
export function verifyQRToken(token: string): QRTokenPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as QRTokenPayload;

    // 만료 시간 확인
    if (decoded.expiresAt < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('QR token verification error:', error);
    return null;
  }
}

/**
 * 모바일 학습용 QR URL 생성
 */
export async function generateMobileLearningQR(
  sessionId: string,
  courseId: string,
  historyId: string,
  language: string
): Promise<{ token: string; qrCodeUrl: string; mobileUrl: string }> {
  const token = await generateQRToken({
    sessionId,
    courseId,
    historyId,
    language,
    type: 'MOBILE_LEARN',
  });

  const mobileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mobile/learn?token=${token}`;
  const qrCodeUrl = await generateQRCodeImage(mobileUrl);

  return {
    token,
    qrCodeUrl,
    mobileUrl,
  };
}

/**
 * 출석 확인용 QR URL 생성
 */
export async function generateAttendanceVerifyQR(
  sessionId: string,
  courseId: string,
  historyId: string,
  expiryMinutes: number = 30
): Promise<{ token: string; qrCodeUrl: string; verifyUrl: string }> {
  const token = await generateQRToken(
    {
      sessionId,
      courseId,
      historyId,
      language: 'ko',
      type: 'ATTENDANCE_VERIFY',
    },
    expiryMinutes
  );

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mobile/verify?token=${token}`;
  const qrCodeUrl = await generateQRCodeImage(verifyUrl, { width: 600 });

  return {
    token,
    qrCodeUrl,
    verifyUrl,
  };
}
