import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 모든 알림 읽음 처리 API
 * PATCH /api/notifications/read-all
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma로 모든 알림 읽음 처리
    // await prisma.notification.updateMany({
    //   where: {
    //     userId: session.user.id,
    //     read: false,
    //   },
    //   data: {
    //     read: true,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "모든 알림을 읽음으로 표시했습니다",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return NextResponse.json(
      { error: "알림 읽음 처리에 실패했습니다" },
      { status: 500 }
    );
  }
}
