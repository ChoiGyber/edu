"use client";

import { useState, useRef } from "react";

type Step = "method" | "info" | "verify" | "result";
type Method = "email" | "phone";

interface FindEmailModalProps {
  onClose: () => void;
  onSwitchToPassword: () => void;
}

export default function FindEmailModal({ onClose, onSwitchToPassword }: FindEmailModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("phone");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone1: "010",
    phone2: "",
    phone3: "",
  });

  // Verification
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Result
  const [foundEmail, setFoundEmail] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);

  // Step 1: 인증 방법 선택
  const handleMethodSelect = (selectedMethod: Method) => {
    setMethod(selectedMethod);
    setStep("info");
    setError("");
  };

  // Step 2: 정보 입력 후 인증번호 발송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const value =
      method === "phone"
        ? `${formData.phone1}-${formData.phone2}-${formData.phone3}`
        : formData.email;

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          value,
          purpose: "find-email",
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("verify");
        if (data.code && process.env.NODE_ENV === "development") {
          console.log("인증번호:", data.code);
        }
      } else {
        setError(data.error || "인증번호 발송에 실패했습니다");
      }
    } catch (error) {
      console.error("Send code error:", error);
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: 인증번호 입력 처리
  const handleCodeChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = numericValue;
      setVerificationCode(newCode);

      if (numericValue && index < 5) {
        codeRefs[index + 1].current?.focus();
      }
    }
  };

  // Step 4: 인증번호 확인
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const code = verificationCode.join("");
    const value =
      method === "phone"
        ? `${formData.phone1}-${formData.phone2}-${formData.phone3}`
        : formData.email;

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          value,
          code,
          purpose: "find-email",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFoundEmail(data.email);
        setStep("result");
      } else {
        setError(data.error || "인증번호가 일치하지 않습니다");
      }
    } catch (error) {
      console.error("Verify code error:", error);
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (
    field: "phone1" | "phone2" | "phone3",
    value: string
  ) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, [field]: numericValue });

    if (field === "phone2" && numericValue.length === 4) {
      phone3Ref.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            아이디 찾기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {step === "method" && "인증 방법을 선택하세요"}
          {step === "info" && "회원 정보를 입력하세요"}
          {step === "verify" && "인증번호를 입력하세요"}
          {step === "result" && "아이디를 찾았습니다"}
        </p>

        {/* Step 1: 인증 방법 선택 */}
        {step === "method" && (
          <div className="space-y-4">
            <button
              onClick={() => handleMethodSelect("phone")}
              className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">
                  phone_iphone
                </span>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    휴대폰 인증
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    휴대폰번호로 인증번호 받기
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect("email")}
              className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">
                  email
                </span>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    이메일 인증
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    이메일 주소로 인증번호 받기
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: 정보 입력 */}
        {step === "info" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                placeholder="홍길동"
              />
            </div>

            {method === "phone" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  휴대폰번호 *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.phone1}
                    readOnly
                    className="w-16 px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-600 text-black dark:text-white text-center"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    ref={phone2Ref}
                    type="text"
                    value={formData.phone2}
                    onChange={(e) => handlePhoneChange("phone2", e.target.value)}
                    maxLength={4}
                    placeholder="1234"
                    required
                    className="w-24 px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white text-center"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    ref={phone3Ref}
                    type="text"
                    value={formData.phone3}
                    onChange={(e) => handlePhoneChange("phone3", e.target.value)}
                    maxLength={4}
                    placeholder="5678"
                    required
                    className="w-24 px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white text-center"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                  placeholder="example@example.com"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "발송 중..." : "인증번호 받기"}
            </button>

            <button
              type="button"
              onClick={() => setStep("method")}
              className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              이전으로
            </button>
          </form>
        )}

        {/* Step 3: 인증번호 입력 */}
        {step === "verify" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">
                  info
                </span>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {method === "phone"
                    ? `${formData.phone1}-${formData.phone2}-${formData.phone3}`
                    : formData.email}
                  로 발송된 6자리 인증번호를 입력하세요
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                인증번호 6자리
              </label>
              <div className="flex gap-2 justify-center">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={codeRefs[index]}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.join("").length !== 6}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "확인 중..." : "인증하기"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("info");
                setVerificationCode(["", "", "", "", "", ""]);
                setError("");
              }}
              className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              다시 받기
            </button>
          </form>
        )}

        {/* Step 4: 결과 */}
        {step === "result" && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">
                  check_circle
                </span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                회원님의 이메일 주소입니다
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {foundEmail}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              로그인하기
            </button>

            <button
              onClick={() => {
                onClose();
                onSwitchToPassword();
              }}
              className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              비밀번호 찾기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
