"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EducationHistory {
  id: string;
  courseTitleSnapshot: string;
  startedAt: string;
  completedAt: string | null;
  totalAttendees: number;
  certificateUrl: string | null;
}

export default function UserHistoryPage() {
  const [histories, setHistories] = useState<EducationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress">("all");

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const response = await fetch("/api/histories");
      const data = await response.json();

      if (response.ok) {
        setHistories(data.histories || []);
      }
    } catch (error) {
      console.error("Failed to fetch histories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistories = histories.filter((history) => {
    if (filter === "completed") return history.completedAt !== null;
    if (filter === "in_progress") return history.completedAt === null;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
          내 교육 이력
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          내가 참여한 안전교육 이력을 확인하세요
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "completed"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          완료
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "in_progress"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          진행 중
        </button>
      </div>

      {/* History List */}
      {filteredHistories.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
            history
          </span>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "all"
              ? "교육 이력이 없습니다"
              : filter === "completed"
              ? "완료된 교육이 없습니다"
              : "진행 중인 교육이 없습니다"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistories.map((history) => (
            <div
              key={history.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {history.courseTitleSnapshot}
                    </h3>
                    {history.completedAt ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                        완료
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                        진행 중
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>시작: {formatDate(history.startedAt)}</span>
                    </div>
                    {history.completedAt && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>완료: {formatDate(history.completedAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">group</span>
                      <span>참석자: {history.totalAttendees}명</span>
                    </div>
                  </div>
                </div>

                {history.certificateUrl && (
                  <a
                    href={history.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>증명서</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
