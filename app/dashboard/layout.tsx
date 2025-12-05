import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 테스트 계정인 경우 세션 정보 사용 (DB 조회 스킵)
  if (session.user.id === "test-admin-id" || session.user.id === "test-user-id") {
    return (
      <DashboardLayoutClient
        isAdmin={session.user.role === "ADMIN"}
        userName={session.user.name || "사용자"}
        userEmail={session.user.email || ""}
      >
        {children}
      </DashboardLayoutClient>
    );
  }

  // DB에서 사용자 역할 조회
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true, email: true },
    });

    const isAdmin = user?.role === "ADMIN";
    const userName = user?.name || session.user?.name || "사용자";
    const userEmail = user?.email || session.user?.email || "";

    return (
      <DashboardLayoutClient
        isAdmin={isAdmin}
        userName={userName}
        userEmail={userEmail}
      >
        {children}
      </DashboardLayoutClient>
    );
  } catch (error) {
    // DB 연결 실패 시 세션 정보로 폴백
    console.error("DB connection error in dashboard layout:", error);

    return (
      <DashboardLayoutClient
        isAdmin={session.user.role === "ADMIN"}
        userName={session.user.name || "사용자"}
        userEmail={session.user.email || ""}
      >
        {children}
      </DashboardLayoutClient>
    );
  }
}
