import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 월별 통계 조회 API
 * GET /api/statistics?year=2024&month=11
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || String(new Date().getFullYear())
    );
    const month = parseInt(
      searchParams.get("month") || String(new Date().getMonth() + 1)
    );

    // 월 시작일, 종료일 계산
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 해당 월의 모든 교육 이력 조회
    const histories = await prisma.educationHistory.findMany({
      where: {
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        executor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // 통계 집계
    const stats = {
      totalSessions: histories.length,
      totalAttendees: 0,
      byNationality: {} as Record<string, number>,
      byCourse: {} as Record<string, { count: number; attendees: number }>,
      byExecutor: {} as Record<string, { name: string; count: number }>,
      dailyTrend: {} as Record<string, number>,
    };

    histories.forEach((history) => {
      // 총 참석자 수
      stats.totalAttendees += history.totalAttendees;

      // 국적별 통계
      const byNat = (history.byNationality as Record<string, number>) || {};
      Object.entries(byNat).forEach(([nat, count]) => {
        stats.byNationality[nat] = (stats.byNationality[nat] || 0) + count;
      });

      // 교육 과정별 통계
      const courseTitle = history.courseTitleSnapshot;
      if (!stats.byCourse[courseTitle]) {
        stats.byCourse[courseTitle] = { count: 0, attendees: 0 };
      }
      stats.byCourse[courseTitle].count += 1;
      stats.byCourse[courseTitle].attendees += history.totalAttendees;

      // 실행자별 통계
      const executorId = history.executor.id;
      if (!stats.byExecutor[executorId]) {
        stats.byExecutor[executorId] = {
          name: history.executor.name,
          count: 0,
        };
      }
      stats.byExecutor[executorId].count += 1;

      // 일별 추세
      if (history.completedAt) {
        const dateKey = new Date(history.completedAt)
          .toISOString()
          .split("T")[0];
        stats.dailyTrend[dateKey] = (stats.dailyTrend[dateKey] || 0) + 1;
      }
    });

    // 인기 교육 TOP 5
    const popularCourses = Object.entries(stats.byCourse)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([title, data]) => ({
        title,
        count: data.count,
        attendees: data.attendees,
      }));

    // 활동적인 실행자 TOP 5
    const activeExecutors = Object.entries(stats.byExecutor)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
      }));

    return NextResponse.json({
      success: true,
      period: {
        year,
        month,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalSessions: stats.totalSessions,
        totalAttendees: stats.totalAttendees,
        avgAttendeesPerSession:
          stats.totalSessions > 0
            ? Math.round(stats.totalAttendees / stats.totalSessions)
            : 0,
      },
      byNationality: stats.byNationality,
      popularCourses,
      activeExecutors,
      dailyTrend: stats.dailyTrend,
    });
  } catch (error) {
    console.error("Statistics error:", error);
    return NextResponse.json(
      { error: "통계를 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}
