import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AuthCallbackPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 테스트 계정인 경우 세션의 role 사용 (DB 조회 스킵)
  if (session.user.id === "test-admin-id") {
    redirect("/dashboard");
  }

  if (session.user.id === "test-user-id") {
    redirect("/user");
  }

  // DB에서 사용자 role 조회
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      redirect("/auth/signin");
    }

    // Redirect based on role
    if (user.role === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/user");
    }
  } catch (error) {
    // DB 연결 실패 시 세션의 role 정보로 폴백
    console.error("DB connection error in callback:", error);

    if (session.user.role === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/user");
    }
  }
}
