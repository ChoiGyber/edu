import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllSettings,
  getSetting,
  setSetting,
  setSettings,
  checkRequiredSettings,
} from "@/lib/settings/settings-manager";
import { SettingKey, SETTING_CATEGORIES } from "@/types/system-settings";
import { prisma } from "@/lib/prisma";

/**
 * 설정 조회 API
 * GET /api/settings
 * GET /api/settings?key=GOOGLE_CLIENT_ID
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

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      // 단일 설정 조회
      const value = await getSetting(key as SettingKey);

      return NextResponse.json({
        success: true,
        key,
        value,
        hasValue: value !== null && value !== '',
      });
    } else {
      // 전체 설정 조회 (보안상 실제 값은 반환하지 않고 존재 여부만)
      const settings = await getAllSettings();
      const requiredCheck = await checkRequiredSettings();

      return NextResponse.json({
        success: true,
        settings,
        categories: SETTING_CATEGORIES,
        requiredCheck,
      });
    }
  } catch (error) {
    console.error("Settings get error:", error);
    return NextResponse.json(
      { error: "설정을 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 설정 저장 API
 * POST /api/settings
 * Body: { key: string, value: string, encrypted: boolean } 또는
 *       { settings: Array<{ key, value, encrypted }> }
 */
export async function POST(request: NextRequest) {
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

    // 여러 설정 한번에 저장
    if (body.settings && Array.isArray(body.settings)) {
      await setSettings(
        body.settings.map((s: any) => ({
          key: s.key as SettingKey,
          value: s.value,
          encrypted: s.encrypted || false,
        }))
      );

      return NextResponse.json({
        success: true,
        message: `${body.settings.length}개의 설정이 저장되었습니다`,
      });
    }

    // 단일 설정 저장
    const { key, value, encrypted } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: "설정 키와 값이 필요합니다" },
        { status: 400 }
      );
    }

    // SettingKey enum 검증
    if (!Object.values(SettingKey).includes(key)) {
      return NextResponse.json(
        { error: "유효하지 않은 설정 키입니다" },
        { status: 400 }
      );
    }

    await setSetting(key as SettingKey, value, encrypted || false);

    return NextResponse.json({
      success: true,
      message: "설정이 저장되었습니다",
      key,
    });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json(
      { error: "설정 저장에 실패했습니다" },
      { status: 500 }
    );
  }
}
