import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 교육 이력 목록 조회 API
 * GET /api/histories
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {
      // 실행자 본인의 이력만 조회
      executedBy: session.user.id,
    };

    // 날짜 필터
    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) {
        where.completedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.completedAt.lte = new Date(endDate);
      }
    }

    // 교육 과정 필터
    if (courseId) {
      where.courseId = courseId;
    }

    // 검색 (교육명)
    if (search) {
      where.courseTitleSnapshot = {
        contains: search,
        mode: "insensitive",
      };
    }

    // 교육 이력 조회
    const [histories, total] = await Promise.all([
      prisma.educationHistory.findMany({
        where,
        skip,
        take: limit,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              totalDuration: true,
            },
          },
          executor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      }),
      prisma.educationHistory.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      histories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("History list error:", error);
    return NextResponse.json(
      { error: "교육 이력 목록을 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}
