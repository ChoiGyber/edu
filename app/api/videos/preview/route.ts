import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProviderFromUrl } from "@/lib/video-providers";

/**
 * 영상 메타데이터 미리보기 API
 * POST /api/videos/preview
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
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: "영상 URL이 필요합니다" },
        { status: 400 }
      );
    }

    // Provider 감지 및 검증
    const provider = getProviderFromUrl(videoUrl);

    if (!provider) {
      return NextResponse.json(
        { error: "지원하지 않는 영상 URL입니다" },
        { status: 400 }
      );
    }

    // 메타데이터 추출
    try {
      const metadata = await provider.extractMetadata(videoUrl);

      return NextResponse.json({
        success: true,
        metadata: {
          ...metadata,
          provider: provider.type,
        },
      });
    } catch (error) {
      console.error("Metadata extraction error:", error);
      return NextResponse.json(
        { error: "영상 정보를 가져올 수 없습니다. URL을 확인해주세요." },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: "미리보기에 실패했습니다" },
      { status: 500 }
    );
  }
}
