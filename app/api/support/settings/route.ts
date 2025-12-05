import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 채팅 설정 조회 API
 * GET /api/support/settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma로 설정 조회
    // const settings = await prisma.systemSetting.findUnique({
    //   where: { key: 'chatWidgetSettings' },
    // });

    // 임시 기본 설정
    const mockSettings = {
      chatWidgetPosition: {
        bottom: 20,
        right: 20,
      },
    };

    return NextResponse.json({
      success: true,
      settings: mockSettings,
    });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { error: "설정을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 채팅 설정 저장 API
 * PUT /api/support/settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: 권한 확인 (관리자만)
    // const currentUser = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   select: { role: true },
    // });

    // if (currentUser?.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: "권한이 없습니다" },
    //     { status: 403 }
    //   );
    // }

    const { chatWidgetPosition } = await request.json();

    if (!chatWidgetPosition) {
      return NextResponse.json(
        { error: "설정 값이 필요합니다" },
        { status: 400 }
      );
    }

    // 값 검증
    if (
      typeof chatWidgetPosition.bottom !== "number" ||
      typeof chatWidgetPosition.right !== "number"
    ) {
      return NextResponse.json(
        { error: "올바른 위치 값이 아닙니다" },
        { status: 400 }
      );
    }

    // TODO: Prisma로 설정 저장
    // await prisma.systemSetting.upsert({
    //   where: { key: 'chatWidgetSettings' },
    //   update: {
    //     value: {
    //       chatWidgetPosition,
    //     },
    //   },
    //   create: {
    //     key: 'chatWidgetSettings',
    //     value: {
    //       chatWidgetPosition,
    //     },
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "설정이 저장되었습니다",
    });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { error: "설정 저장에 실패했습니다" },
      { status: 500 }
    );
  }
}
