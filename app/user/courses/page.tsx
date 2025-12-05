"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalDuration: number;
  viewCount: number;
}

export default function UserCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
          교육 과정
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          수강 가능한 안전교육 과정을 확인하세요
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="교육 과정 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
            school
          </span>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? "검색 결과가 없습니다" : "등록된 교육 과정이 없습니다"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Thumbnail */}
              <Link href={`/user/courses/${course.id}`}>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative cursor-pointer">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400">
                        smart_display
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(course.totalDuration)}
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <Link href={`/user/courses/${course.id}`}>
                  <h3 className="font-semibold text-black dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    {course.title}
                  </h3>
                </Link>
                {course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      {course.viewCount}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleSaveToMyEducation(e, course.id)}
                    disabled={savingCourseId === course.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="나의안전교육에 추가"
                  >
                    {savingCourseId === course.id ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        <span>저장중...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">bookmark_add</span>
                        <span>저장</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
