import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadSubtitleToR2 } from "@/lib/storage/r2";
import { detectSubtitleFormat, validateSubtitleFile } from "@/lib/subtitles/parser";
import { SubtitleTrack } from "@/types";

/**
 * 자막 파일 업로드 API
 * POST /api/videos/[id]/subtitles
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

    const { id: videoId } = await params;

    // 영상 존재 확인
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "영상을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const language = formData.get("language") as string;
    const label = formData.get("label") as string;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 필요합니다" },
        { status: 400 }
      );
    }

    if (!language || !label) {
      return NextResponse.json(
        { error: "언어 코드와 라벨이 필요합니다" },
        { status: 400 }
      );
    }

    // 파일 읽기
    const content = await file.text();

    // 파일 형식 감지
    const format = detectSubtitleFormat(content);

    if (format === "unknown") {
      return NextResponse.json(
        { error: "지원하지 않는 자막 파일 형식입니다. SRT 또는 VTT 파일을 업로드해주세요." },
        { status: 400 }
      );
    }

    // 파일 검증
    const validation = validateSubtitleFile(content, format);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "자막 파일이 올바르지 않습니다" },
        { status: 400 }
      );
    }

    // R2에 업로드
    const { url } = await uploadSubtitleToR2(file, videoId, language);

    // DB 업데이트
    const existingSubtitles = (video.subtitles as unknown as SubtitleTrack[]) || [];

    // 같은 언어의 기존 자막 제거
    const updatedSubtitles = existingSubtitles.filter(
      (sub) => sub.language !== language
    );

    // 새 자막 추가
    const newSubtitle: SubtitleTrack = {
      language,
      label,
      url,
      format,
      source: "MANUAL",
      createdAt: new Date().toISOString(),
    };

    updatedSubtitles.push(newSubtitle);

    await prisma.video.update({
      where: { id: videoId },
      data: {
        subtitles: updatedSubtitles as any,
      },
    });

    return NextResponse.json({
      success: true,
      subtitle: newSubtitle,
      message: `${label} 자막이 업로드되었습니다 (${validation.cuesCount}개 큐)`,
    });

  } catch (error) {
    console.error("Subtitle upload error:", error);
    return NextResponse.json(
      { error: "자막 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 자막 목록 조회 API
 * GET /api/videos/[id]/subtitles
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
      select: { subtitles: true },
    });

    if (!video) {
      return NextResponse.json(
        { error: "영상을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subtitles: video.subtitles || [],
    });

  } catch (error) {
    console.error("Subtitle fetch error:", error);
    return NextResponse.json(
      { error: "자막 목록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 자막 삭제 API
 * DELETE /api/videos/[id]/subtitles
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
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");

    if (!language) {
      return NextResponse.json(
        { error: "언어 코드가 필요합니다" },
        { status: 400 }
      );
    }

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

    // 자막 제거
    const existingSubtitles = (video.subtitles as unknown as SubtitleTrack[]) || [];
    const updatedSubtitles = existingSubtitles.filter(
      (sub) => sub.language !== language
    );

    await prisma.video.update({
      where: { id: videoId },
      data: {
        subtitles: updatedSubtitles as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "자막이 삭제되었습니다",
    });

  } catch (error) {
    console.error("Subtitle delete error:", error);
    return NextResponse.json(
      { error: "자막 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
