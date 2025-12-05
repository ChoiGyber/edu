import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/payments/cancel-transaction - 카드 거래 취소
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // TODO: Prisma에서 거래 정보 조회
    // const transaction = await prisma.cardTransaction.findUnique({
    //   where: { id: transactionId },
    // });

    // if (!transaction) {
    //   return NextResponse.json(
    //     { error: 'Transaction not found' },
    //     { status: 404 }
    //   );
    // }

    // // 24시간 이내 거래만 취소 가능
    // const transactionDate = new Date(transaction.date);
    // const now = new Date();
    // const hoursSince = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60);

    // if (hoursSince > 24) {
    //   return NextResponse.json(
    //     { error: '거래 후 24시간이 지나 취소할 수 없습니다' },
    //     { status: 400 }
    //   );
    // }

    // if (transaction.status !== 'completed') {
    //   return NextResponse.json(
    //     { error: 'Only completed transactions can be cancelled' },
    //     { status: 400 }
    //   );
    // }

    // TODO: PG사 API 연동하여 거래 취소
    // const cancelResult = await pgService.cancelTransaction({
    //   transactionId: transaction.pgTransactionId,
    // });

    // TODO: Prisma로 거래 상태 업데이트
    // await prisma.cardTransaction.update({
    //   where: { id: transactionId },
    //   data: {
    //     status: 'cancelled',
    //     cancelledAt: new Date(),
    //     cancelledBy: session.user.id,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "카드 거래가 취소되었습니다",
    });
  } catch (error) {
    console.error("Failed to cancel transaction:", error);
    return NextResponse.json(
      { error: "Failed to cancel transaction" },
      { status: 500 }
    );
  }
}
