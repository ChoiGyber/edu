import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 채팅 메시지 조회 API (로그인 사용자 및 방문자 모두 접근 가능)
 * GET /api/support/chats/[id]/messages
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const params = await context.params;
    const chatId = params.id;

    // TODO: Prisma로 메시지 조회
    // const messages = await prisma.chatMessage.findMany({
    //   where: { chatId },
    //   orderBy: { createdAt: 'asc' },
    //   include: {
    //     sender: {
    //       select: { name: true },
    //     },
    //   },
    // });

    // 임시 목 데이터
    const mockMessages = [
      {
        id: "msg1",
        chatId,
        senderId: "user1",
        senderName: "홍길동",
        senderType: "user",
        message: "포크리프트 교육 영상이 재생되지 않아요",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg2",
        chatId,
        senderId: "admin1",
        senderName: "관리자",
        senderType: "admin",
        message: "안녕하세요. 어떤 브라우저를 사용하고 계신가요?",
        createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg3",
        chatId,
        senderId: "user1",
        senderName: "홍길동",
        senderType: "user",
        message: "크롬 브라우저 사용하고 있습니다",
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg4",
        chatId,
        senderId: "admin1",
        senderName: "관리자",
        senderType: "admin",
        message: "브라우저 캐시를 삭제하고 다시 시도해주세요. Ctrl+Shift+Delete를 눌러서 캐시를 지울 수 있습니다.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg5",
        chatId,
        senderId: "user1",
        senderName: "홍길동",
        senderType: "user",
        message: "해결되었습니다! 감사합니다",
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
      },
    ];

    return NextResponse.json({
      success: true,
      messages: mockMessages,
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { error: "메시지를 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 메시지 전송 API (관리자 및 방문자 모두 사용 가능)
 * POST /api/support/chats/[id]/messages
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const params = await context.params;
    const chatId = params.id;
    const { message, visitorName } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "메시지를 입력하세요" },
        { status: 400 }
      );
    }

    // 메시지 발신자 확인
    const isAdmin = !!session?.user?.id;
    const senderType = isAdmin ? "admin" : "visitor";
    const senderName = isAdmin ? "관리자" : (visitorName || "방문자");

    // TODO: Prisma로 메시지 생성
    // const chatMessage = await prisma.chatMessage.create({
    //   data: {
    //     chatId,
    //     senderId: session?.user?.id,
    //     senderType,
    //     senderName,
    //     message: message.trim(),
    //   },
    // });

    // await prisma.chat.update({
    //   where: { id: chatId },
    //   data: {
    //     lastMessage: message.trim(),
    //     lastMessageAt: new Date(),
    //   },
    // });

    const mockMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: session?.user?.id || "visitor",
      senderName,
      senderType,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    return NextResponse.json({
      success: true,
      message: mockMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "메시지 전송에 실패했습니다" },
      { status: 500 }
    );
  }
}
