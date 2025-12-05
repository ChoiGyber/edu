"use client";

import { useState } from "react";
import Link from "next/link";

export default function UserPage() {
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);

  const handleSaveToMyEducation = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setSavingCourseId(courseId);

    try {
      const response = await fetch("/api/user/my-education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        alert("나의안전교육에 추가되었습니다!");
      } else {
        const data = await response.json();
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("Save to my education error:", error);
      alert("저장에 실패했습니다");
    } finally {
      setSavingCourseId(null);
    }
  };

  // TODO: 실제 데이터는 Prisma로 조회
  const stats = {
    enrolledCourses: 8,
    completedCourses: 5,
    monthlyLearning: 12,
    totalMinutes: 245,
  };

  const myCourses = [
    {
      id: 1,
      title: "건설현장 안전교육 기본과정",
      thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
      duration: 45,
      videos: 5,
      progress: 80,
      status: "진행중",
    },
    {
      id: 2,
      title: "전기안전 종합교육",
      thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      duration: 30,
      videos: 3,
      progress: 100,
      status: "완료",
    },
    {
      id: 3,
      title: "화재예방 및 소화기 사용법",
      thumbnail: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&h=300&fit=crop",
      duration: 25,
      videos: 4,
      progress: 60,
      status: "진행중",
    },
    {
      id: 4,
      title: "고소작업 안전수칙",
      thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
      duration: 35,
      videos: 4,
      progress: 0,
      status: "시작 전",
    },
  ];

  const recommendedVideos = [
    {
      id: 1,
      title: "인전모 작용의 중요성",
      thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
      duration: "8:24",
      views: "1.2K",
    },
    {
      id: 2,
      title: "포크리프트 안전운전",
      thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      duration: "12:15",
      views: "2.9K",
    },
    {
      id: 3,
      title: "밀폐공간 작업 안전",
      thumbnail: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&h=300&fit=crop",
      duration: "10:45",
      views: "980",
    },
    {
      id: 4,
      title: "낙하물 방지 안전수칙",
      thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
      duration: "9:30",
      views: "1.8K",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full p-4 sm:p-6 lg:p-8">
        {/* 헤더 */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2">
            안녕하세요! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            오늘도 안전한 작업 환경을 만들어가요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* 내 교육 과정 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                내 교육 과정
              </h3>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 lg:p-2 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl lg:text-2xl">
                  school
                </span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              {stats.enrolledCourses}
            </p>
          </div>

          {/* 수강 완료 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                수강 완료
              </h3>
              <div className="bg-green-100 dark:bg-green-900/30 p-1.5 lg:p-2 rounded-lg">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl lg:text-2xl">
                  check_circle
                </span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              {stats.completedCourses}
            </p>
          </div>

          {/* 이번 달 학습 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                이번 달 학습
              </h3>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 lg:p-2 rounded-lg">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-xl lg:text-2xl">
                  calendar_today
                </span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              {stats.monthlyLearning}
            </p>
          </div>

          {/* 총 학습 시간 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                총 학습 시간
              </h3>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 lg:p-2 rounded-lg">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl lg:text-2xl">
                  schedule
                </span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              {stats.totalMinutes}
              <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">분</span>
            </p>
          </div>
        </div>

        {/* 내가 수강한 교육 */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-xl sm:text-2xl">assignment</span>
              내가 수강한 교육
            </h2>
            <Link
              href="/user/courses"
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm flex items-center gap-1"
            >
              <span>전체보기</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {myCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition group"
              >
                <Link href={`/user/courses/${course.id}`}>
                  <div className="relative h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden cursor-pointer">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    {course.status === "완료" ? (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-green-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                        완료
                      </div>
                    ) : course.status === "진행중" ? (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-blue-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                        진행중
                      </div>
                    ) : (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-gray-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                        시작 전
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3 sm:p-4">
                  <Link href={`/user/courses/${course.id}`}>
                    <h3 className="font-semibold text-sm sm:text-base text-black dark:text-white mb-2 line-clamp-2 h-10 sm:h-12 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                      {course.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{course.duration}분</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">video_library</span>
                      <span>{course.videos}개</span>
                    </div>
                  </div>
                  {/* 진행률 바 */}
                  <div className="mb-1 sm:mb-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>진행률</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div
                        className={`h-1.5 sm:h-2 rounded-full ${
                          course.progress === 100
                            ? "bg-green-600"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 교육 영상 */}
        <div>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-xl sm:text-2xl">emoji_events</span>
              추천 교육 영상
            </h2>
            <Link
              href="/user/courses"
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm flex items-center gap-1"
            >
              <span>전체보기</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {recommendedVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition group"
              >
                <div className="relative h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden cursor-pointer">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-4xl sm:text-5xl opacity-0 group-hover:opacity-100 transition">
                      play_circle
                    </span>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black bg-opacity-75 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs">
                    {video.duration}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-black dark:text-white mb-2 line-clamp-2 h-10 sm:h-12">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>{video.views} 조회</span>
                    </div>
                    <button
                      onClick={(e) => handleSaveToMyEducation(e, video.id.toString())}
                      disabled={savingCourseId === video.id.toString()}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                      title="나의안전교육에 추가"
                    >
                      {savingCourseId === video.id.toString() ? (
                        <>
                          <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                          <span className="hidden sm:inline">저장중</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xs">bookmark_add</span>
                          <span className="hidden sm:inline">저장</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
