import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 시스템 옵션 조회 API
 * GET /api/settings/system-options
 */
export async function GET(request: NextRequest) {
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

    // QR 토큰 만료 시간 설정 조회
    const qrTokenExpirySetting = await prisma.systemSetting.findUnique({
      where: { key: "qr_token_expiry_minutes" },
    });

    const qrTokenExpiryMinutes = qrTokenExpirySetting
      ? parseInt(String(qrTokenExpirySetting.value))
      : 30; // 기본값 30분

    // 기본 교육 언어 설정
    const defaultLanguageSetting = await prisma.systemSetting.findUnique({
      where: { key: "default_education_language" },
    });

    const defaultLanguage = defaultLanguageSetting
      ? String(defaultLanguageSetting.value)
      : "ko";

    // 자동 PDF 생성 설정
    const autoPdfGenerationSetting = await prisma.systemSetting.findUnique({
      where: { key: "auto_pdf_generation" },
    });

    const autoPdfGeneration = autoPdfGenerationSetting
      ? String(autoPdfGenerationSetting.value) === "true"
      : true;

    return NextResponse.json({
      success: true,
      options: {
        qrTokenExpiryMinutes,
        defaultLanguage,
        autoPdfGeneration,
      },
    });
  } catch (error) {
    console.error("Get system options error:", error);
    return NextResponse.json(
      { error: "시스템 옵션 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 시스템 옵션 업데이트 API
 * PUT /api/settings/system-options
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
    const { qrTokenExpiryMinutes, defaultLanguage, autoPdfGeneration } = body;

    // QR 토큰 만료 시간 업데이트
    if (qrTokenExpiryMinutes !== undefined) {
      const minutes = parseInt(String(qrTokenExpiryMinutes));
      if (minutes < 5 || minutes > 120) {
        return NextResponse.json(
          { error: "QR 토큰 만료 시간은 5~120분 사이여야 합니다" },
          { status: 400 }
        );
      }

      await prisma.systemSetting.upsert({
        where: { key: "qr_token_expiry_minutes" },
        create: {
          key: "qr_token_expiry_minutes",
          value: minutes,
        },
        update: {
          value: minutes,
        },
      });
    }

    // 기본 교육 언어 업데이트
    if (defaultLanguage !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "default_education_language" },
        create: {
          key: "default_education_language",
          value: defaultLanguage,
        },
        update: {
          value: defaultLanguage,
        },
      });
    }

    // 자동 PDF 생성 설정 업데이트
    if (autoPdfGeneration !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: "auto_pdf_generation" },
        create: {
          key: "auto_pdf_generation",
          value: autoPdfGeneration ? "true" : "false",
        },
        update: {
          value: autoPdfGeneration ? "true" : "false",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "시스템 옵션이 업데이트되었습니다",
    });
  } catch (error) {
    console.error("Update system options error:", error);
    return NextResponse.json(
      { error: "시스템 옵션 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}
