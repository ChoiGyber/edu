"use client";

import { useState, useEffect } from "react";

interface Certificate {
  id: string;
  courseTitleSnapshot: string;
  completedAt: string;
  totalAttendees: number;
  certificateUrl: string;
}

export default function UserCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      // 완료된 교육 이력 중 증명서가 있는 것만 조회
      const response = await fetch("/api/histories?completed=true");
      const data = await response.json();

      if (response.ok) {
        const withCertificates = (data.histories || []).filter(
          (h: any) => h.certificateUrl
        );
        setCertificates(withCertificates);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.courseTitleSnapshot.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async (certificateUrl: string, courseName: string) => {
    try {
      const response = await fetch(certificateUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${courseName}_이수증명서.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("다운로드에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
          이수 증명서
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          발급된 안전교육 이수 증명서를 확인하고 다운로드하세요
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                총 발급 증명서
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {certificates.length}
              </p>
            </div>
            <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400 opacity-50">
              verified
            </span>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                올해 이수
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {
                  certificates.filter(
                    (c) => new Date(c.completedAt).getFullYear() === new Date().getFullYear()
                  ).length
                }
              </p>
            </div>
            <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400 opacity-50">
              calendar_today
            </span>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                최근 30일
              </p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {
                  certificates.filter((c) => {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return new Date(c.completedAt) >= thirtyDaysAgo;
                  }).length
                }
              </p>
            </div>
            <span className="material-symbols-outlined text-5xl text-purple-600 dark:text-purple-400 opacity-50">
              trending_up
            </span>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
            description
          </span>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? "검색 결과가 없습니다" : "발급된 증명서가 없습니다"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Certificate Icon/Preview */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex items-center justify-center">
                <span className="material-symbols-outlined text-8xl text-white">
                  workspace_premium
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-black dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
                  {cert.courseTitleSnapshot}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">event</span>
                    <span>이수일: {formatDate(cert.completedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>참석자: {cert.totalAttendees}명</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleDownload(cert.certificateUrl, cert.courseTitleSnapshot)
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>다운로드</span>
                  </button>
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    title="미리보기"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
