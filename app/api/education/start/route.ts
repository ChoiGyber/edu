import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRToken, generateQRCodeImage } from "@/lib/qr/generate-qr-token";

/**
 * 교육 시작 API
 * POST /api/education/start
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
    const { courseId, language, qrTokenExpiry } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "교육 과정 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 교육 과정 조회
    const course = await prisma.educationCourse.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "교육 과정을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 교육 이력 생성
    const history = await prisma.educationHistory.create({
      data: {
        courseId,
        courseTitleSnapshot: course.title,
        startedAt: new Date(),
        totalAttendees: 0,
        attendees: [],
        byNationality: {},
        qrTokenExpiry: qrTokenExpiry || 30,
        executedBy: session.user.id,
      },
    });

    // 세션 ID 생성
    const sessionId = `session-${history.id}-${Date.now()}`;

    // QR 토큰 및 URL 생성 (외국어 선택 시에만 필요)
    let qrData = null;
    if (language && language !== 'ko') {
      const token = await generateQRToken({
        sessionId,
        courseId,
        historyId: history.id,
        language,
        type: 'MOBILE_LEARN',
      }, qrTokenExpiry || 30);

      const mobileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/mobile/learn?token=${token}`;
      const qrCodeUrl = await generateQRCodeImage(mobileUrl);

      qrData = {
        token,
        qrCodeUrl,
        mobileUrl,
      };
    }

    return NextResponse.json({
      success: true,
      historyId: history.id,
      sessionId,
      qrData,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        nodes: course.nodes,
        edges: course.edges,
        totalDuration: course.totalDuration,
      },
    });

  } catch (error) {
    console.error("Education start error:", error);
    return NextResponse.json(
      { error: "교육 시작에 실패했습니다" },
      { status: 500 }
    );
  }
}
