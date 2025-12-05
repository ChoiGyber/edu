import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyQRToken } from "@/lib/qr/qr-token";

/**
 * 증빙 제출 API
 * POST /api/education/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      historyId,
      name,
      nationality,
      language,
      selfieUrl,
      signatureUrl,
      gpsLatitude,
      gpsLongitude,
      completedAt,
      deviceType,
      consentGiven,
    } = body;

    if (!historyId) {
      return NextResponse.json(
        { error: "교육 이력 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 필수 값 확인
    if (!name || !selfieUrl || !signatureUrl || !consentGiven) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 교육 이력 조회
    const history = await prisma.educationHistory.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      return NextResponse.json(
        { error: "교육 세션을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 참석자 정보 생성
    const attendee = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      nationality: nationality || "KO",
      language: language || "ko",
      signatureUrl,
      selfieUrl,
      gpsLatitude: gpsLatitude || null,
      gpsLongitude: gpsLongitude || null,
      completedAt,
      deviceType: deviceType || "MOBILE",
      consentGiven,
      consentAt: new Date().toISOString(),
    };

    // 기존 참석자 목록에 추가
    const currentAttendees = (history.attendees as any[]) || [];
    const updatedAttendees = [...currentAttendees, attendee];

    // 국적별 통계 업데이트
    const byNationality = (history.byNationality as any) || {};
    byNationality[nationality || "KO"] = (byNationality[nationality || "KO"] || 0) + 1;

    // 교육 이력 업데이트
    await prisma.educationHistory.update({
      where: { id: historyId },
      data: {
        attendees: updatedAttendees,
        totalAttendees: updatedAttendees.length,
        byNationality,
      },
    });

    return NextResponse.json({
      success: true,
      message: "증빙이 제출되었습니다",
      attendeeId: attendee.id,
    });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "증빙 제출에 실패했습니다" },
      { status: 500 }
    );
  }
}
