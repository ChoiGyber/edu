import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/payments/history - 사용자 결제 내역 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // TODO: Prisma에서 결제 내역 조회
    // const payments = await prisma.payment.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { date: 'desc' },
    //   take: limit,
    //   skip: offset,
    // });

    // Mock data for now
    const payments = [
      {
        id: "1",
        date: "2025-01-18",
        description: "회사 계정 - 연간 구독",
        amount: 990000,
        status: "completed",
        method: "신용카드",
        cardLast4: "1234",
        receiptUrl: "/receipts/2025-01-18.pdf",
      },
      {
        id: "2",
        date: "2024-12-18",
        description: "회사 계정 - 연간 구독",
        amount: 990000,
        status: "completed",
        method: "신용카드",
        cardLast4: "1234",
        receiptUrl: "/receipts/2024-12-18.pdf",
      },
    ];

    return NextResponse.json({
      success: true,
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Failed to fetch payment history:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
