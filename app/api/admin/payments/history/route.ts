import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/payments/history - 전체 사용자 결제 내역 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    // TODO: Prisma에서 전체 결제 내역 조회
    // let whereClause: any = {};

    // if (status !== 'all') {
    //   whereClause.status = status;
    // }

    // if (search) {
    //   whereClause.OR = [
    //     { user: { name: { contains: search, mode: 'insensitive' } } },
    //     { user: { email: { contains: search, mode: 'insensitive' } } },
    //   ];
    // }

    // const payments = await prisma.payment.findMany({
    //   where: whereClause,
    //   include: {
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //       },
    //     },
    //   },
    //   orderBy: { date: 'desc' },
    //   take: limit,
    //   skip: offset,
    // });

    // const total = await prisma.payment.count({ where: whereClause });

    // Mock data for now
    const payments = [
      {
        id: "1",
        userId: "user1",
        userName: "김철수",
        userEmail: "kim@example.com",
        planType: "회사 계정",
        amount: 990000,
        date: "2025-01-18",
        status: "completed",
        method: "신용카드",
        cardLast4: "1234",
      },
      {
        id: "2",
        userId: "user2",
        userName: "이영희",
        userEmail: "lee@example.com",
        planType: "개인 계정",
        amount: 9900,
        date: "2025-01-17",
        status: "completed",
        method: "신용카드",
        cardLast4: "5678",
      },
      {
        id: "3",
        userId: "user3",
        userName: "박민수",
        userEmail: "park@example.com",
        planType: "회사 계정",
        amount: 990000,
        date: "2025-01-16",
        status: "refunded",
        method: "신용카드",
        cardLast4: "9012",
      },
    ];

    return NextResponse.json({
      success: true,
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Failed to fetch all payment history:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
