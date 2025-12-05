import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 채팅 메시지 읽음 처리 API
 * PATCH /api/support/chats/[id]/read
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
    const chatId = params.id;

    // TODO: Prisma로 메시지 읽음 처리
    // await prisma.chatMessage.updateMany({
    //   where: {
    //     chatId,
    //     senderType: { not: 'admin' }, // 관리자가 아닌 메시지만
    //     read: false,
    //   },
    //   data: {
    //     read: true,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "메시지를 읽음으로 표시했습니다",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return NextResponse.json(
      { error: "메시지 읽음 처리에 실패했습니다" },
      { status: 500 }
    );
  }
}
