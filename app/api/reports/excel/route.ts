import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

/**
 * Excel 보고서 생성 API
 * POST /api/reports/excel
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { historyIds, startDate, endDate } = body;

    let histories;

    if (historyIds && Array.isArray(historyIds) && historyIds.length > 0) {
      // 특정 이력 ID들로 조회
      histories = await prisma.educationHistory.findMany({
        where: { id: { in: historyIds } },
        include: {
          course: true,
          executor: {
            select: {
              name: true,
              companyName: true,
              siteName: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
      });
    } else if (startDate || endDate) {
      // 날짜 범위로 조회
      const where: any = {
        executedBy: session.user.id,
      };

      if (startDate || endDate) {
        where.completedAt = {};
        if (startDate) where.completedAt.gte = new Date(startDate);
        if (endDate) where.completedAt.lte = new Date(endDate);
      }

      histories = await prisma.educationHistory.findMany({
        where,
        include: {
          course: true,
          executor: {
            select: {
              name: true,
              companyName: true,
              siteName: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { error: "교육 이력 ID 또는 날짜 범위가 필요합니다" },
        { status: 400 }
      );
    }

    if (!histories || histories.length === 0) {
      return NextResponse.json(
        { error: "조회된 교육 이력이 없습니다" },
        { status: 404 }
      );
    }

    // Excel 데이터 준비
    const rows: any[] = [];

    // 헤더 행
    rows.push([
      "교육 일시",
      "회사명",
      "현장명",
      "교육명",
      "총 시간(분)",
      "참석자 수",
      "번호",
      "이름",
      "국적",
      "언어",
      "완료 시간",
      "기기",
      "GPS 위도",
      "GPS 경도",
    ]);

    // 데이터 행
    histories.forEach((history) => {
      const attendees = (history.attendees as any[]) || [];

      if (attendees.length === 0) {
        // 참석자가 없는 경우에도 교육 정보는 표시
        rows.push([
          history.completedAt
            ? new Date(history.completedAt).toLocaleString("ko-KR")
            : "미완료",
          history.executor.companyName || "",
          history.executor.siteName || "",
          history.courseTitleSnapshot,
          Math.floor(history.course.totalDuration / 60),
          0,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
      } else {
        attendees.forEach((attendee, idx) => {
          rows.push([
            idx === 0
              ? history.completedAt
                ? new Date(history.completedAt).toLocaleString("ko-KR")
                : "미완료"
              : "",
            idx === 0 ? history.executor.companyName || "" : "",
            idx === 0 ? history.executor.siteName || "" : "",
            idx === 0 ? history.courseTitleSnapshot : "",
            idx === 0 ? Math.floor(history.course.totalDuration / 60) : "",
            idx === 0 ? attendees.length : "",
            idx + 1,
            attendee.name || "",
            attendee.nationality || "",
            attendee.language || "",
            attendee.completedAt
              ? new Date(attendee.completedAt).toLocaleString("ko-KR")
              : "",
            attendee.deviceType || "",
            attendee.gpsLatitude || "",
            attendee.gpsLongitude || "",
          ]);
        });
      }
    });

    // Excel 워크북 생성
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // 열 너비 설정
    worksheet["!cols"] = [
      { wch: 20 }, // 교육 일시
      { wch: 20 }, // 회사명
      { wch: 15 }, // 현장명
      { wch: 30 }, // 교육명
      { wch: 12 }, // 총 시간
      { wch: 10 }, // 참석자 수
      { wch: 6 }, // 번호
      { wch: 15 }, // 이름
      { wch: 10 }, // 국적
      { wch: 10 }, // 언어
      { wch: 20 }, // 완료 시간
      { wch: 10 }, // 기기
      { wch: 12 }, // GPS 위도
      { wch: 12 }, // GPS 경도
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "교육 이력");

    // Excel 파일을 Buffer로 변환
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // 파일명 생성
    const fileName = `education-report-${new Date().toISOString().split("T")[0]}.xlsx`;

    // Excel 파일을 응답으로 반환
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Excel generation error:", error);
    return NextResponse.json(
      { error: "Excel 보고서 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
