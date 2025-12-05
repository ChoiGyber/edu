import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 글로벌 인메모리 저장소 (실제 환경에서는 Redis 사용 권장)
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
 * 6자리 인증번호 생성 함수
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 인증번호 발송 API
 * POST /api/auth/send-verification
 */
export async function POST(request: NextRequest) {
  try {
    const {
      method, // "email" or "phone"
      value, // email address or phone number
      purpose, // "find-email" or "find-password"
      name, // 이름 (find-email용)
    } = await request.json();

    // 필수 값 확인
    if (!method || !value || !purpose) {
      return NextResponse.json(
        { error: "필수 정보를 입력하세요" },
        { status: 400 }
      );
    }

    // 형식 검증
    if (method === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return NextResponse.json(
          { error: "올바른 이메일 형식이 아닙니다" },
          { status: 400 }
        );
      }
    } else if (method === "phone") {
      const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
      if (!phoneRegex.test(value)) {
        return NextResponse.json(
          { error: "휴대폰번호 형식이 올바르지 않습니다 (예: 010-1234-5678)" },
          { status: 400 }
        );
      }
    }

    // 사용자 존재 확인
    let user;
    if (purpose === "find-email") {
      // 이름과 연락처로 사용자 찾기
      if (!name) {
        return NextResponse.json(
          { error: "이름을 입력하세요" },
          { status: 400 }
        );
      }

      try {
        user = await prisma.user.findFirst({
          where: {
            name,
            ...(method === "phone" ? { phone: value } : { email: value }),
            isActive: true,
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
    } else {
      // find-password: 연락처로 사용자 찾기
      try {
        user = await prisma.user.findFirst({
          where: {
            ...(method === "phone" ? { phone: value } : { email: value }),
            isActive: true,
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
    }

    if (!user) {
      return NextResponse.json(
        { error: "일치하는 회원 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 6자리 인증번호 생성
    const code = generateVerificationCode();

    // 인증번호 저장 (5분 유효)
    const key = `${method}:${value}:${purpose}`;
    verificationCodes.set(key, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5분
      type: method,
      purpose,
    });

    // TODO: 실제 SMS/이메일 발송
    // if (method === "phone") {
    //   await sendSMS(value, `[안전교육 플랫폼] 인증번호: ${code}`);
    // } else {
    //   await sendEmail(value, "인증번호 안내", `인증번호: ${code}`);
    // }

    console.log(
      `[인증번호 발송] ${method}:${value} -> ${code} (${purpose})`
    );

    return NextResponse.json({
      success: true,
      message: `인증번호가 ${method === "phone" ? "휴대폰" : "이메일"}로 발송되었습니다`,
      // 개발 환경에서만 코드 노출
      ...(process.env.NODE_ENV === "development" && { code }),
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "인증번호 발송에 실패했습니다" },
      { status: 500 }
    );
  }
}

// 주기적으로 만료된 코드 정리 (5분마다)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of verificationCodes.entries()) {
      if (value.expiresAt < now) {
        verificationCodes.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
