"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LanguageSelectionModal from "@/components/education/LanguageSelectionModal";

interface Course {
  id: string;
  title: string;
  description: string;
  totalDuration: number;
  nodes: any[];
  edges: any[];
}

export default function ExecuteCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [learnUrl, setLearnUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (response.ok) {
        setCourse({
          ...data.course,
          nodes: JSON.parse(data.course.nodes),
          edges: JSON.parse(data.course.edges),
        });
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setShowLanguageModal(false);

    // 교육 세션 시작
    try {
      const response = await fetch("/api/education/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          language: languageCode,
          qrTokenExpiry: 30,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSessionId(data.sessionId);
        setLearnUrl(data.learnUrl);

        // 외국어 선택 시 QR 코드 생성
        if (languageCode !== "ko") {
          generateQRCode(data.learnUrl);
        }
      }
    } catch (error) {
      console.error("Failed to start education:", error);
      alert("교육 시작에 실패했습니다");
    }
  };

  const generateQRCode = async (url: string) => {
    try {
      const QRCode = (await import("qrcode")).default;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handleComplete = () => {
    // 교육 완료 후 증빙 수집 QR 표시
    alert("교육이 완료되었습니다. 증빙 수집 QR 코드를 표시합니다.");
    // TODO: 증빙 수집 QR 생성
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">교육 과정을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 언어 선택 모달 */}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onSelect={handleLanguageSelect}
      />

      {/* 교육 실행 화면 */}
      {!showLanguageModal && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {course.title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          </div>

          {/* 한국어 선택 시: PC 재생 */}
          {selectedLanguage === "ko" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                교육 진행 중...
              </h2>

              {/* 영상 재생 영역 */}
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-white text-lg">
                  영상 재생 화면 (구현 예정)
                </p>
              </div>

              {/* 진행 정보 */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  총 {course.nodes.filter((n) => n.type === "VIDEO").length}개 영상
                </div>
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  교육 완료
                </button>
              </div>
            </div>
          )}

          {/* 외국어 선택 시: QR 코드 표시 */}
          {selectedLanguage !== "ko" && qrCodeUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
                모바일로 QR 코드를 스캔하세요
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Scan QR Code with Mobile Device
              </p>

              {/* QR 코드 */}
              <div className="inline-block p-8 bg-white rounded-lg shadow-md">
                <img src={qrCodeUrl} alt="QR Code" className="w-96 h-96" />
              </div>

              {/* 링크 */}
              <div className="mt-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  또는 아래 링크를 모바일에서 직접 열기
                </p>
                <a
                  href={learnUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {learnUrl}
                </a>
              </div>

              {/* 안내 */}
              <div className="mt-8 text-left bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <h3 className="font-semibold text-black dark:text-white mb-2">
                  📱 모바일 학습 안내
                </h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• QR 코드를 스캔하면 모바일에서 교육 영상이 재생됩니다</li>
                  <li>• 선택한 언어의 자막이 자동으로 표시됩니다</li>
                  <li>• 교육 완료 후 다시 PC 화면을 확인해주세요</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
