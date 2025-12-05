import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/payments/methods - 사용자 결제 수단 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Prisma에서 결제 수단 조회
    // const methods = await prisma.paymentMethod.findMany({
    //   where: { userId: session.user.id },
    // });

    // Mock data for now
    const methods = [
      {
        id: "1",
        type: "card",
        cardNumber: "•••• 1234",
        expiryDate: "12/2026",
        cardBrand: "VISA",
        isDefault: true,
      },
    ];

    return NextResponse.json({
      success: true,
      methods,
    });
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST /api/payments/methods - 새 결제 수단 추가
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, cardToken, bankToken } = await request.json();

    if (!["card", "bank"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid payment method type" },
        { status: 400 }
      );
    }

    // TODO: PG사 API 연동 (예: PortOne, Toss Payments)
    // 1. 카드/계좌 토큰을 PG사에 전송하여 등록
    // 2. 등록된 결제 수단 정보를 Prisma에 저장

    // TODO: Prisma에 결제 수단 저장
    // const newMethod = await prisma.paymentMethod.create({
    //   data: {
    //     userId: session.user.id,
    //     type,
    //     // PG사에서 받은 정보 저장
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "결제 수단이 추가되었습니다",
    });
  } catch (error) {
    console.error("Failed to add payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}
