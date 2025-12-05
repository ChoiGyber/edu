import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // TODO: 실제 데이터는 Prisma로 조회
  const stats = {
    totalMembers: 2450,
    membersChange: 5,
    activeCourses: 38,
    totalCompletions: 1820,
    completionsChange: 12,
    avgCompletionRate: 75.5,
    completionRateChange: -0.5,
    monthlyRevenue: 4500000,
    revenueChange: 15,
  };

  const alerts = [
    { title: "마지리 1:1 문의", count: 5, color: "text-red-600" },
    { title: "미승인 이수 요청", count: 12, color: "text-orange-600" },
    { title: "신규 가입 회사/회원", count: "3회 / 24명", color: "text-blue-600" },
    { title: "만료 임박 교육 과정", count: "4개", color: "text-yellow-600" },
  ];

  const companyStats = [
    { company: "연진테크", members: 150, progress: 85 },
    { company: "미래건설", members: 92, progress: 78 },
    { company: "한울산업", members: 75, progress: 90 },
    { company: "가나물류", members: 55, progress: 65 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full p-4 sm:p-6 lg:p-8">
        {/* 헤더 */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2">
            안녕하세요, 관리자님! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            오늘도 안전한 작업 환경을 만들어가요
          </p>
        </div>

        {/* 상단 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* 총 회원 수 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                  group
                </span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                총 회원 수
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {stats.totalMembers.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">명</span>
              </p>
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span>
              <span>{stats.membersChange}% (전월 대비)</span>
            </div>
          </div>

          {/* 활성 교육 과정 수 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                  school
                </span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                활성 교육 과정 수
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {stats.activeCourses}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">개</span>
              </p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              — (전년 동월)
            </div>
          </div>

          {/* 총 이수 인원 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">
                  workspace_premium
                </span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                총 이수 인원
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {stats.totalCompletions.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">명</span>
              </p>
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span>
              <span>{stats.completionsChange}% (최근 7일)</span>
            </div>
          </div>

          {/* 전체 평균 이수율 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">
                  pie_chart
                </span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                전체 평균 이수율
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {stats.avgCompletionRate}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">%</span>
              </p>
            </div>
            <div className="flex items-center text-xs text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-sm mr-1">arrow_downward</span>
              <span>{Math.abs(stats.completionRateChange)}% (전월 대비)</span>
            </div>
          </div>

          {/* 당월 결제액 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
                  payments
                </span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                당월 결제액
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                {(stats.monthlyRevenue / 10000).toFixed(0)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">만원</span>
              </p>
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span>
              <span>{stats.revenueChange}% (지난달 대비)</span>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* 왼쪽 섹션 */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6">
            {/* 운영 및 관리 알림 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">notifications_active</span>
                운영 및 관리 알림
              </h2>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{alert.title}</span>
                    <span className={`font-bold ${alert.color}`}>{alert.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 업별/주간 접속자 추이 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">calendar_view_week</span>
                업별/주간 접속자 추이
              </h2>
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm">라인 차트 (접속자 수 변화)</p>
              </div>
            </div>

            {/* 최근 결제 현황 추이 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-600">monetization_on</span>
                최근 결제 현황 추이
              </h2>
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm">영역 차트 (결제액 변화)</p>
              </div>
            </div>
          </div>

          {/* 중앙 섹션 */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6 h-full">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">bar_chart</span>
                교육 과정별 이수율 TOP 5
              </h2>
              <div className="h-[500px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm">막대 그래프 (과정별 이수율)</p>
              </div>
            </div>
          </div>

          {/* 우측 섹션 */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">table_chart</span>
                회사별 수강 현황
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left text-xs font-medium text-gray-600 dark:text-gray-400 pb-3">회사명</th>
                      <th className="text-right text-xs font-medium text-gray-600 dark:text-gray-400 pb-3">인원</th>
                      <th className="text-right text-xs font-medium text-gray-600 dark:text-gray-400 pb-3">평균 진도율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyStats.map((company, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <td className="py-3 text-sm text-black dark:text-white">{company.company}</td>
                        <td className="py-3 text-sm text-right text-gray-700 dark:text-gray-300">{company.members}명</td>
                        <td className="py-3 text-sm text-right font-medium text-blue-600 dark:text-blue-400">{company.progress}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
