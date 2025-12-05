"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  totalDuration: number;
  viewCount: number;
  usedCount: number;
  isPublic: boolean;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [search, page]);

  const fetchCourses = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12",
    });

    if (search) params.set("search", search);

    try {
      const response = await fetch(`/api/courses?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  const handleDuplicate = async (courseId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm("이 교육 과정을 복사하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/duplicate`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "교육 과정이 복사되었습니다");
        fetchCourses(); // 목록 새로고침
      } else {
        alert(data.error || "복사에 실패했습니다");
      }
    } catch (error) {
      console.error("Duplicate error:", error);
      alert("서버 오류가 발생했습니다");
    }
  };

  return (
    <div className="px-4 py-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            교육 과정
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            노드 조합으로 나만의 교육 과정을 만드세요
          </p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + 교육 과정 만들기
        </Link>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="교육 과정 검색..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
        />
      </div>

      {/* 교육 과정 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">등록된 교육 과정이 없습니다.</p>
          <Link
            href="/dashboard/courses/new"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            첫 교육 과정 만들기
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* 썸네일 */}
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🎓</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {course.isPublic ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        공개
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                        비공개
                      </span>
                    )}
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <h3 className="font-semibold text-black dark:text-white line-clamp-2 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {course.description || "설명 없음"}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>⏱ {formatDuration(course.totalDuration)}</span>
                    <span>👁 {course.viewCount}</span>
                  </div>

                  {/* 작성자 */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    작성자: {course.owner.name}
                  </p>

                  {/* 버튼 */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      상세
                    </Link>
                    <Link
                      href={`/dashboard/courses/${course.id}/edit`}
                      className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      편집
                    </Link>
                    <button
                      onClick={(e) => handleDuplicate(course.id, e)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                      title="복사"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
