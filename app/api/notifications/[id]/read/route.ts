import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 알림 읽음 처리 API
 * PATCH /api/notifications/[id]/read
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const notificationId = params.id;

    // TODO: Prisma로 알림 읽음 처리
    // await prisma.notification.update({
    //   where: {
    //     id: notificationId,
    //     userId: session.user.id,
    //   },
    //   data: {
    //     read: true,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "알림을 읽음으로 표시했습니다",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "알림 읽음 처리에 실패했습니다" },
      { status: 500 }
    );
  }
}
