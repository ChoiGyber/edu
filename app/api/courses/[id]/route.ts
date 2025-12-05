import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 교육 과정 상세 조회 API
 * GET /api/courses/[id]
 */
export async function GET(
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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "교육 과정을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 권한 확인 (소유자, 공개, 공유받은 사용자)
    const hasAccess =
      course.isPublic ||
      course.ownerId === session.user.id ||
      course.sharedWith.includes(session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });

  } catch (error) {
    console.error("Course detail error:", error);
    return NextResponse.json(
      { error: "교육 과정을 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 교육 과정 수정 API
 * PUT /api/courses/[id]
 */
export async function PUT(
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

    // 소유자만 수정 가능
    if (course.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "수정 권한이 없습니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      nodes,
      edges,
      totalDuration,
      thumbnail,
      isPublic,
    } = body;

    // 교육 과정 수정
    const updatedCourse = await prisma.educationCourse.update({
      where: { id: (await params).id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(nodes && { nodes: JSON.stringify(nodes) }),
        ...(edges && { edges: JSON.stringify(edges) }),
        ...(totalDuration !== undefined && { totalDuration }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({
      success: true,
      course: updatedCourse,
    });

  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json(
      { error: "교육 과정 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 교육 과정 삭제 API
 * DELETE /api/courses/[id]
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

    // 소유자만 삭제 가능
    if (course.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 교육 과정 삭제
    await prisma.educationCourse.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({
      success: true,
      message: "교육 과정이 삭제되었습니다",
    });

  } catch (error) {
    console.error("Course delete error:", error);
    return NextResponse.json(
      { error: "교육 과정 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
