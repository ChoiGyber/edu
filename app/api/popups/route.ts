import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 팝업 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = {};

    if (activeOnly) {
      const now = new Date();
      where.isActive = true;
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }

    const popups = await prisma.popup.findMany({
      where,
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(popups);
  } catch (error: any) {
    console.error("Error fetching popups:", error);
    return NextResponse.json(
      { error: "팝업 목록을 불러오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST - 팝업 생성
export async function POST(request: NextRequest) {
  try {
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

    // 필수 필드 검증
    if (!title || !content || !startDate || !endDate) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요" },
        { status: 400 }
      );
    }

    // 날짜 검증
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { error: "종료일은 시작일보다 이후여야 합니다" },
        { status: 400 }
      );
    }

    const popup = await prisma.popup.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        positionX: positionX || 100,
        positionY: positionY || 100,
        width: width || 400,
        height: height || 300,
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
    });

    return NextResponse.json(popup);
  } catch (error: any) {
    console.error("Error creating popup:", error);
    return NextResponse.json(
      { error: "팝업 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
