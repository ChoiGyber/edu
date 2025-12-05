import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 알림 목록 조회 API
 * GET /api/notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma로 알림 조회
    // const notifications = await prisma.notification.findMany({
    //   where: {
    //     userId: session.user.id,
    //   },
    //   orderBy: {
    //     createdAt: 'desc',
    //   },
    //   take: 20,
    // });

    // 임시 데이터 (관리자 vs 일반 사용자)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = currentUser?.role === "ADMIN";

    const mockNotifications = isAdmin
      ? [
          // 관리자 알림
          {
            id: "1",
            type: "signup",
            title: "새로운 회원 가입",
            message: "홍길동님이 회원가입하였습니다",
            link: "/dashboard/users",
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            type: "issue",
            title: "교육 진행 오류",
            message: "건설업 안전교육 과정에서 오류가 발생했습니다",
            link: "/dashboard/histories",
            read: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            type: "pdf",
            title: "PDF 보고서 생성 완료",
            message: "2025년 1월 교육 이수 확인서가 생성되었습니다",
            link: "/dashboard/certificates",
            read: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "4",
            type: "system",
            title: "시스템 점검 안내",
            message: "2025-01-25 02:00~04:00 시스템 점검이 예정되어 있습니다",
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
      : [
          // 일반 사용자 알림
          {
            id: "5",
            type: "education",
            title: "교육 이수 완료",
            message: "포크리프트 안전교육을 완료하였습니다",
            link: "/user/history",
            read: false,
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: "6",
            type: "pdf",
            title: "이수 증명서 발급",
            message: "안전교육 이수 증명서가 발급되었습니다",
            link: "/user/certificates",
            read: false,
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: "7",
            type: "system",
            title: "새로운 교육 과정 등록",
            message: "화학물질 안전관리 교육이 추가되었습니다",
            link: "/user/courses",
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

    return NextResponse.json({
      success: true,
      notifications: mockNotifications,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "알림을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}
