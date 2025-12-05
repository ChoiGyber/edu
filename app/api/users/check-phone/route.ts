import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 휴대폰번호 중복 확인 API
 * GET /api/users/check-phone?phone={phone}
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "휴대폰번호를 입력하세요" },
        { status: 400 }
      );
    }

    // 휴대폰번호 형식 검증 (010-1234-5678)
    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "휴대폰번호 형식이 올바르지 않습니다 (예: 010-1234-5678)" },
        { status: 400 }
      );
    }

    // 중복 확인
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    return NextResponse.json({
      available: !existingUser,
      phone,
    });
  } catch (error) {
    console.error("Phone check error:", error);
    return NextResponse.json(
      { error: "휴대폰번호 확인에 실패했습니다" },
      { status: 500 }
    );
  }
}
