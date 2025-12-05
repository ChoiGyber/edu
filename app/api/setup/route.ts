import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 보안을 위한 초기 설정 토큰 (환경 변수로 설정)
const SETUP_TOKEN = process.env.SETUP_TOKEN || "setup-token-change-this";

export async function POST(request: Request) {
  try {
    // 보안 토큰 확인
    const { token } = await request.json();

    if (token !== SETUP_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 이미 admin 계정이 있는지 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@safety-edu.com" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        status: "already_exists",
        message: "Admin account already exists",
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
        },
      });
    }

    // 관리자 계정 생성
    const passwordHash = await bcrypt.hash("admin", 12);

    const admin = await prisma.user.create({
      data: {
        email: "admin@safety-edu.com",
        name: "시스템 관리자",
        phone: "010-0000-0000",
        companyName: "안전교육 플랫폼",
        industry: "CONSTRUCTION",
        role: "ADMIN",
        passwordHash,
        isActive: true,
        preferredLanguages: ["ko"],
        emailNotification: false,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Admin account created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      credentials: {
        email: "admin@safety-edu.com",
        password: "admin",
      },
      warning: "Please change the password after first login!",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        hint: "Make sure database tables are created. Run migration.sql in Supabase SQL Editor first.",
      },
      { status: 500 }
    );
  }
}
