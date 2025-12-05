import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateSubtitles, translateToMultipleLanguages } from "@/lib/ai/translate";
import { uploadSubtitleToR2 } from "@/lib/storage/r2";
import { SubtitleTrack } from "@/types";
import { parseSRT } from "@/lib/subtitles/parser";

/**
 * AI 자막 번역 API
 * POST /api/videos/[id]/ai-subtitles
 *
 * Body:
 * - sourceLanguage: 원본 자막 언어 (예: "ko")
 * - targetLanguages: 목표 언어 배열 (예: ["en", "vi", "zh"])
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

    const body = await request.json();
    const { sourceLanguage, targetLanguages } = body;

    if (!sourceLanguage || !targetLanguages || !Array.isArray(targetLanguages)) {
      return NextResponse.json(
        { error: "sourceLanguage와 targetLanguages가 필요합니다" },
        { status: 400 }
      );
    }

    // 원본 자막 찾기
    const existingSubtitles = (video.subtitles as unknown as SubtitleTrack[]) || [];
    const sourceSubtitle = existingSubtitles.find(
      (sub) => sub.language === sourceLanguage
    );

    if (!sourceSubtitle) {
      return NextResponse.json(
        { error: `${sourceLanguage} 자막이 없습니다. 먼저 원본 자막을 업로드해주세요.` },
        { status: 400 }
      );
    }

    // 원본 자막 다운로드
    const sourceResponse = await fetch(sourceSubtitle.url);
    if (!sourceResponse.ok) {
      return NextResponse.json(
        { error: "원본 자막을 가져올 수 없습니다" },
        { status: 500 }
      );
    }

    const sourceSRT = await sourceResponse.text();

    // 자막 검증
    try {
      const cues = parseSRT(sourceSRT);
      if (cues.length === 0) {
        return NextResponse.json(
          { error: "원본 자막이 유효하지 않습니다" },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "원본 자막 파싱 실패" },
        { status: 400 }
      );
    }

    // AI 번역 실행
    const translatedSubtitles: Record<string, string> = {};
    const errors: string[] = [];

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) {
        continue; // 같은 언어는 건너뛰기
      }

      try {
        console.log(`Translating to ${targetLang}...`);
        const translated = await translateSubtitles(
          sourceSRT,
          sourceLanguage,
          targetLang
        );
        translatedSubtitles[targetLang] = translated;
      } catch (error) {
        console.error(`Translation failed for ${targetLang}:`, error);
        errors.push(targetLang);
      }
    }

    // R2에 업로드 및 DB 업데이트
    const updatedSubtitles = [...existingSubtitles];
    const successLanguages: string[] = [];

    for (const [lang, content] of Object.entries(translatedSubtitles)) {
      try {
        // R2에 업로드
        const blob = new Blob([content], { type: "text/plain" });
        const file = new File([blob], `${lang}.srt`, { type: "text/plain" });
        const { url } = await uploadSubtitleToR2(file, videoId, lang);

        // 언어 이름 매핑
        const languageNames: Record<string, string> = {
          en: "English",
          vi: "Tiếng Việt",
          zh: "中文",
          th: "ไทย",
          ja: "日本語",
          es: "Español",
          fr: "Français",
          de: "Deutsch",
        };

        // 기존 자막 제거 (중복 방지)
        const filtered = updatedSubtitles.filter((sub) => sub.language !== lang);

        // 새 자막 추가
        const newSubtitle: SubtitleTrack = {
          language: lang,
          label: languageNames[lang] || lang,
          url,
          format: "srt",
          source: "AI",
          createdAt: new Date().toISOString(),
        };

        filtered.push(newSubtitle);
        updatedSubtitles.length = 0;
        updatedSubtitles.push(...filtered);

        successLanguages.push(lang);
      } catch (error) {
        console.error(`Failed to upload ${lang} subtitle:`, error);
        errors.push(lang);
      }
    }

    // DB 업데이트
    await prisma.video.update({
      where: { id: videoId },
      data: {
        subtitles: updatedSubtitles as any,
        aiTranslation: true, // AI 번역 사용 플래그
      },
    });

    // 결과 반환
    const message = successLanguages.length > 0
      ? `${successLanguages.length}개 언어로 자막이 번역되었습니다 (${successLanguages.join(", ")})`
      : "자막 번역에 실패했습니다";

    return NextResponse.json({
      success: successLanguages.length > 0,
      message,
      successLanguages,
      failedLanguages: errors,
      totalRequested: targetLanguages.length,
      totalSuccess: successLanguages.length,
    });

  } catch (error) {
    console.error("AI subtitle generation error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "AI 자막 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
