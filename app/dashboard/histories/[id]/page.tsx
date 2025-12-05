"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Attendee {
  id: string;
  name: string;
  nationality: string;
  language: string;
  signatureUrl: string;
  selfieUrl: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  completedAt: string;
  deviceType: string;
  consentGiven: boolean;
  consentAt: string;
}

interface EducationHistory {
  id: string;
  courseTitleSnapshot: string;
  startedAt: string;
  completedAt: string | null;
  totalAttendees: number;
  attendees: Attendee[];
  byNationality: Record<string, number>;
  certificateUrl: string | null;
  screenshots: string[];
  qrTokenExpiry: number;
  course: {
    id: string;
    title: string;
    description: string;
    totalDuration: number;
  };
  executor: {
    id: string;
    name: string;
    email: string;
    companyName: string;
    siteName: string;
  };
}

const NATIONALITY_FLAGS: Record<string, string> = {
  KO: "🇰🇷 한국",
  EN: "🇺🇸 미국",
  VN: "🇻🇳 베트남",
  CN: "🇨🇳 중국",
  TH: "🇹🇭 태국",
};

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [history, setHistory] = useState<EducationHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchHistory();
    }
  }, [params.id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/histories/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      } else {
        console.error("Failed to fetch history");
        alert("교육 이력을 불러올 수 없습니다");
        router.push("/dashboard/histories");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!history) return;

    setGeneratingPDF(true);
    try {
      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          historyId: history.id,
          companyName: history.executor.companyName,
          siteName: history.executor.siteName,
          educationTitle: history.courseTitleSnapshot,
          educationDate: new Date(history.startedAt).toLocaleString("ko-KR"),
          totalDuration: history.course.totalDuration,
          attendees: history.attendees,
          screenshots: history.screenshots,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `교육이수확인서_${history.courseTitleSnapshot}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("PDF 생성에 실패했습니다");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("PDF 생성 중 오류가 발생했습니다");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          교육 이력을 찾을 수 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2"
          >
            ← 목록으로 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {history.courseTitleSnapshot}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            교육 이력 상세 정보
          </p>
        </div>
        <button
          onClick={handleGeneratePDF}
          disabled={generatingPDF}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {generatingPDF ? "생성 중..." : "PDF 다운로드"}
        </button>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
          교육 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              회사명:
            </span>
            <p className="text-sm text-black dark:text-white mt-1">
              {history.executor.companyName}
            </p>
          </div>
          {history.executor.siteName && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                현장명:
              </span>
              <p className="text-sm text-black dark:text-white mt-1">
                {history.executor.siteName}
              </p>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              교육 시작:
            </span>
            <p className="text-sm text-black dark:text-white mt-1">
              {formatDate(history.startedAt)}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              교육 완료:
            </span>
            <p className="text-sm text-black dark:text-white mt-1">
              {history.completedAt ? formatDate(history.completedAt) : "-"}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              총 교육 시간:
            </span>
            <p className="text-sm text-black dark:text-white mt-1">
              {formatDuration(history.course.totalDuration)}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              참석 인원:
            </span>
            <p className="text-sm text-black dark:text-white mt-1">
              {history.totalAttendees}명
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              실행자:
            </span>
            <p className="text-sm text-black dark:text-white mt-1">
              {history.executor.name} ({history.executor.email})
            </p>
          </div>
        </div>
      </div>

      {/* 국적별 통계 */}
      {history.byNationality && Object.keys(history.byNationality).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            국적별 통계
          </h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(history.byNationality).map(([nat, count]) => (
              <div
                key={nat}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-sm font-medium text-black dark:text-white">
                  {NATIONALITY_FLAGS[nat] || nat}:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {count}명
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 참석자 리스트 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
          참석자 명단 ({history.attendees.length}명)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  번호
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  이름
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  국적
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  언어
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  완료 시간
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  셀카
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  서명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  기기
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.attendees.map((attendee, idx) => (
                <tr
                  key={attendee.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                    {attendee.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {NATIONALITY_FLAGS[attendee.nationality] ||
                      attendee.nationality}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {attendee.language}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(attendee.completedAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {attendee.selfieUrl && (
                      <img
                        src={attendee.selfieUrl}
                        alt={`${attendee.name} 셀카`}
                        className="w-12 h-12 object-cover rounded cursor-pointer hover:scale-150 transition"
                        onClick={() => window.open(attendee.selfieUrl, "_blank")}
                      />
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {attendee.signatureUrl && (
                      <img
                        src={attendee.signatureUrl}
                        alt={`${attendee.name} 서명`}
                        className="w-16 h-8 object-contain cursor-pointer hover:scale-150 transition"
                        onClick={() =>
                          window.open(attendee.signatureUrl, "_blank")
                        }
                      />
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {attendee.deviceType === "MOBILE" ? "모바일" : "PC"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 교육 스크린샷 */}
      {history.screenshots && history.screenshots.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            교육 화면 캡처 ({history.screenshots.length}개)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.screenshots.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                onClick={() => window.open(url, "_blank")}
              >
                <img
                  src={url}
                  alt={`스크린샷 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
