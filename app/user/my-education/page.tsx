"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SavedEducation {
  id: string;
  courseId: string;
  title: string;
  description: string;
  thumbnail: string;
  totalDuration: number;
  savedAt: string;
}

export default function MyEducationPage() {
  const [savedItems, setSavedItems] = useState<SavedEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSavedEducation();
  }, []);

  const fetchSavedEducation = async () => {
    try {
      const response = await fetch("/api/user/my-education");
      const data = await response.json();

      if (response.ok) {
        setSavedItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch saved education:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("이 항목을 나의안전교육에서 제거하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/user/my-education/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("제거에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("제거에 실패했습니다");
    }
  };

  const filteredItems = savedItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  if (loading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2">
          나의안전교육 📚
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          저장한 교육 과정을 관리하고 학습하세요
        </p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="저장한 교육 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Link
          href="/user/courses"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <span className="material-symbols-outlined">add</span>
          <span>교육 추가하기</span>
        </Link>
      </div>

      {/* Statistics */}
      {savedItems.length > 0 && (
        <div className="mb-6 lg:mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                저장한 교육
              </span>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">
                  bookmark
                </span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              {savedItems.length}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">개</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                총 학습 시간
              </span>
              <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">
                  schedule
                </span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              {Math.floor(savedItems.reduce((sum, item) => sum + item.totalDuration, 0) / 60)}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">분</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                최근 저장
              </span>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-xl">
                  update
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base font-medium text-black dark:text-white mt-2">
              {savedItems.length > 0
                ? new Date(savedItems[0].savedAt).toLocaleDateString("ko-KR")
                : "-"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                이번 주 학습
              </span>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">
                  trending_up
                </span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              0
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">회</span>
            </p>
          </div>
        </div>
      )}

      {/* Saved Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <span className="material-symbols-outlined text-6xl text-gray-400">
              bookmark_border
            </span>
          </div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            {searchQuery ? "검색 결과가 없습니다" : "저장한 교육이 없습니다"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? "다른 검색어로 시도해보세요"
              : "교육 과정에서 관심있는 교육을 저장해보세요"}
          </p>
          {!searchQuery && (
            <Link
              href="/user/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <span className="material-symbols-outlined">add</span>
              <span>교육 둘러보기</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Thumbnail */}
              <Link href={`/user/courses/${item.courseId}`}>
                <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400">
                        smart_display
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(item.totalDuration)}
                  </div>
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bookmark</span>
                    <span>저장됨</span>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <Link href={`/user/courses/${item.courseId}`}>
                  <h3 className="font-semibold text-black dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition">
                    {item.title}
                  </h3>
                </Link>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.savedAt).toLocaleDateString("ko-KR")}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>제거</span>
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
