import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProviderFromUrl, VideoProviderType } from "@/lib/video-providers";

/**
 * 영상 등록 API
 * POST /api/videos
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      videoUrl,
      title,
      description,
      industry,
      category,
      tags,
      isPublic,
    } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: "영상 URL이 필요합니다" },
        { status: 400 }
      );
    }

    // 1. URL로부터 Provider 감지 및 검증
    const provider = getProviderFromUrl(videoUrl);

    if (!provider) {
      return NextResponse.json(
        { error: "지원하지 않는 영상 URL입니다. Vimeo 또는 Cloudflare Stream URL을 입력해주세요." },
        { status: 400 }
      );
    }

    // 2. 메타데이터 추출
    let metadata;
    try {
      metadata = await provider.extractMetadata(videoUrl);
    } catch (error) {
      console.error("Metadata extraction error:", error);
      return NextResponse.json(
        { error: "영상 정보를 가져올 수 없습니다. URL을 확인해주세요." },
        { status: 400 }
      );
    }

    // 3. DB에 저장
    const video = await prisma.video.create({
      data: {
        title: title || metadata.title,
        description: description || "",
        duration: metadata.duration,
        thumbnailUrl: metadata.thumbnailUrl,
        provider: provider.type,
        providerId: metadata.providerId,
        videoUrl: videoUrl,
        embedHtml: metadata.embedHtml || "",
        category: category || [],
        industry: industry || [],
        tags: tags || [],
        hasKoreanAudio: true,
        aiTranslation: false,
        uploadedBy: session.user.id,
        isPublic: isPublic !== undefined ? isPublic : true,
      },
    });

    return NextResponse.json({
      success: true,
      video,
    });

  } catch (error) {
    console.error("Video registration error:", error);
    return NextResponse.json(
      { error: "영상 등록에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 영상 목록 조회 API
 * GET /api/videos
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry");
    const category = searchParams.get("category");
    const provider = searchParams.get("provider");

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {
      OR: [
        { isPublic: true },
        { uploadedBy: session.user.id },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { hasSome: [search] } }, // 태그 배열에 검색어가 포함되어 있는지 확인
          ],
        },
        {
          OR: [
            { isPublic: true },
            { uploadedBy: session.user.id },
          ],
        },
      ];
      // where.OR를 초기화 (AND로 대체했으므로)
      delete where.OR;
    }

    if (industry) {
      where.industry = { has: industry };
    }

    if (category) {
      where.category = { has: category };
    }

    if (provider) {
      where.provider = provider as VideoProviderType;
    }

    // 영상 목록 조회
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.video.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Video list error:", error);
    return NextResponse.json(
      { error: "영상 목록을 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}
