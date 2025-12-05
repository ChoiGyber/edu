"use client";

import { useState, useEffect } from "react";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 시스템 옵션
  const [qrTokenExpiryMinutes, setQrTokenExpiryMinutes] = useState(30);
  const [defaultLanguage, setDefaultLanguage] = useState("ko");
  const [autoPdfGeneration, setAutoPdfGeneration] = useState(true);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/system-options");

      if (response.ok) {
        const data = await response.json();
        setQrTokenExpiryMinutes(data.options.qrTokenExpiryMinutes || 30);
        setDefaultLanguage(data.options.defaultLanguage || "ko");
        setAutoPdfGeneration(data.options.autoPdfGeneration !== false);
      }
    } catch (error) {
      console.error("Failed to fetch options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/system-options", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrTokenExpiryMinutes,
          defaultLanguage,
          autoPdfGeneration,
        }),
      });

      if (response.ok) {
        alert("설정이 저장되었습니다");
      } else {
        const data = await response.json();
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("저장 중 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          일반 설정
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          시스템 기본 동작을 설정합니다
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* QR 토큰 만료 시간 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⏱️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                QR 토큰 만료 시간
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                QR 코드로 접속할 때 사용되는 토큰의 유효 시간을 설정합니다
              </p>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={qrTokenExpiryMinutes}
                  onChange={(e) => setQrTokenExpiryMinutes(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="min-w-[100px]">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={qrTokenExpiryMinutes}
                    onChange={(e) => setQrTokenExpiryMinutes(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">분</span>
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                권장: 30분 (5~120분 사이)
              </div>
            </div>
          </div>
        </div>

        {/* 기본 교육 언어 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🌐</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                기본 교육 언어
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                교육 시작 시 기본으로 선택될 언어를 설정합니다
              </p>

              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="zh">中文</option>
                <option value="th">ไทย</option>
              </select>
            </div>
          </div>
        </div>

        {/* 자동 PDF 생성 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📄</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                자동 PDF 생성
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                교육 완료 시 자동으로 이수 확인서 PDF를 생성합니다
              </p>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPdfGeneration}
                  onChange={(e) => setAutoPdfGeneration(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  자동 생성 활성화
                </span>
              </label>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                비활성화 시 관리자가 수동으로 PDF를 생성해야 합니다
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
