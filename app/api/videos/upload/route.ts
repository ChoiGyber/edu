import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CloudflareProvider } from "@/lib/video-providers/cloudflare-provider";

/**
 * 파일 직접 업로드 API (Cloudflare Stream)
 * POST /api/videos/upload
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

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 필요합니다" },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 2GB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 2GB를 초과할 수 없습니다" },
        { status: 400 }
      );
    }

    // 파일 형식 검증
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. MP4, WebM, MOV 등을 사용하세요." },
        { status: 400 }
      );
    }

    // Cloudflare Stream 업로드
    const provider = new CloudflareProvider();

    try {
      const metadata = await provider.uploadVideo(file);

      return NextResponse.json({
        success: true,
        metadata: {
          ...metadata,
          provider: "CLOUDFLARE",
        },
      });
    } catch (error) {
      console.error("Cloudflare upload error:", error);

      if (error instanceof Error && error.message.includes("인증 정보")) {
        return NextResponse.json(
          { error: "Cloudflare Stream이 설정되지 않았습니다. 관리자에게 문의하세요." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "파일 업로드에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
