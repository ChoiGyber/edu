import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * 비밀번호 찾기 (임시 비밀번호 발송) API
 * POST /api/auth/find-password
 */
export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    // 필수 값 확인
    if (!email || !phone) {
      return NextResponse.json(
        { error: "이메일과 휴대폰번호를 입력하세요" },
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
    //     email,
    //     phone,
    //     isActive: true,
    //   },
    // });

    // if (!user) {
    //   return NextResponse.json(
    //     { error: "일치하는 회원 정보를 찾을 수 없습니다" },
    //     { status: 404 }
    //   );
    // }

    // 임시 비밀번호 생성 (8자리, 영문 대소문자 + 숫자 + 특수문자)
    const tempPassword = generateTempPassword();

    // TODO: 임시 비밀번호 해싱 및 저장
    // const passwordHash = await bcrypt.hash(tempPassword, 12);
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { passwordHash },
    // });

    // TODO: 이메일 발송 (Resend 또는 다른 메일 서비스)
    // await sendEmail({
    //   to: email,
    //   subject: "[안전교육 플랫폼] 임시 비밀번호 안내",
    //   body: `
    //     안녕하세요.
    //
    //     회원님의 임시 비밀번호는 다음과 같습니다:
    //     ${tempPassword}
    //
    //     로그인 후 반드시 비밀번호를 변경해주세요.
    //   `,
    // });

    return NextResponse.json({
      success: true,
      message: "임시 비밀번호가 이메일로 전송되었습니다",
    });
  } catch (error) {
    console.error("Find password error:", error);
    return NextResponse.json(
      { error: "비밀번호 재설정에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 임시 비밀번호 생성 함수
 * 8자리, 영문 대소문자 + 숫자 + 특수문자 포함
 */
function generateTempPassword(): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + special;

  let password = "";

  // 각 카테고리에서 최소 1개씩 포함
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // 나머지 4자리는 랜덤
  for (let i = 0; i < 4; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 섞기
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
