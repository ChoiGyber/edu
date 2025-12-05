import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/check-email - 이메일 중복 확인
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력하세요" },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다" },
        { status: 400 }
      );
    }

    // TODO: Prisma에서 이메일 중복 확인
    // const existingUser = await prisma.user.findUnique({
    //   where: { email },
    // });

    // Mock: 개발 중에는 항상 사용 가능하다고 응답
    const existingUser = null;

    return NextResponse.json({
      available: !existingUser,
      email,
    });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "이메일 확인 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
