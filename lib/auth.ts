import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 🧪 테스트용 하드코딩 계정 (DB 없이도 로그인 가능)
        // 관리자 계정
        if (
          credentials.email === "admin@safety-edu.com" &&
          credentials.password === "admin"
        ) {
          return {
            id: "test-admin-id",
            email: "admin@safety-edu.com",
            name: "테스트 관리자",
            role: "ADMIN",
          };
        }

        // 일반 사용자 계정
        if (
          credentials.email === "user@safety-edu.com" &&
          credentials.password === "1234"
        ) {
          return {
            id: "test-user-id",
            email: "user@safety-edu.com",
            name: "테스트 사용자",
            role: "USER",
          };
        }

        // DB에서 사용자 조회
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          // DB 연결 실패 시에도 테스트 계정은 동작
          console.error("DB connection error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Credentials 로그인은 통과
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth 로그인 시 추가 정보가 없으면 회원가입 페이지로 리다이렉트
      if (account?.provider && user) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // 신규 사용자 - 회원가입 완료 페이지로 이동 필요
          return "/auth/signup/complete";
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyName = token.companyName as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // OAuth 로그인의 경우 DB에서 추가 정보 조회
        if (account?.provider !== "credentials") {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.companyName = dbUser.companyName;
          }
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt", // Credentials Provider 사용을 위해 JWT로 변경
    maxAge: 24 * 60 * 60, // 24시간
  },
});
