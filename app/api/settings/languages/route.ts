import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_LANGUAGES, Language } from '@/lib/languages/language-config';

/**
 * 언어 설정 조회 API
 * GET /api/settings/languages
 */
export async function GET(request: NextRequest) {
  try {
    // 언어 설정은 public (인증 불필요)
    // 시스템 설정에서 languages 조회
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'supported_languages' },
    });

    let languages: Language[];

    if (setting && setting.value) {
      // DB에 저장된 언어 설정 사용
      languages = setting.value as unknown as Language[];
    } else {
      // 기본 언어 사용
      languages = DEFAULT_LANGUAGES;
    }

    return NextResponse.json({
      success: true,
      languages,
    });
  } catch (error) {
    console.error('Language settings error:', error);
    // 오류 발생 시에도 기본 언어 반환
    return NextResponse.json({
      success: true,
      languages: DEFAULT_LANGUAGES,
    });
  }
}

/**
 * 언어 설정 업데이트 API
 * PUT /api/settings/languages
 * (관리자 전용)
 */
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { languages } = body;

    if (!Array.isArray(languages)) {
      return NextResponse.json(
        { error: '잘못된 언어 데이터입니다' },
        { status: 400 }
      );
    }

    // 언어 설정 저장/업데이트
    const setting = await prisma.systemSetting.upsert({
      where: { key: 'supported_languages' },
      create: {
        key: 'supported_languages',
        value: languages,
      },
      update: {
        value: languages,
      },
    });

    return NextResponse.json({
      success: true,
      message: '언어 설정이 업데이트되었습니다',
      languages: setting.value,
    });
  } catch (error) {
    console.error('Language settings update error:', error);
    return NextResponse.json(
      { error: '언어 설정 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}
