import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 교육 과정 생성 API
 * POST /api/courses
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
    const {
      title,
      description,
      nodes,
      edges,
      totalDuration,
      thumbnail,
      isPublic,
    } = body;

    if (!title || !nodes || !edges) {
      return NextResponse.json(
        { error: "제목과 노드 정보가 필요합니다" },
        { status: 400 }
      );
    }

    // 교육 과정 생성
    const course = await prisma.educationCourse.create({
      data: {
        title,
        description: description || "",
        thumbnail: thumbnail || null,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        totalDuration: totalDuration || 0,
        ownerId: session.user.id,
        isPublic: isPublic !== undefined ? isPublic : false,
      },
    });

    return NextResponse.json({
      success: true,
      course,
    });

  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { error: "교육 과정 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 교육 과정 목록 조회 API
 * GET /api/courses
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
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {
      OR: [
        { isPublic: true },
        { ownerId: session.user.id },
        { sharedWith: { has: session.user.id } },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    // 교육 과정 목록 조회
    const [courses, total] = await Promise.all([
      prisma.educationCourse.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.educationCourse.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Course list error:", error);
    return NextResponse.json(
      { error: "교육 과정 목록을 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}
