"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRIES } from "@/types";
import Toast from "@/components/Toast";

export default function SignUpPage() {
  const router = useRouter();

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone1: "010",
    phone2: "",
    phone3: "",
    companyName: "",
    siteName: "",
    industry: "",
    accountType: "INDIVIDUAL" as "INDIVIDUAL" | "COMPANY",
  });

  // Validation states
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast 상태
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "success" });

  // Refs for auto-focus
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);

  // 이메일 중복 확인
  const checkEmailDuplicate = async () => {
    if (!formData.email) {
      setErrors({ ...errors, email: "이메일을 입력하세요" });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors({ ...errors, email: "올바른 이메일 형식이 아닙니다" });
      return;
    }

    setEmailCheckLoading(true);

    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(formData.email)}`);
      const data = await response.json();

      if (data.available) {
        setEmailAvailable(true);
        setEmailChecked(true);
        setErrors({ ...errors, email: "" });
        setToast({
          show: true,
          message: "사용 가능한 이메일입니다.",
          type: "success",
        });
      } else {
        setEmailAvailable(false);
        setEmailChecked(false);
        setErrors({ ...errors, email: "이미 사용 중인 이메일입니다" });
        setToast({
          show: true,
          message: "이미 사용 중인 이메일입니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Email check error:", error);
      setErrors({ ...errors, email: "이메일 확인 중 오류가 발생했습니다" });
      setToast({
        show: true,
        message: "이메일 확인 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // 이메일 변경 시 중복확인 초기화
  useEffect(() => {
    setEmailChecked(false);
    setEmailAvailable(false);
  }, [formData.email]);

  // 비밀번호 유효성 검증
  useEffect(() => {
    if (!formData.password) {
      setPasswordValid(false);
      return;
    }

    // 최소 6자, 특수문자 포함
    const hasMinLength = formData.password.length >= 6;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    const isValid = hasMinLength && hasSpecialChar;
    setPasswordValid(isValid);

    if (formData.password && !isValid) {
      setErrors({
        ...errors,
        password: "비밀번호는 6자 이상이며 특수문자를 포함해야 합니다",
      });
    } else {
      const newErrors = { ...errors };
      delete newErrors.password;
      setErrors(newErrors);
    }
  }, [formData.password]);

  // 비밀번호 확인 일치 검증
  useEffect(() => {
    if (!formData.passwordConfirm) {
      setPasswordMatch(false);
      return;
    }

    const isMatch = formData.password === formData.passwordConfirm;
    setPasswordMatch(isMatch);

    if (formData.passwordConfirm && !isMatch) {
      setErrors({
        ...errors,
        passwordConfirm: "비밀번호가 일치하지 않습니다",
      });
    } else {
      const newErrors = { ...errors };
      delete newErrors.passwordConfirm;
      setErrors(newErrors);
    }
  }, [formData.password, formData.passwordConfirm]);

  // 휴대전화 자동 이동
  const handlePhoneChange = (
    field: "phone1" | "phone2" | "phone3",
    value: string
  ) => {
    // 숫자만 입력
    const numericValue = value.replace(/[^0-9]/g, "");

    setFormData({ ...formData, [field]: numericValue });

    // 자동 이동
    if (field === "phone1" && numericValue.length === 3) {
      phone2Ref.current?.focus();
    } else if (field === "phone2" && numericValue.length === 4) {
      phone3Ref.current?.focus();
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    if (!emailChecked || !emailAvailable) {
      setToast({
        show: true,
        message: "이메일 중복 확인을 해주세요.",
        type: "error",
      });
      return;
    }

    if (!passwordValid) {
      setToast({
        show: true,
        message: "비밀번호는 6자 이상이며 특수문자를 포함해야 합니다.",
        type: "error",
      });
      return;
    }

    if (!passwordMatch) {
      setToast({
        show: true,
        message: "비밀번호가 일치하지 않습니다.",
        type: "error",
      });
      return;
    }

    // 휴대전화 검증
    if (formData.phone1.length !== 3 || formData.phone2.length !== 4 || formData.phone3.length !== 4) {
      setToast({
        show: true,
        message: "휴대전화번호를 올바르게 입력하세요 (예: 010-1234-5678).",
        type: "error",
      });
      return;
    }

    const phoneNumber = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: phoneNumber,
          companyName: formData.companyName,
          siteName: formData.siteName,
          industry: formData.industry,
          accountType: formData.accountType,
        }),
      });

      if (response.ok) {
        setToast({
          show: true,
          message: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
          type: "success",
        });
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        const data = await response.json();
        setToast({
          show: true,
          message: data.error || "회원가입 중 오류가 발생했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setToast({
        show: true,
        message: "회원가입 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            회원가입
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            안전교육 플랫폼에 오신 것을 환영합니다
          </p>
        </div>

        {/* 폼 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 (아이디) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                아이디 (이메일) *
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white ${
                    errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="example@company.com"
                  disabled={emailChecked && emailAvailable}
                />
                <button
                  type="button"
                  onClick={checkEmailDuplicate}
                  disabled={emailCheckLoading || (emailChecked && emailAvailable)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {emailCheckLoading ? "확인 중..." : emailChecked && emailAvailable ? "확인 완료" : "중복 확인"}
                </button>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
              {emailChecked && emailAvailable && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ 사용 가능한 이메일입니다</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호 *
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white ${
                  errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="6자 이상, 특수문자 포함"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
              {passwordValid && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ 사용 가능한 비밀번호입니다</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                * 6자 이상, 특수문자(!@#$%^&* 등) 포함 필수
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호 확인 *
              </label>
              <input
                id="passwordConfirm"
                type="password"
                required
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white ${
                  errors.passwordConfirm ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="비밀번호 재입력"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.passwordConfirm}</p>
              )}
              {passwordMatch && formData.passwordConfirm && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ 비밀번호가 일치합니다</p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이름 *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                placeholder="홍길동"
              />
            </div>

            {/* 휴대전화번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                휴대전화번호 *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.phone1}
                  readOnly
                  className="w-20 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-black dark:text-white text-center"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  ref={phone2Ref}
                  type="text"
                  required
                  maxLength={4}
                  value={formData.phone2}
                  onChange={(e) => handlePhoneChange("phone2", e.target.value)}
                  className="w-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white text-center"
                  placeholder="1234"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  ref={phone3Ref}
                  type="text"
                  required
                  maxLength={4}
                  value={formData.phone3}
                  onChange={(e) => handlePhoneChange("phone3", e.target.value)}
                  className="w-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white text-center"
                  placeholder="5678"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                * 비밀번호 찾기에 사용되므로 정확히 입력해주세요. 각 칸이 채워지면 자동으로 다음 칸으로 이동합니다.
              </p>
            </div>

            {/* 회사명 */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                회사명 (선택)
              </label>
              <input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                placeholder="(주)안전건설"
              />
            </div>

            {/* 현장명 */}
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                현장명 (선택)
              </label>
              <input
                id="siteName"
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                placeholder="서울 00 현장"
              />
            </div>

            {/* 업종 */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                업종 *
              </label>
              <select
                id="industry"
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="">선택하세요</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.icon} {industry.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 계정 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                계정 유형 *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.accountType === "INDIVIDUAL"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="INDIVIDUAL"
                    checked={formData.accountType === "INDIVIDUAL"}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as "INDIVIDUAL" | "COMPANY" })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-semibold text-black dark:text-white">개인 계정</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">월 9,900원</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1인 사용, 기본 기능</p>
                  </div>
                </label>

                <label
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.accountType === "COMPANY"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="COMPANY"
                    checked={formData.accountType === "COMPANY"}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as "INDIVIDUAL" | "COMPANY" })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-semibold text-black dark:text-white">회사 계정</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">연 990,000원</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">무제한 회원, 모든 기능</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 가입 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                회원가입
              </button>
            </div>

            {/* 로그인 링크 */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                이미 계정이 있으신가요?{" "}
                <a href="/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  로그인하기
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* 소셜 로그인 안내 */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">
              info
            </span>
            <div className="text-sm">
              <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
                간편 가입을 원하시나요?
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                <a href="/auth/signin" className="underline hover:no-underline">
                  Google, Kakao, Naver 소셜 로그인
                </a>
                을 이용하면 더 빠르게 가입하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Toast 알림 */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </div>
  );
}
