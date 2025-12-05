import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { CertificateTemplate } from "@/lib/pdf/certificate-template";
import QRCode from "qrcode";
import { r2Client } from "@/lib/storage/r2-client";

/**
 * PDF 생성 API
 * POST /api/pdf/generate
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
    const { historyId } = body;

    if (!historyId) {
      return NextResponse.json(
        { error: "교육 이력 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 교육 이력 조회
    const history = await prisma.educationHistory.findUnique({
      where: { id: historyId },
      include: {
        course: true,
        executor: {
          select: {
            name: true,
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

    // 권한 확인 (실행자만 PDF 생성 가능)
    if (history.executedBy !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
    }

    // 이미 PDF가 생성되어 있으면 반환
    if (history.certificateUrl) {
      return NextResponse.json({
        success: true,
        url: history.certificateUrl,
        message: "이미 생성된 PDF입니다",
      });
    }

    // QR 코드 생성 (문서 검증용)
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${historyId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
    });

    // PDF 데이터 준비
    const attendees = history.attendees as any[];
    const screenshots = history.screenshots || [];

    const pdfData = {
      companyName: history.executor.companyName || "미지정",
      siteName: history.executor.siteName || undefined,
      educationTitle: history.courseTitleSnapshot,
      educationDate: history.startedAt.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      totalDuration: history.course.totalDuration,
      attendees,
      screenshots,
      qrCode: qrCodeDataUrl,
    };

    // PDF 렌더링
    const pdfStream = await renderToStream(
      CertificateTemplate(pdfData) as any
    );

    // Stream을 Buffer로 변환
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Cloudflare R2에 PDF 업로드
    const fileName = `certificate-${historyId}.pdf`;
    const key = r2Client.generateKey("certificates", "pdf");

    let certificateUrl: string;

    try {
      const uploadResult = await r2Client.upload({
        key,
        body: pdfBuffer,
        contentType: "application/pdf",
        metadata: {
          historyId,
          fileName,
          generatedAt: new Date().toISOString(),
        },
      });

      certificateUrl = uploadResult.url;
    } catch (r2Error) {
      console.warn("R2 upload failed, using fallback storage:", r2Error);
      // R2 업로드 실패 시 로컬 저장 또는 다른 방법 사용
      certificateUrl = `/api/pdf/download/${historyId}`;
    }

    // DB 업데이트
    await prisma.educationHistory.update({
      where: { id: historyId },
      data: {
        certificateUrl,
        completedAt: new Date(), // PDF 생성 시점을 완료 시점으로 설정
      },
    });

    // PDF를 응답으로 반환 (다운로드)
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
