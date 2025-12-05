import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings/settings-manager";
import { SettingKey } from "@/types/system-settings";

/**
 * NextAuth 설정 (DB에서 OAuth 키 읽기)
 */
async function getAuthOptions(): Promise<NextAuthConfig> {
  // DB에서 설정값 읽기 (없으면 환경 변수 폴백)
  const settings = await getSettings([
    SettingKey.NEXTAUTH_URL,
    SettingKey.NEXTAUTH_SECRET,
    SettingKey.GOOGLE_CLIENT_ID,
    SettingKey.GOOGLE_CLIENT_SECRET,
    SettingKey.KAKAO_CLIENT_ID,
    SettingKey.KAKAO_CLIENT_SECRET,
    SettingKey.NAVER_CLIENT_ID,
    SettingKey.NAVER_CLIENT_SECRET,
  ]);

  const providers = [];

  // Google Provider (설정된 경우에만 추가)
  if (settings[SettingKey.GOOGLE_CLIENT_ID] && settings[SettingKey.GOOGLE_CLIENT_SECRET]) {
    providers.push(
      GoogleProvider({
        clientId: settings[SettingKey.GOOGLE_CLIENT_ID]!,
        clientSecret: settings[SettingKey.GOOGLE_CLIENT_SECRET]!,
      })
    );
  }

  // Kakao Provider (설정된 경우에만 추가)
  if (settings[SettingKey.KAKAO_CLIENT_ID] && settings[SettingKey.KAKAO_CLIENT_SECRET]) {
    providers.push(
      KakaoProvider({
        clientId: settings[SettingKey.KAKAO_CLIENT_ID]!,
        clientSecret: settings[SettingKey.KAKAO_CLIENT_SECRET]!,
      })
    );
  }

  // Naver Provider (설정된 경우에만 추가)
  if (settings[SettingKey.NAVER_CLIENT_ID] && settings[SettingKey.NAVER_CLIENT_SECRET]) {
    providers.push(
      NaverProvider({
        clientId: settings[SettingKey.NAVER_CLIENT_ID]!,
        clientSecret: settings[SettingKey.NAVER_CLIENT_SECRET]!,
      })
    );
  }

  return {
    providers,
    callbacks: {
      async jwt({ token, user, account, profile }) {
        // 최초 로그인 시 (user 객체가 있을 때)
        if (user && account) {
          // DB에 사용자 정보 저장 (Account 모델 사용)
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            include: { user: true },
          });

          if (existingAccount) {
            token.id = existingAccount.user.id;
            token.role = existingAccount.user.role;
            token.companyName = existingAccount.user.companyName;
          } else {
            // 새 사용자 생성 필요 → 회원가입 완료 페이지로 리다이렉트
            token.isNewUser = true;
            token.provider = account.provider;
            token.providerAccountId = account.providerAccountId;
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.companyName = token.companyName as string | null;
        }
        return session;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
    secret: settings[SettingKey.NEXTAUTH_SECRET] || process.env.NEXTAUTH_SECRET,
  };
}

/**
 * NextAuth 인스턴스 생성
 */
let authInstance: ReturnType<typeof NextAuth> | null = null;

async function getAuthInstance() {
  if (!authInstance) {
    const options = await getAuthOptions();
    authInstance = NextAuth(options);
  }
  return authInstance;
}

/**
 * auth() 함수 (서버 컴포넌트에서 사용)
 */
export async function auth() {
  const instance = await getAuthInstance();
  return instance.auth();
}

/**
 * NextAuth handlers export
 * API route에서 동적으로 처리
 */
export async function GET(req: any) {
  const instance = await getAuthInstance();
  return instance.handlers.GET(req);
}

export async function POST(req: any) {
  const instance = await getAuthInstance();
  return instance.handlers.POST(req);
}
