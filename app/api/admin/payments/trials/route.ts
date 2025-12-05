import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments/trials - 무료 체험 사용자 목록 조회
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

    // TODO: Prisma에서 무료 체험 목록 조회
    // const trials = await prisma.freeTrial.findMany({
    //   include: {
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       },
    //     },
    //   },
    //   orderBy: { startDate: 'desc' },
    // });

    // Mock data for now
    const trials = [
      {
        id: "1",
        userId: "user4",
        userName: "최지훈",
        userEmail: "choi@example.com",
        startDate: "2025-01-10",
        endDate: "2025-01-24",
        status: "active",
        planType: "회사 계정",
      },
      {
        id: "2",
        userId: "user5",
        userName: "정미영",
        userEmail: "jung@example.com",
        startDate: "2025-01-05",
        endDate: "2025-01-19",
        status: "active",
        planType: "개인 계정",
      },
      {
        id: "3",
        userId: "user6",
        userName: "강동욱",
        userEmail: "kang@example.com",
        startDate: "2024-12-20",
        endDate: "2025-01-03",
        status: "converted",
        planType: "회사 계정",
      },
    ];

    return NextResponse.json({
      success: true,
      trials,
    });
  } catch (error) {
    console.error("Failed to fetch trials:", error);
    return NextResponse.json(
      { error: "Failed to fetch trials" },
      { status: 500 }
    );
  }
}

// POST /api/admin/payments/trials - 무료 체험 부여
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

    const { userId, planType, days } = await request.json();

    if (!userId || !planType || !days) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["INDIVIDUAL", "COMPANY"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    // TODO: Prisma로 무료 체험 생성
    // const trial = await prisma.freeTrial.create({
    //   data: {
    //     userId,
    //     planType,
    //     startDate,
    //     endDate,
    //     status: 'active',
    //   },
    // });

    // // 사용자 구독 상태 업데이트
    // await prisma.subscription.update({
    //   where: { userId },
    //   data: {
    //     status: 'trial',
    //     trialEndsAt: endDate,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: `${days}일 무료 체험이 부여되었습니다`,
    });
  } catch (error) {
    console.error("Failed to grant trial:", error);
    return NextResponse.json(
      { error: "Failed to grant trial" },
      { status: 500 }
    );
  }
}
