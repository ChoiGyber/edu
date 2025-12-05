import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 채팅 목록 조회 API (관리자용)
 * GET /api/support/chats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma로 채팅 목록 조회
    // const chats = await prisma.chat.findMany({
    //   orderBy: { lastMessageAt: 'desc' },
    //   include: {
    //     user: {
    //       select: { name: true, email: true },
    //     },
    //   },
    // });

    // 임시 목 데이터
    const mockChats = [
      {
        id: "1",
        userId: "user1",
        userName: "홍길동",
        userEmail: "hong@example.com",
        status: "open",
        lastMessage: "포크리프트 교육 영상이 재생되지 않아요",
        lastMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        unreadCount: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        userId: "user2",
        userName: "김철수",
        userEmail: "kim@example.com",
        status: "open",
        lastMessage: "회원가입이 안됩니다",
        lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        unreadCount: 1,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        userName: "익명 방문자",
        status: "open",
        lastMessage: "가격 문의드립니다",
        lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        userId: "user3",
        userName: "이영희",
        userEmail: "lee@example.com",
        status: "closed",
        lastMessage: "감사합니다!",
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: 0,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      chats: mockChats,
    });
  } catch (error) {
    console.error("Fetch chats error:", error);
    return NextResponse.json(
      { error: "채팅 목록을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 새 채팅 생성 API (사용자/방문자용)
 * POST /api/support/chats
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { message, visitorName, visitorEmail } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "메시지를 입력하세요" },
        { status: 400 }
      );
    }

    // 비로그인 사용자의 경우 이름 필수
    if (!session?.user?.id && !visitorName) {
      return NextResponse.json(
        { error: "이름을 입력하세요" },
        { status: 400 }
      );
    }

    // TODO: Prisma로 채팅 생성
    // const chat = await prisma.chat.create({
    //   data: {
    //     userId: session?.user?.id,
    //     visitorName: !session ? visitorName : undefined,
    //     visitorEmail: !session ? visitorEmail : undefined,
    //     status: 'open',
    //     lastMessage: message,
    //     lastMessageAt: new Date(),
    //   },
    // });

    // const chatMessage = await prisma.chatMessage.create({
    //   data: {
    //     chatId: chat.id,
    //     senderId: session?.user?.id,
    //     senderType: session?.user?.id ? 'user' : 'visitor',
    //     message,
    //   },
    // });

    const mockChat = {
      id: `chat-${Date.now()}`,
      userId: session?.user?.id,
      userName: session?.user?.name || visitorName,
      userEmail: session?.user?.email || visitorEmail,
      status: "open",
      lastMessage: message,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 1,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      chat: mockChat,
    });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { error: "채팅 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
