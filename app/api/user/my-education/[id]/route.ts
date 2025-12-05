import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 나의안전교육에서 제거 API
 * DELETE /api/user/my-education/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "항목 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // TODO: Prisma로 삭제
    // const savedItem = await prisma.savedEducation.findUnique({
    //   where: { id },
    // });

    // if (!savedItem) {
    //   return NextResponse.json(
    //     { error: "저장된 교육을 찾을 수 없습니다" },
    //     { status: 404 }
    //   );
    // }

    // // 본인이 저장한 항목인지 확인
    // if (savedItem.userId !== session.user.id) {
    //   return NextResponse.json(
    //     { error: "권한이 없습니다" },
    //     { status: 403 }
    //   );
    // }

    // await prisma.savedEducation.delete({
    //   where: { id },
    // });

    return NextResponse.json({
      success: true,
      message: "나의안전교육에서 제거되었습니다",
    });
  } catch (error) {
    console.error("Remove saved education error:", error);
    return NextResponse.json(
      { error: "제거에 실패했습니다" },
      { status: 500 }
    );
  }
}
