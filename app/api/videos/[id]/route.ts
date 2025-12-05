import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 영상 상세 조회 API
 * GET /api/videos/[id]
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

    const { id: videoId } = await params;

    // 영상 조회
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "영상을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 접근 권한 확인 (비공개 영상은 소유자만)
    if (!video.isPublic && video.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 조회수 증가
    await prisma.video.update({
      where: { id: videoId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      video: {
        ...video,
        viewCount: video.viewCount + 1, // 증가된 조회수 반영
      },
    });

  } catch (error) {
    console.error("Video fetch error:", error);
    return NextResponse.json(
      { error: "영상 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 영상 수정 API
 * PUT /api/videos/[id]
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

    const { id: videoId } = await params;

    // 영상 조회
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "영상을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 권한 확인 (소유자만 수정 가능)
    if (video.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: "수정 권한이 없습니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, industry, category, isPublic } = body;

    // 영상 수정
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        title,
        description,
        industry,
        category,
        isPublic,
      },
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo,
    });

  } catch (error) {
    console.error("Video update error:", error);
    return NextResponse.json(
      { error: "영상 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 영상 삭제 API
 * DELETE /api/videos/[id]
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

    const { id: videoId } = await params;

    // 영상 조회
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "영상을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 권한 확인 (소유자만 삭제 가능)
    if (video.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 사용 중인 교육 과정이 있는지 확인
    if (video.usedInCourses > 0) {
      return NextResponse.json(
        { error: "이 영상은 교육 과정에서 사용 중이므로 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    // 영상 삭제
    await prisma.video.delete({
      where: { id: videoId },
    });

    return NextResponse.json({
      success: true,
      message: "영상이 삭제되었습니다",
    });

  } catch (error) {
    console.error("Video delete error:", error);
    return NextResponse.json(
      { error: "영상 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
