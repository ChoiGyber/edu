"use client";

import { useState, useEffect } from "react";

interface Analytics {
  totalUsers: number;
  totalVideos: number;
  totalCourses: number;
  totalEducations: number;
  totalAttendees: number;

  recentEducations: {
    id: string;
    title: string;
    attendees: number;
    completedAt: string;
  }[];

  popularVideos: {
    id: string;
    title: string;
    viewCount: number;
    usedInCourses: number;
  }[];

  byNationality: Record<string, number>;
  byIndustry: Record<string, number>;

  monthlyStats: {
    month: string;
    educations: number;
    attendees: number;
  }[];
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">분석 데이터 로딩 중...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">데이터를 불러올 수 없습니다</p>
      </div>
    );
  }

  const NATIONALITY_LABELS: Record<string, string> = {
    KO: "한국",
    EN: "영어권",
    VI: "베트남",
    ZH: "중국",
    TH: "태국",
    MN: "몽골",
    PH: "필리핀",
  };

  const INDUSTRY_LABELS: Record<string, string> = {
    CONSTRUCTION: "건설업",
    MANUFACTURING: "제조업",
    LOGISTICS: "물류/운송",
    FOOD: "식음료",
    CHEMICAL: "화학",
    ELECTRICITY: "전기/전자",
    SERVICE: "서비스업",
    ETC: "기타",
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            📊 분석 대시보드
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            교육 통계 및 활동 분석
          </p>
        </div>

        {/* 기간 선택 */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 rounded-lg transition ${
              period === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-lg transition ${
              period === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-4 py-2 rounded-lg transition ${
              period === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            연간
          </button>
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">총 회원 수</p>
              <p className="text-3xl font-bold text-black dark:text-white mt-2">
                {analytics.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">총 영상 수</p>
              <p className="text-3xl font-bold text-black dark:text-white mt-2">
                {analytics.totalVideos.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">🎬</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">총 교육 실시</p>
              <p className="text-3xl font-bold text-black dark:text-white mt-2">
                {analytics.totalEducations.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">총 교육 인원</p>
              <p className="text-3xl font-bold text-black dark:text-white mt-2">
                {analytics.totalAttendees.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 최근 교육 현황 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            📅 최근 교육 현황
          </h2>
          <div className="space-y-3">
            {analytics.recentEducations.map((edu) => (
              <div
                key={edu.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-black dark:text-white">
                    {edu.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(edu.completedAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {edu.attendees}명
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 인기 영상 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            🏆 인기 영상
          </h2>
          <div className="space-y-3">
            {analytics.popularVideos.map((video, index) => (
              <div
                key={video.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-black dark:text-white">
                    {video.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    조회 {video.viewCount}회 · {video.usedInCourses}개 교육에 사용
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 국적별 분포 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            🌍 국적별 교육 인원
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.byNationality)
              .sort(([, a], [, b]) => b - a)
              .map(([code, count]) => {
                const total = Object.values(analytics.byNationality).reduce(
                  (sum, c) => sum + c,
                  0
                );
                const percentage = ((count / total) * 100).toFixed(1);

                return (
                  <div key={code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {NATIONALITY_LABELS[code] || code}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count}명 ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 업종별 분포 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            🏭 업종별 사용자 분포
          </h2>
          <div className="space-y-3">
            {Object.entries(analytics.byIndustry)
              .sort(([, a], [, b]) => b - a)
              .map(([industry, count]) => {
                const total = Object.values(analytics.byIndustry).reduce(
                  (sum, c) => sum + c,
                  0
                );
                const percentage = ((count / total) * 100).toFixed(1);

                return (
                  <div key={industry}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {INDUSTRY_LABELS[industry] || industry}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count}명 ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
