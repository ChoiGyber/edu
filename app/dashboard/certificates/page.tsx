"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Certificate {
  id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  completedAt: string;
  certificateUrl: string | null;
  attendeeData: {
    name: string;
    nationality: string;
    language: string;
    signatureUrl: string;
    selfieUrl: string;
    completedAt: string;
  };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNationality, setFilterNationality] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCertificates();
  }, [page, filterNationality]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (searchQuery) params.set("search", searchQuery);
      if (filterNationality) params.set("nationality", filterNationality);

      const response = await fetch(`/api/certificates?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchCertificates();
  };

  const handleDownload = (certificateUrl: string, userName: string) => {
    const link = document.createElement("a");
    link.href = certificateUrl;
    link.download = `${userName}_교육이수증명서.pdf`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNationalityFlag = (nationality: string) => {
    const flags: Record<string, string> = {
      KO: "🇰🇷",
      EN: "🇺🇸",
      VN: "🇻🇳",
      CN: "🇨🇳",
      TH: "🇹🇭",
      MN: "🇲🇳",
      PH: "🇵🇭",
    };
    return flags[nationality] || "🌐";
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-4xl">verified</span>
          교육 이수 확인
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          회원별 교육 이수 내역 및 증명서를 확인하세요
        </p>
      </div>

      {/* 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              검색
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="이름, 이메일, 교육명 검색..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined">search</span>
                <span>검색</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              국적 필터
            </label>
            <select
              value={filterNationality}
              onChange={(e) => {
                setFilterNationality(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            >
              <option value="">전체 국적</option>
              <option value="KO">🇰🇷 한국</option>
              <option value="EN">🇺🇸 영어권</option>
              <option value="VN">🇻🇳 베트남</option>
              <option value="CN">🇨🇳 중국</option>
              <option value="TH">🇹🇭 태국</option>
              <option value="MN">🇲🇳 몽골</option>
              <option value="PH">🇵🇭 필리핀</option>
            </select>
          </div>
        </div>
      </div>

      {/* 이수 내역 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
              verified
            </span>
            <p className="text-gray-600 dark:text-gray-400">이수 내역이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      회원 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      교육명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      국적
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      이수 일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      증빙
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      증명서
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {certificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                              person
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-black dark:text-white">
                              {cert.userName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {cert.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-black dark:text-white">
                          {cert.courseTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl">
                          {getNationalityFlag(cert.attendeeData.nationality)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(cert.completedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {cert.attendeeData.selfieUrl && (
                            <a
                              href={cert.attendeeData.selfieUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="셀카 보기"
                            >
                              <span className="material-symbols-outlined">photo_camera</span>
                            </a>
                          )}
                          {cert.attendeeData.signatureUrl && (
                            <a
                              href={cert.attendeeData.signatureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="서명 보기"
                            >
                              <span className="material-symbols-outlined">draw</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cert.certificateUrl ? (
                          <button
                            onClick={() => handleDownload(cert.certificateUrl!, cert.userName)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <span className="material-symbols-outlined">download</span>
                            <span className="text-sm">PDF</span>
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  페이지 {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
