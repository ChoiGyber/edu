import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 분석 데이터 조회 API
 * GET /api/analytics?period=month
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
    const period = searchParams.get("period") || "month";

    // 기간 설정
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // 1. 총계
    const [totalUsers, totalVideos, totalCourses, completedEducations] =
      await Promise.all([
        prisma.user.count({
          where: { role: { not: "WITHDRAWN" } },
        }),
        prisma.video.count(),
        prisma.educationCourse.count(),
        prisma.educationHistory.findMany({
          where: {
            completedAt: {
              gte: startDate,
              lte: now,
            },
          },
        }),
      ]);

    const totalEducations = completedEducations.length;
    const totalAttendees = completedEducations.reduce(
      (sum, edu) => sum + edu.totalAttendees,
      0
    );

    // 2. 최근 교육 현황 (상위 5개)
    const recentEducations = await prisma.educationHistory.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        courseTitleSnapshot: true,
        totalAttendees: true,
        completedAt: true,
      },
    });

    // 3. 인기 영상 (상위 5개)
    const popularVideos = await prisma.video.findMany({
      orderBy: [{ usedInCourses: "desc" }, { viewCount: "desc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        viewCount: true,
        usedInCourses: true,
      },
    });

    // 4. 국적별 분포
    const byNationality: Record<string, number> = {};
    completedEducations.forEach((edu) => {
      const attendees = edu.attendees as any[];
      attendees.forEach((attendee: any) => {
        const nat = attendee.nationality || "KO";
        byNationality[nat] = (byNationality[nat] || 0) + 1;
      });
    });

    // 5. 업종별 분포
    const usersByIndustry = await prisma.user.groupBy({
      by: ["industry"],
      _count: {
        id: true,
      },
      where: {
        industry: { not: null },
      },
    });

    const byIndustry: Record<string, number> = {};
    usersByIndustry.forEach((item) => {
      if (item.industry) {
        byIndustry[item.industry] = item._count.id;
      }
    });

    // 6. 월별 통계 (최근 6개월)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59
      );

      const monthEducations = await prisma.educationHistory.findMany({
        where: {
          completedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyStats.push({
        month: `${monthStart.getFullYear()}-${String(
          monthStart.getMonth() + 1
        ).padStart(2, "0")}`,
        educations: monthEducations.length,
        attendees: monthEducations.reduce(
          (sum, edu) => sum + edu.totalAttendees,
          0
        ),
      });
    }

    return NextResponse.json({
      totalUsers,
      totalVideos,
      totalCourses,
      totalEducations,
      totalAttendees,
      recentEducations: recentEducations.map((edu) => ({
        id: edu.id,
        title: edu.courseTitleSnapshot,
        attendees: edu.totalAttendees,
        completedAt: edu.completedAt,
      })),
      popularVideos,
      byNationality,
      byIndustry,
      monthlyStats,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "분석 데이터를 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}
