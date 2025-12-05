import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments/plans - 구독 플랜 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // TODO: Prisma에서 구독 플랜 조회
    // const plans = await prisma.subscriptionPlan.findMany({
    //   orderBy: { createdAt: 'desc' },
    // });

    // Mock data for now
    const plans = [
      {
        id: "1",
        type: "INDIVIDUAL",
        name: "개인 계정",
        monthlyPrice: 9900,
        yearlyPrice: 99000,
        features: ["1인 사용", "기본 교육 기능", "QR 증빙 시스템", "PDF 생성"],
        maxUsers: 1,
        isActive: true,
      },
      {
        id: "2",
        type: "COMPANY",
        name: "회사 계정",
        monthlyPrice: 99000,
        yearlyPrice: 990000,
        features: [
          "무제한 회원",
          "모든 기능 포함",
          "AI 자동 번역",
          "우선 지원",
          "맞춤 브랜딩",
        ],
        maxUsers: null,
        isActive: true,
      },
    ];

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/payments/plans - 구독 플랜 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const {
      planId,
      monthlyPrice,
      yearlyPrice,
      features,
      maxUsers,
      isActive,
    } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // TODO: Prisma로 플랜 업데이트
    // const updated = await prisma.subscriptionPlan.update({
    //   where: { id: planId },
    //   data: {
    //     monthlyPrice,
    //     yearlyPrice,
    //     features,
    //     maxUsers,
    //     isActive,
    //     updatedAt: new Date(),
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "구독 플랜이 업데이트되었습니다",
    });
  } catch (error) {
    console.error("Failed to update plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

// POST /api/admin/payments/plans - 새 구독 플랜 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const {
      type,
      name,
      monthlyPrice,
      yearlyPrice,
      features,
      maxUsers,
    } = await request.json();

    if (!type || !name || !monthlyPrice || !yearlyPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Prisma로 새 플랜 생성
    // const newPlan = await prisma.subscriptionPlan.create({
    //   data: {
    //     type,
    //     name,
    //     monthlyPrice,
    //     yearlyPrice,
    //     features,
    //     maxUsers,
    //     isActive: true,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "새 구독 플랜이 생성되었습니다",
    });
  } catch (error) {
    console.error("Failed to create plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
