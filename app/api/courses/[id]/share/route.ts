import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 교육 과정 공유 API
 * POST /api/courses/[id]/share
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const course = await prisma.educationCourse.findUnique({
      where: { id: (await params).id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "교육 과정을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 소유자만 공유 가능
    if (course.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "공유 권한이 없습니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds } = body; // 공유할 사용자 ID 배열

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "공유할 사용자를 선택해주세요" },
        { status: 400 }
      );
    }

    // 기존 공유 목록과 병합 (중복 제거)
    const currentSharedWith = new Set(course.sharedWith);
    userIds.forEach((id) => currentSharedWith.add(id));

    // 교육 과정 공유 업데이트
    const updatedCourse = await prisma.educationCourse.update({
      where: { id: (await params).id },
      data: {
        sharedWith: Array.from(currentSharedWith),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${userIds.length}명의 사용자와 공유되었습니다`,
      sharedWith: updatedCourse.sharedWith,
    });

  } catch (error) {
    console.error("Course share error:", error);
    return NextResponse.json(
      { error: "교육 과정 공유에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 교육 과정 공유 취소 API
 * DELETE /api/courses/[id]/share
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const course = await prisma.educationCourse.findUnique({
      where: { id: (await params).id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "교육 과정을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 소유자만 공유 취소 가능
    if (course.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 공유 목록에서 제거
    const updatedSharedWith = course.sharedWith.filter((id) => id !== userId);

    const updatedCourse = await prisma.educationCourse.update({
      where: { id: (await params).id },
      data: {
        sharedWith: updatedSharedWith,
      },
    });

    return NextResponse.json({
      success: true,
      message: "공유가 취소되었습니다",
      sharedWith: updatedCourse.sharedWith,
    });

  } catch (error) {
    console.error("Course unshare error:", error);
    return NextResponse.json(
      { error: "공유 취소에 실패했습니다" },
      { status: 500 }
    );
  }
}
