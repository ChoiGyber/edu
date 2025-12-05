import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/payments/subscription - 사용자 구독 정보 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma에서 구독 정보 조회
    // const subscription = await prisma.subscription.findUnique({
    //   where: { userId: session.user.id },
    // });

    // Mock data for now
    const subscription = {
      plan: "COMPANY",
      amount: 990000,
      interval: "yearly",
      nextBillingDate: "2025-12-18",
      status: "active",
      trialEndsAt: null,
    };

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PUT /api/payments/subscription - 구독 플랜 변경
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType, interval } = await request.json();

    if (!["INDIVIDUAL", "COMPANY"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    if (!["monthly", "yearly"].includes(interval)) {
      return NextResponse.json(
        { error: "Invalid interval" },
        { status: 400 }
      );
    }

    // TODO: Prisma로 구독 플랜 변경
    // const updated = await prisma.subscription.update({
    //   where: { userId: session.user.id },
    //   data: {
    //     planType,
    //     interval,
    //     // Calculate new amount and next billing date
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "구독 플랜이 변경되었습니다",
    });
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/subscription - 구독 취소
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma로 구독 취소 처리
    // const cancelled = await prisma.subscription.update({
    //   where: { userId: session.user.id },
    //   data: {
    //     status: 'cancelled',
    //     cancelledAt: new Date(),
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "구독이 취소되었습니다. 현재 구독 기간이 종료되면 서비스가 중단됩니다.",
    });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
