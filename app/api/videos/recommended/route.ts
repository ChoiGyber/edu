import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 업종별 추천 영상 조회 API
 * GET /api/videos/recommended?industry=CONSTRUCTION
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");

    if (!industry) {
      return NextResponse.json(
        { error: "업종을 지정해주세요" },
        { status: 400 }
      );
    }

    // 해당 업종의 추천 영상 ID 목록 조회
    const setting = await prisma.systemSetting.findUnique({
      where: { key: `recommended_videos_${industry}` },
    });

    if (!setting || !setting.value) {
      return NextResponse.json({
        success: true,
        videos: [],
        industry,
      });
    }

    const videoIds = setting.value as string[];

    // 영상 정보 조회
    const videos = await prisma.video.findMany({
      where: {
        id: { in: videoIds },
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        thumbnailUrl: true,
        provider: true,
        category: true,
        industry: true,
        viewCount: true,
      },
      orderBy: {
        viewCount: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      videos,
      industry,
    });
  } catch (error) {
    console.error("Get recommended videos error:", error);
    return NextResponse.json(
      { error: "추천 영상 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 업종별 추천 영상 설정 API (ADMIN 전용)
 * PUT /api/videos/recommended
 */
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 권한 확인 (ADMIN만 가능)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자만 접근 가능합니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { industry, videoIds } = body;

    if (!industry || !Array.isArray(videoIds)) {
      return NextResponse.json(
        { error: "업종과 영상 ID 목록을 제공해주세요" },
        { status: 400 }
      );
    }

    // 영상 존재 확인
    const videos = await prisma.video.findMany({
      where: { id: { in: videoIds } },
    });

    if (videos.length !== videoIds.length) {
      return NextResponse.json(
        { error: "일부 영상을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 설정 저장
    await prisma.systemSetting.upsert({
      where: { key: `recommended_videos_${industry}` },
      create: {
        key: `recommended_videos_${industry}`,
        value: videoIds,
      },
      update: {
        value: videoIds,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${industry} 업종의 추천 영상이 설정되었습니다`,
    });
  } catch (error) {
    console.error("Set recommended videos error:", error);
    return NextResponse.json(
      { error: "추천 영상 설정에 실패했습니다" },
      { status: 500 }
    );
  }
}
