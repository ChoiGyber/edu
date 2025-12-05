import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/payments/refund - 환불 처리
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

    const { paymentId, reason } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // TODO: Prisma에서 결제 정보 조회
    // const payment = await prisma.payment.findUnique({
    //   where: { id: paymentId },
    // });

    // if (!payment) {
    //   return NextResponse.json(
    //     { error: 'Payment not found' },
    //     { status: 404 }
    //   );
    // }

    // if (payment.status !== 'completed') {
    //   return NextResponse.json(
    //     { error: 'Only completed payments can be refunded' },
    //     { status: 400 }
    //   );
    // }

    // TODO: PG사 API 연동하여 환불 처리
    // const refundResult = await pgService.refund({
    //   transactionId: payment.pgTransactionId,
    //   amount: payment.amount,
    //   reason,
    // });

    // TODO: Prisma로 결제 상태 업데이트
    // await prisma.payment.update({
    //   where: { id: paymentId },
    //   data: {
    //     status: 'refunded',
    //     refundedAt: new Date(),
    //     refundReason: reason,
    //   },
    // });

    // TODO: 환불 내역 기록
    // await prisma.refund.create({
    //   data: {
    //     paymentId,
    //     amount: payment.amount,
    //     reason,
    //     processedBy: session.user.id,
    //     processedAt: new Date(),
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "환불이 처리되었습니다",
    });
  } catch (error) {
    console.error("Failed to process refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
