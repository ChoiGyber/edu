import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - 팝업 "오늘 하루 보지 않기" 설정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, popupId, days } = body;

    if (!userId || !popupId) {
      return NextResponse.json(
        { error: "사용자 ID와 팝업 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 현재 시간 + days일 계산
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + (days || 1));

    // Upsert (기존에 있으면 업데이트, 없으면 생성)
    const dismissal = await prisma.popupDismissal.upsert({
      where: {
        userId_popupId: {
          userId,
          popupId,
        },
      },
      update: {
        dismissedUntil,
      },
      create: {
        userId,
        popupId,
        dismissedUntil,
      },
    });

    return NextResponse.json(dismissal);
  } catch (error: any) {
    console.error("Error dismissing popup:", error);
    return NextResponse.json(
      { error: "팝업 닫기 설정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// GET - 사용자의 숨김 팝업 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다" },
        { status: 400 }
      );
    }

    const now = new Date();

    const dismissals = await prisma.popupDismissal.findMany({
      where: {
        userId,
        dismissedUntil: {
          gte: now,
        },
      },
      include: {
        popup: true,
      },
    });

    return NextResponse.json(dismissals);
  } catch (error: any) {
    console.error("Error fetching dismissals:", error);
    return NextResponse.json(
      { error: "숨김 팝업 목록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
