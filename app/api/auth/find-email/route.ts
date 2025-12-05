import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 아이디(이메일) 찾기 API
 * POST /api/auth/find-email
 */
export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json();

    // 필수 값 확인
    if (!name || !phone) {
      return NextResponse.json(
        { error: "이름과 휴대폰번호를 입력하세요" },
        { status: 400 }
      );
    }

    // 휴대폰번호 형식 검증
    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "휴대폰번호 형식이 올바르지 않습니다 (예: 010-1234-5678)" },
        { status: 400 }
      );
    }

    // TODO: 데이터베이스에서 사용자 조회
    // const user = await prisma.user.findFirst({
    //   where: {
    //     name,
    //     phone,
    //     isActive: true,
    //   },
    //   select: {
    //     email: true,
    //   },
    // });

    // if (!user) {
    //   return NextResponse.json(
    //     { error: "일치하는 회원 정보를 찾을 수 없습니다" },
    //     { status: 404 }
    //   );
    // }

    // return NextResponse.json({
    //   success: true,
    //   email: user.email,
    // });

    // 임시 응답 (TODO: Prisma 설정 후 위 코드 활성화)
    return NextResponse.json({
      success: true,
      email: "example@example.com",
    });
  } catch (error) {
    console.error("Find email error:", error);
    return NextResponse.json(
      { error: "이메일 찾기에 실패했습니다" },
      { status: 500 }
    );
  }
}
