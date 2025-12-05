import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserLayoutClient from "./layout-client";

export default async function UserLayout({
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
      <UserLayoutClient
        isAdmin={session.user.role === "ADMIN"}
        userName={session.user.name || "사용자"}
        userEmail={session.user.email || ""}
      >
        {children}
      </UserLayoutClient>
    );
  }

  // DB에서 사용자 정보 조회
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      redirect("/auth/signin");
    }

    const isAdmin = user.role === "ADMIN";

    return (
      <UserLayoutClient
        isAdmin={isAdmin}
        userName={user.name}
        userEmail={user.email}
      >
        {children}
      </UserLayoutClient>
    );
  } catch (error) {
    // DB 연결 실패 시 세션 정보로 폴백
    console.error("DB connection error in user layout:", error);

    return (
      <UserLayoutClient
        isAdmin={session.user.role === "ADMIN"}
        userName={session.user.name || "사용자"}
        userEmail={session.user.email || ""}
      >
        {children}
      </UserLayoutClient>
    );
  }
}
