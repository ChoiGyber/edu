import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();

    // 사용자 수 확인
    const userCount = await prisma.user.count();

    // admin 계정 확인
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@safety-edu.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    });

    return NextResponse.json({
      status: "success",
      database: "connected",
      userCount,
      adminExists: !!adminUser,
      adminUser: adminUser
        ? {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            hasPassword: !!adminUser.passwordHash,
          }
        : null,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        error: String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
