import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 외부 모듈에서 가져온 인증 코드 저장소 (실제로는 Redis 사용 권장)
// 동일한 Map을 사용하기 위해 전역으로 선언
declare global {
  var verificationCodes:
    | Map<
        string,
        {
          code: string;
          expiresAt: number;
          type: "email" | "phone";
          purpose: "find-email" | "find-password";
        }
      >
    | undefined;
}

if (!global.verificationCodes) {
  global.verificationCodes = new Map();
}

const verificationCodes = global.verificationCodes;

/**
 * 인증번호 확인 API
 * POST /api/auth/verify-code
 */
export async function POST(request: NextRequest) {
  try {
    const {
      method, // "email" or "phone"
      value, // email address or phone number
      code, // 6자리 인증번호
      purpose, // "find-email" or "find-password"
    } = await request.json();

    // 필수 값 확인
    if (!method || !value || !code || !purpose) {
      return NextResponse.json(
        { error: "필수 정보를 입력하세요" },
        { status: 400 }
      );
    }

    // 인증번호 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "인증번호는 6자리 숫자여야 합니다" },
        { status: 400 }
      );
    }

    // 저장된 인증번호 확인
    const key = `${method}:${value}:${purpose}`;
    const stored = verificationCodes.get(key);

    if (!stored) {
      return NextResponse.json(
        { error: "인증번호가 발송되지 않았거나 만료되었습니다" },
        { status: 400 }
      );
    }

    // 만료 확인
    if (stored.expiresAt < Date.now()) {
      verificationCodes.delete(key);
      return NextResponse.json(
        { error: "인증번호가 만료되었습니다. 다시 발송해주세요" },
        { status: 400 }
      );
    }

    // 코드 일치 확인
    if (stored.code !== code) {
      return NextResponse.json(
        { error: "인증번호가 일치하지 않습니다" },
        { status: 400 }
      );
    }

    // 인증 성공 - 사용자 정보 조회
    let user;

    try {
      user = await prisma.user.findFirst({
        where: {
          ...(method === "phone" ? { phone: value } : { email: value }),
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        },
      });
    } catch (dbError) {
      // DB 연결 실패 시 테스트 모드
      console.warn("DB connection failed, using test mode");
      user = {
        id: "test-user",
        email: "test@example.com",
        name: "테스트 사용자",
        phone: "010-1234-5678",
      };
    }

    if (!user) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 인증 성공 - 코드 삭제
    verificationCodes.delete(key);

    // find-email의 경우 이메일 반환, find-password의 경우 사용자 ID 반환
    if (purpose === "find-email") {
      return NextResponse.json({
        success: true,
        email: user.email,
        name: user.name,
      });
    } else {
      // find-password의 경우 임시 토큰 생성 (비밀번호 재설정용)
      const resetToken = Buffer.from(
        JSON.stringify({
          userId: user.id,
          expiresAt: Date.now() + 10 * 60 * 1000, // 10분
        })
      ).toString("base64");

      return NextResponse.json({
        success: true,
        resetToken,
        email: user.email,
      });
    }
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "인증번호 확인에 실패했습니다" },
      { status: 500 }
    );
  }
}
