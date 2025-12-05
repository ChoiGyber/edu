"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import FindEmailModal from "@/components/FindEmailModal";
import FindPasswordModal from "@/components/FindPasswordModal";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 모달 상태
  const [showFindEmailModal, setShowFindEmailModal] = useState(false);
  const [showFindPasswordModal, setShowFindPasswordModal] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("로그인 시도:", { email });

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("로그인 결과:", result);

      if (result?.error) {
        console.error("로그인 에러:", result.error);
        setError(`로그인 실패: ${result.error}`);
        setIsLoading(false);
      } else if (result?.ok) {
        console.log("로그인 성공, 리다이렉트 중...");
        window.location.href = "/auth/callback";
      } else {
        console.error("예상치 못한 결과:", result);
        setError("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(`로그인 중 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/auth/callback" });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <span className="material-symbols-outlined text-5xl">construction</span>
            <div>
              <h1 className="text-3xl font-bold">안전교육 플랫폼</h1>
              <p className="text-blue-100 text-sm">Safety Education Platform</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4 text-white">
            <span className="material-symbols-outlined text-3xl">video_library</span>
            <div>
              <h3 className="font-semibold text-lg">영상 조합 교육</h3>
              <p className="text-blue-100 text-sm">
                10분대 짧은 영상을 조합하여 맞춤형 교육 과정을 만드세요
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-white">
            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
            <div>
              <h3 className="font-semibold text-lg">QR 증빙 시스템</h3>
              <p className="text-blue-100 text-sm">
                모바일 QR 코드로 간편하게 교육 이수를 증빙하세요
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-white">
            <span className="material-symbols-outlined text-3xl">translate</span>
            <div>
              <h3 className="font-semibold text-lg">다국어 지원</h3>
              <p className="text-blue-100 text-sm">
                AI 자동 번역으로 외국인 근로자도 쉽게 교육받을 수 있습니다
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 text-white">
            <span className="material-symbols-outlined text-3xl">description</span>
            <div>
              <h3 className="font-semibold text-lg">PDF 자동 생성</h3>
              <p className="text-blue-100 text-sm">
                교육 이수 확인서를 자동으로 생성하여 법적 효력을 확보하세요
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-100 text-sm">
          © 2025 Safety Education Platform. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 text-black dark:text-white mb-2">
              <span className="material-symbols-outlined text-4xl">construction</span>
              <h1 className="text-2xl font-bold">안전교육 플랫폼</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Safety Education Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                로그인
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                이메일 또는 소셜 계정으로 로그인하세요
              </p>
            </div>

            {/* Email/Password Login Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>

              {/* 회원가입 및 찾기 링크 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFindEmailModal(true)}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
                  >
                    아이디 찾기
                  </button>
                  <span className="text-gray-400 dark:text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={() => setShowFindPasswordModal(true)}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
                  >
                    비밀번호 찾기
                  </button>
                </div>
                <a
                  href="/auth/signup"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  회원가입
                </a>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  또는 소셜 계정으로
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Google 로그인 */}
              <button
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google로 계속하기</span>
              </button>

              {/* Kakao 로그인 */}
              <button
                onClick={() => handleSocialLogin("kakao")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#FEE500] text-gray-900 font-medium hover:bg-[#FDD835] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                  />
                </svg>
                <span>Kakao로 계속하기</span>
              </button>

              {/* Naver 로그인 */}
              <button
                onClick={() => handleSocialLogin("naver")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#03C75A] text-white font-medium hover:bg-[#02B350] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z" />
                </svg>
                <span>Naver로 계속하기</span>
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">
                  info
                </span>
                <div className="text-sm">
                  <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
                    처음 이용하시나요?
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    소셜 로그인 후 추가 정보를 입력하면 회원가입이 완료됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              로그인에 문제가 있으신가요?{" "}
              <a href="/support" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                고객센터
              </a>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              로그인하면{" "}
              <a href="/terms" className="hover:underline">
                이용약관
              </a>{" "}
              및{" "}
              <a href="/privacy" className="hover:underline">
                개인정보처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 아이디 찾기 모달 */}
      {showFindEmailModal && (
        <FindEmailModal
          onClose={() => setShowFindEmailModal(false)}
          onSwitchToPassword={() => {
            setShowFindEmailModal(false);
            setShowFindPasswordModal(true);
          }}
        />
      )}

      {/* 비밀번호 찾기 모달 */}
      {showFindPasswordModal && (
        <FindPasswordModal
          onClose={() => setShowFindPasswordModal(false)}
        />
      )}
    </div>
  );
}
