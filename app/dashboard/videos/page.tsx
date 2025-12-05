"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { INDUSTRIES } from "@/types";
import CategoryManagementModal from "@/components/CategoryManagementModal";
import VideoUploadModal from "@/components/VideoUploadModal";

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  provider: string;
  industry: string[];
  category: string[];
  viewCount: number;
  usedInCourses: number;
  createdAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userRole, setUserRole] = useState<string>("USER");

  useEffect(() => {
    fetchVideos();
    fetchUserRole();
  }, [search, selectedIndustry, selectedProvider, page]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      if (data.user?.role) {
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
    });

    if (search) params.set("search", search);
    if (selectedIndustry) params.set("industry", selectedIndustry);
    if (selectedProvider) params.set("provider", selectedProvider);

    try {
      const response = await fetch(`/api/videos?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="px-4 py-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            영상 라이브러리
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            교육에 사용할 영상을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">category</span>
            <span>카테고리 관리</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>영상 등록</span>
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 검색 */}
          <div>
            <input
              type="text"
              placeholder="영상 제목 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          {/* 업종 필터 */}
          <div>
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            >
              <option value="">모든 업종</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.icon} {industry.label}
                </option>
              ))}
            </select>
          </div>

          {/* 제공자 필터 */}
          <div>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            >
              <option value="">모든 제공자</option>
              <option value="VIMEO">Vimeo</option>
              <option value="CLOUDFLARE">Cloudflare Stream</option>
            </select>
          </div>
        </div>
      </div>

      {/* 영상 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">등록된 영상이 없습니다.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            첫 영상 등록하기
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* 썸네일 */}
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <h3 className="font-semibold text-black dark:text-white line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {video.description || "설명 없음"}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{video.provider}</span>
                    <span>👁 {video.viewCount}</span>
                  </div>

                  {/* 업종 태그 */}
                  {video.industry.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {video.industry.slice(0, 3).map((ind) => {
                        const industry = INDUSTRIES.find((i) => i.value === ind);
                        return industry ? (
                          <span
                            key={ind}
                            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                          >
                            {industry.icon}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* 버튼 */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/dashboard/videos/${video.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      상세
                    </Link>
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      사용
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

      {/* 카테고리 관리 모달 */}
      {showCategoryModal && (
        <CategoryManagementModal
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {/* 영상 등록 모달 */}
      {showUploadModal && (
        <VideoUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchVideos(); // 영상 목록 새로고침
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
}
