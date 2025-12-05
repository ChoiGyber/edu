import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 팝업 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const popup = await prisma.popup.findUnique({
      where: { id },
    });

    if (!popup) {
      return NextResponse.json(
        { error: "팝업을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(popup);
  } catch (error: any) {
    console.error("Error fetching popup:", error);
    return NextResponse.json(
      { error: "팝업 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// PUT - 팝업 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      imageUrl,
      positionX,
      positionY,
      width,
      height,
      startDate,
      endDate,
      isActive,
      order,
    } = body;

    // 날짜 검증
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        return NextResponse.json(
          { error: "종료일은 시작일보다 이후여야 합니다" },
          { status: 400 }
        );
      }
    }

    const popup = await prisma.popup.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
        positionX,
        positionY,
        width,
        height,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        order,
      },
    });

    return NextResponse.json(popup);
  } catch (error: any) {
    console.error("Error updating popup:", error);
    return NextResponse.json(
      { error: "팝업 수정 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE - 팝업 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.popup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting popup:", error);
    return NextResponse.json(
      { error: "팝업 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
