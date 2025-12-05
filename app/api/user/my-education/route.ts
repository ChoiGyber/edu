import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 나의안전교육 목록 조회 API
 * GET /api/user/my-education
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma로 저장된 교육 조회
    // const savedItems = await prisma.savedEducation.findMany({
    //   where: { userId: session.user.id },
    //   include: { course: true },
    //   orderBy: { savedAt: 'desc' },
    // });

    // 임시 Mock 데이터
    const mockItems = [
      {
        id: "saved-1",
        courseId: "course-1",
        title: "건설현장 안전교육 기본과정",
        description: "건설 현장에서 필수적으로 알아야 할 안전 수칙과 절차를 학습합니다",
        thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
        totalDuration: 2700, // 45분
        savedAt: new Date().toISOString(),
      },
      {
        id: "saved-2",
        courseId: "course-2",
        title: "전기안전 종합교육",
        description: "전기 작업 시 안전 수칙 및 감전 사고 예방법",
        thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
        totalDuration: 1800, // 30분
        savedAt: new Date(Date.now() - 86400000).toISOString(), // 1일 전
      },
    ];

    return NextResponse.json({
      success: true,
      items: mockItems,
    });
  } catch (error) {
    console.error("Fetch saved education error:", error);
    return NextResponse.json(
      { error: "저장된 교육을 불러올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 나의안전교육에 추가 API
 * POST /api/user/my-education
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "교육 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // TODO: Prisma로 저장
    // const existingSave = await prisma.savedEducation.findUnique({
    //   where: {
    //     userId_courseId: {
    //       userId: session.user.id,
    //       courseId,
    //     },
    //   },
    // });

    // if (existingSave) {
    //   return NextResponse.json(
    //     { error: "이미 저장된 교육입니다" },
    //     { status: 409 }
    //   );
    // }

    // const savedItem = await prisma.savedEducation.create({
    //   data: {
    //     userId: session.user.id,
    //     courseId,
    //   },
    //   include: { course: true },
    // });

    return NextResponse.json({
      success: true,
      message: "나의안전교육에 추가되었습니다",
    });
  } catch (error) {
    console.error("Save education error:", error);
    return NextResponse.json(
      { error: "교육 저장에 실패했습니다" },
      { status: 500 }
    );
  }
}
