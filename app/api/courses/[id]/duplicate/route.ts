import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * 교육 과정 복사 API
 * POST /api/courses/[id]/duplicate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // 원본 교육 과정 조회
    const originalCourse = await prisma.educationCourse.findUnique({
      where: { id: courseId },
    });

    if (!originalCourse) {
      return NextResponse.json(
        { error: "교육 과정을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 접근 권한 확인
    const hasAccess =
      originalCourse.isPublic ||
      originalCourse.ownerId === session.user.id ||
      originalCourse.sharedWith.includes(session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 복사본 생성
    const duplicatedCourse = await prisma.educationCourse.create({
      data: {
        title: `${originalCourse.title} (복사본)`,
        description: originalCourse.description,
        thumbnail: originalCourse.thumbnail,
        nodes: originalCourse.nodes as Prisma.InputJsonValue,
        edges: originalCourse.edges as Prisma.InputJsonValue,
        totalDuration: originalCourse.totalDuration,
        ownerId: session.user.id, // 현재 사용자가 소유자
        isPublic: false, // 복사본은 기본적으로 비공개
      },
    });

    return NextResponse.json({
      success: true,
      course: duplicatedCourse,
      message: "교육 과정이 복사되었습니다",
    });
  } catch (error) {
    console.error("Course duplication error:", error);
    return NextResponse.json(
      { error: "교육 과정 복사에 실패했습니다" },
      { status: 500 }
    );
  }
}
