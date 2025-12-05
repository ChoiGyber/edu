import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRToken, generateQRUrl } from "@/lib/qr/qr-token";

/**
 * 교육 완료 API
 * POST /api/education/complete
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
    const { sessionId, qrTokenExpiry } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "세션 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 교육 이력 조회
    const history = await prisma.educationHistory.findUnique({
      where: { id: sessionId },
    });

    if (!history) {
      return NextResponse.json(
        { error: "교육 세션을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 실행자 확인
    if (history.executedBy !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    // 교육 완료 처리
    await prisma.educationHistory.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
      },
    });

    // 증빙 수집용 QR 토큰 생성
    const verifyToken = generateQRToken(
      {
        sessionId,
        courseId: history.courseId,
        type: "VERIFY",
      },
      qrTokenExpiry || 30
    );

    const verifyUrl = generateQRUrl(verifyToken, "VERIFY");

    return NextResponse.json({
      success: true,
      verifyToken,
      verifyUrl,
      message: "교육이 완료되었습니다. 증빙 수집 QR 코드를 표시하세요.",
    });

  } catch (error) {
    console.error("Education complete error:", error);
    return NextResponse.json(
      { error: "교육 완료 처리에 실패했습니다" },
      { status: 500 }
    );
  }
}
