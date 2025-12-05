import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * 회원 목록 조회 API
 * GET /api/users?page=1&limit=20&role=USER&search=홍길동
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 테스트 계정 처리
    if (session.user.id === "test-admin-id" && session.user.role === "ADMIN") {
      // 테스트 계정용 Mock 데이터 반환
      const mockUsers = [
        {
          id: "user-1",
          email: "test1@example.com",
          name: "테스트 사용자 1",
          phone: "010-1234-5678",
          companyName: "테스트 회사",
          siteName: "A 현장",
          industry: "CONSTRUCTION",
          role: "USER",
          isActive: true,
          preferredLanguages: ["ko"],
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({
        success: true,
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
    }

    // 권한 확인 (ADMIN만 가능)
    let currentUser;
    try {
      currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자만 접근 가능합니다" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;

    // 필터 조건
    const where: any = {
      role: { not: "WITHDRAWN" }, // 탈퇴 회원 제외
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
      ];
    }

    // 전체 개수
    const total = await prisma.user.count({ where });

    // 목록 조회
    const users = await prisma.user.findMany({
      where,
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
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("User list error:", error);
    return NextResponse.json(
      { error: "회원 목록을 가져올 수 없습니다" },
      { status: 500 }
    );
  }
}

/**
 * 회원 추가 API
 * POST /api/users
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 테스트 계정 처리
    if (session.user.id === "test-admin-id" && session.user.role === "ADMIN") {
      // 테스트 계정은 Mock 응답 반환
      const body = await request.json();
      return NextResponse.json({
        success: true,
        user: {
          id: "new-user-" + Date.now(),
          email: body.email,
          name: body.name,
          phone: body.phone || null,
          companyName: body.companyName || "테스트 회사",
          siteName: body.siteName || null,
          industry: body.industry || null,
          role: body.role || "USER",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // 권한 확인 (ADMIN만 가능)
    let currentUser;
    try {
      currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자만 접근 가능합니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      email,
      name,
      phone,
      companyName,
      siteName,
      industry,
      role,
      password,
      preferredLanguages,
    } = body;

    // 필수 값 확인
    if (!email || !name) {
      return NextResponse.json(
        { error: "이메일과 이름은 필수입니다" },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다" },
        { status: 400 }
      );
    }

    // 전화번호 중복 확인 (전화번호가 입력된 경우)
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "이미 등록된 휴대폰번호입니다" },
          { status: 400 }
        );
      }
    }

    // 비밀번호 해싱
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    // 회원 생성
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        companyName: companyName || currentUser.companyName,
        siteName: siteName || null,
        industry: industry || null,
        role: role || "USER",
        passwordHash,
        preferredLanguages: preferredLanguages || ["ko"],
        isActive: true,
      },
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
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "회원 추가에 실패했습니다" },
      { status: 500 }
    );
  }
}
