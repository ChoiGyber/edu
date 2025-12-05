import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * 회원 상세 조회 API
 * GET /api/users/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const user = await prisma.user.findUnique({
      where: { id: (await params).id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        siteName: true,
        industry: true,
        role: true,
        isActive: true,
        preferredLanguages: true,
        emailNotification: true,
        notificationEmail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "회원을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User detail error:", error);
    return NextResponse.json(
      { error: "회원 정보를 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 회원 정보 수정 API
 * PUT /api/users/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json();
    const {
      name,
      phone,
      companyName,
      siteName,
      industry,
      role,
      isActive,
      password,
      preferredLanguages,
      emailNotification,
      notificationEmail,
    } = body;

    // 기존 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: (await params).id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "회원을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 업데이트 데이터 준비
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (siteName !== undefined) updateData.siteName = siteName;
    if (industry !== undefined) updateData.industry = industry;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (preferredLanguages !== undefined)
      updateData.preferredLanguages = preferredLanguages;
    if (emailNotification !== undefined)
      updateData.emailNotification = emailNotification;
    if (notificationEmail !== undefined)
      updateData.notificationEmail = notificationEmail;

    // 비밀번호 변경
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // 회원 정보 업데이트
    const user = await prisma.user.update({
      where: { id: (await params).id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        siteName: true,
        industry: true,
        role: true,
        isActive: true,
        preferredLanguages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "회원 정보 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 회원 삭제 API
 * DELETE /api/users/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 자기 자신은 삭제 불가
    if ((await params).id === session.user.id) {
      return NextResponse.json(
        { error: "본인 계정은 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    // 회원 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: (await params).id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "회원을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 소프트 삭제 (role을 WITHDRAWN으로 변경)
    await prisma.user.update({
      where: { id: (await params).id },
      data: {
        role: "WITHDRAWN",
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "회원이 삭제되었습니다",
    });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { error: "회원 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
