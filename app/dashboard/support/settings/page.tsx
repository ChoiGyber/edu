"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";

export default function ChatSettingsPage() {
  const [position, setPosition] = useState({ bottom: 20, right: 20 });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // 설정 불러오기
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/support/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.settings?.chatWidgetPosition) {
          setPosition(data.settings.chatWidgetPosition);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/support/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatWidgetPosition: position,
        }),
      });

      if (response.ok) {
        alert("설정이 저장되었습니다");
      } else {
        alert("설정 저장에 실패했습니다");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      alert("설정 저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const presets = [
    { name: "우측 하단 (기본)", bottom: 20, right: 20 },
    { name: "우측 중단", bottom: 200, right: 20 },
    { name: "좌측 하단", bottom: 20, right: window.innerWidth - 100 },
    { name: "좌측 중단", bottom: 200, right: window.innerWidth - 100 },
  ];

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/dashboard/support" className="hover:text-blue-600">
            고객관리
          </Link>
          <span>/</span>
          <span className="text-black dark:text-white">채팅 설정</span>
        </nav>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          채팅 위젯 설정
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          홈페이지에 표시되는 채팅 위젯의 위치를 조정할 수 있습니다
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 설정 패널 */}
        <div className="col-span-5 space-y-6">
          {/* 위치 조정 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
              위치 조정
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  아래에서 거리: {position.bottom}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={position.bottom}
                  onChange={(e) =>
                    setPosition({ ...position, bottom: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  오른쪽에서 거리: {position.right}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={position.right}
                  onChange={(e) =>
                    setPosition({ ...position, right: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => setPosition({ bottom: 20, right: 20 })}
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 프리셋 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
              빠른 설정
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    setPosition({ bottom: preset.bottom, right: preset.right })
                  }
                  className="px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 미리보기 토글 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  미리보기
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  실시간으로 위젯 위치를 확인하세요
                </p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 rounded-lg transition ${
                  showPreview
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {showPreview ? "켜짐" : "꺼짐"}
              </button>
            </div>
          </div>
        </div>

        {/* 미리보기 영역 */}
        <div className="col-span-7">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
              미리보기
            </h2>

            {/* 미리보기 창 */}
            <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 h-[600px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-2 block">
                    web
                  </span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    홈페이지 미리보기
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    채팅 위젯 위치: 아래 {position.bottom}px, 오른쪽 {position.right}
                    px
                  </p>
                </div>
              </div>

              {/* 채팅 위젯 미리보기 */}
              {showPreview && (
                <div
                  className="absolute bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer transition"
                  style={{
                    bottom: `${position.bottom}px`,
                    right: `${position.right}px`,
                  }}
                >
                  <span className="material-symbols-outlined text-3xl">chat</span>
                </div>
              )}

              {/* 가이드 라인 */}
              <div
                className="absolute border-l-2 border-dashed border-red-400 opacity-30"
                style={{
                  right: `${position.right}px`,
                  top: 0,
                  bottom: 0,
                }}
              />
              <div
                className="absolute border-t-2 border-dashed border-red-400 opacity-30"
                style={{
                  bottom: `${position.bottom}px`,
                  left: 0,
                  right: 0,
                }}
              />
            </div>

            {/* 안내 */}
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">
                  info
                </span>
                <div className="flex-1">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                    위치 조정 팁
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
                    <li>슬라이더를 움직여 위치를 실시간으로 조정할 수 있습니다</li>
                    <li>빠른 설정 버튼으로 일반적인 위치로 즉시 이동할 수 있습니다</li>
                    <li>미리보기를 켜면 실제 표시될 위치를 확인할 수 있습니다</li>
                    <li>설정은 홈페이지에 즉시 반영됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
