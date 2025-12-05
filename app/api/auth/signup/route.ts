import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/signup - 일반 회원가입
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      phone,
      companyName,
      siteName,
      industry,
      accountType,
    } = body;

    // 필수 필드 검증
    if (!email || !password || !name || !phone || !companyName || !industry || !accountType) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력하세요" },
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

    // 비밀번호 검증 (6자 이상, 특수문자 포함)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasSpecialChar) {
      return NextResponse.json(
        { error: "비밀번호는 특수문자를 포함해야 합니다" },
        { status: 400 }
      );
    }

    // 휴대전화번호 형식 검증 (010-1234-5678)
    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "휴대전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)" },
        { status: 400 }
      );
    }

    // TODO: Prisma에서 이메일 중복 확인
    // const existingUser = await prisma.user.findUnique({
    //   where: { email },
    // });

    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: '이미 사용 중인 이메일입니다' },
    //     { status: 409 }
    //   );
    // }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 12);

    // TODO: Prisma로 사용자 생성
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     passwordHash,
    //     name,
    //     phone,
    //     companyName,
    //     siteName,
    //     industry,
    //     role: 'ADMIN', // 첫 가입자는 관리자
    //     provider: 'credentials',
    //     isActive: true,
    //   },
    // });

    // // 무료 체험 기간 부여 (14일)
    // const trialEndDate = new Date();
    // trialEndDate.setDate(trialEndDate.getDate() + 14);

    // await prisma.subscription.create({
    //   data: {
    //     userId: user.id,
    //     planType: accountType,
    //     status: 'TRIAL',
    //     startedAt: new Date(),
    //     trialEndsAt: trialEndDate,
    //   },
    // });

    // await prisma.freeTrial.create({
    //   data: {
    //     userId: user.id,
    //     planType: accountType,
    //     startDate: new Date(),
    //     endDate: trialEndDate,
    //     status: 'ACTIVE',
    //   },
    // });

    console.log("회원가입 요청:", {
      email,
      name,
      phone,
      companyName,
      siteName,
      industry,
      accountType,
    });

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
