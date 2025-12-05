"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SelfieCapture from "@/components/verification/SelfieCapture";
import SignaturePad from "@/components/verification/SignaturePad";
import { DEFAULT_LANGUAGES, type Language } from "@/lib/languages/language-config";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const historyId = searchParams.get("historyId");
  const language = searchParams.get("language") || "ko";

  const [step, setStep] = useState(1); // 1: 이름, 2: 셀카, 3: 서명, 4: 동의
  const [submitting, setSubmitting] = useState(false);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);

  const [formData, setFormData] = useState({
    name: "",
    nationality: "ko",
    language: language,
    selfieUrl: "",
    signatureUrl: "",
    consentGiven: false,
  });

  useEffect(() => {
    // 언어 설정 로드
    fetch('/api/settings/languages')
      .then(res => res.json())
      .then(data => {
        if (data.languages && data.languages.length > 0) {
          setLanguages(data.languages);
        }
      })
      .catch(err => console.error('Failed to load languages:', err));
  }, []);

  const handleSelfieCapture = (dataUrl: string) => {
    setFormData({ ...formData, selfieUrl: dataUrl });
  };

  const handleSignatureSave = (dataUrl: string) => {
    setFormData({ ...formData, signatureUrl: dataUrl });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("이름을 입력해주세요");
      return;
    }

    if (!formData.selfieUrl) {
      alert("셀카를 촬영해주세요");
      return;
    }

    if (!formData.signatureUrl) {
      alert("서명을 작성해주세요");
      return;
    }

    if (!formData.consentGiven) {
      alert("개인정보 수집 및 이용에 동의해주세요");
      return;
    }

    setSubmitting(true);

    try {
      // GPS 위치 정보 가져오기 (선택사항)
      let gpsData = {};
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        gpsData = {
          gpsLatitude: position.coords.latitude,
          gpsLongitude: position.coords.longitude,
        };
      } catch (gpsError) {
        console.log("GPS 정보를 가져올 수 없습니다");
      }

      const response = await fetch("/api/education/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          historyId,
          ...formData,
          ...gpsData,
          completedAt: new Date().toISOString(),
          deviceType: "MOBILE",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 성공
        alert("증빙이 제출되었습니다!");
        router.push("/mobile/success");
      } else {
        alert(data.error || "증빙 제출에 실패했습니다");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("서버 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            📸 교육 이수 확인
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Education Completion Verification
          </p>
        </div>

        {/* 진행 단계 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>정보</span>
            <span>셀카</span>
            <span>서명</span>
            <span>동의</span>
          </div>
        </div>

        {/* 단계별 폼 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {/* Step 1: 이름 및 국적 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  국적 / Nationality *
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeLabel} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}

          {/* Step 2: 셀카 */}
          {step === 2 && (
            <div className="space-y-4">
              <SelfieCapture onCapture={handleSelfieCapture} />

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.selfieUrl}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 서명 */}
          {step === 3 && (
            <div className="space-y-4">
              <SignaturePad onSave={handleSignatureSave} />

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.signatureUrl}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 개인정보 동의 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-black dark:text-white mb-2">
                  개인정보 수집 및 이용 동의
                </h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p>
                    <strong>수집 항목:</strong> 이름, 국적, 셀카 사진, 전자 서명, GPS 위치 정보
                  </p>
                  <p>
                    <strong>수집 목적:</strong> 안전교육 이수 확인 및 법적 증빙
                  </p>
                  <p>
                    <strong>보유 기간:</strong> 3년
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    위 개인정보 수집 및 이용에 동의하지 않을 경우, 교육 이수 확인이 불가능합니다.
                  </p>
                </div>
              </div>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  개인정보 수집 및 이용에 동의합니다 (필수)
                </span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.consentGiven || submitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "제출 중..." : "완료"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-black dark:text-white">제출 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
