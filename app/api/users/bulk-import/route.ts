import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";

interface ImportRow {
  email: string;
  name: string;
  phone?: string;
  companyName?: string;
  siteName?: string;
  industry?: string;
  role?: string;
  password?: string;
}

/**
 * Excel 회원 일괄 등록 API
 * POST /api/users/bulk-import
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 권한 확인 (ADMIN만 가능)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자만 접근 가능합니다" },
        { status: 403 }
      );
    }

    // FormData에서 파일 가져오기
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "파일을 업로드해주세요" },
        { status: 400 }
      );
    }

    // Excel 파일 읽기
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ImportRow[] = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "파일에 데이터가 없습니다" },
        { status: 400 }
      );
    }

    // 결과 추적
    const results = {
      success: [] as string[],
      failed: [] as { email: string; reason: string }[],
    };

    // 각 행 처리
    for (const row of data) {
      try {
        // 필수 값 확인
        if (!row.email || !row.name) {
          results.failed.push({
            email: row.email || "unknown",
            reason: "이메일과 이름은 필수입니다",
          });
          continue;
        }

        // 이메일 중복 확인
        const existingUser = await prisma.user.findUnique({
          where: { email: row.email },
        });

        if (existingUser) {
          results.failed.push({
            email: row.email,
            reason: "이미 등록된 이메일입니다",
          });
          continue;
        }

        // 비밀번호 해싱
        let passwordHash = null;
        if (row.password) {
          passwordHash = await bcrypt.hash(row.password, 12);
        } else {
          // 기본 비밀번호 생성 (이메일 앞부분 + 1234)
          const defaultPassword = row.email.split("@")[0] + "1234";
          passwordHash = await bcrypt.hash(defaultPassword, 12);
        }

        // 회원 생성
        await prisma.user.create({
          data: {
            email: row.email,
            name: row.name,
            phone: row.phone || null,
            companyName: row.companyName || currentUser.companyName,
            siteName: row.siteName || null,
            industry: (row.industry as any) || null,
            role: (row.role as any) || "USER",
            passwordHash,
            preferredLanguages: ["ko"],
            isActive: true,
          },
        });

        results.success.push(row.email);
      } catch (error) {
        console.error(`Failed to import ${row.email}:`, error);
        results.failed.push({
          email: row.email,
          reason: "서버 오류",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.success.length}명 등록 완료, ${results.failed.length}명 실패`,
      results,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "일괄 등록에 실패했습니다" },
      { status: 500 }
    );
  }
}
