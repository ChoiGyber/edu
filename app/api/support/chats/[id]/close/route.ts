import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 채팅 종료 API (관리자용)
 * PATCH /api/support/chats/[id]/close
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

    // TODO: Prisma로 채팅 종료
    // await prisma.chat.update({
    //   where: { id: chatId },
    //   data: {
    //     status: 'closed',
    //     closedAt: new Date(),
    //     closedBy: session.user.id,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "채팅이 종료되었습니다",
    });
  } catch (error) {
    console.error("Close chat error:", error);
    return NextResponse.json(
      { error: "채팅 종료에 실패했습니다" },
      { status: 500 }
    );
  }
}
