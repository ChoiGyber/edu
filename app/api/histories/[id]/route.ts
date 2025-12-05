import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 교육 이력 상세 조회 API
 * GET /api/histories/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const history = await prisma.educationHistory.findUnique({
      where: { id: (await params).id },
      include: {
        course: true,
        executor: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            siteName: true,
          },
        },
      },
    });

    if (!history) {
      return NextResponse.json(
        { error: "교육 이력을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 권한 확인
    if (history.executedBy !== session.user.id) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      history,
    });

  } catch (error) {
    console.error("History detail error:", error);
    return NextResponse.json(
      { error: "교육 이력을 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}
