"use client";

import { useState } from "react";

interface NewPlanModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewPlanModal({ onClose, onSuccess }: NewPlanModalProps) {
  const [planType, setPlanType] = useState<"INDIVIDUAL" | "COMPANY">("INDIVIDUAL");
  const [formData, setFormData] = useState({
    name: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUsers: 1,
    contactForPrice: false, // 개별 문의 옵션
  });
  const [features, setFeatures] = useState<string[]>(["기본 교육 기능", "QR 증빙 시스템"]);
  const [newFeature, setNewFeature] = useState("");

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("플랜 이름을 입력하세요");
      return;
    }

    if (!formData.contactForPrice && (formData.monthlyPrice <= 0 || formData.yearlyPrice <= 0)) {
      alert("가격을 입력하세요");
      return;
    }

    // TODO: API 호출로 플랜 저장
    alert("새 플랜이 추가되었습니다!");
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            새 플랜 추가
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 플랜 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              플랜 유형 *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPlanType("INDIVIDUAL")}
                className={`px-4 py-3 rounded-lg font-medium transition border-2 ${
                  planType === "INDIVIDUAL"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                개인 계정
              </button>
              <button
                type="button"
                onClick={() => setPlanType("COMPANY")}
                className={`px-4 py-3 rounded-lg font-medium transition border-2 ${
                  planType === "COMPANY"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                회사 계정
              </button>
            </div>
          </div>

          {/* 플랜 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              플랜 이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={planType === "INDIVIDUAL" ? "예: 베이직 플랜" : "예: 엔터프라이즈 플랜"}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              required
            />
          </div>

          {/* 가격 설정 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                가격 설정
              </label>
              <label className="flex items-center gap-2 ml-auto">
                <input
                  type="checkbox"
                  checked={formData.contactForPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, contactForPrice: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  개별 문의로 설정
                </span>
              </label>
            </div>

            {!formData.contactForPrice ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    월간 가격 (원)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyPrice: parseInt(e.target.value) })
                    }
                    placeholder="9900"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                    required={!formData.contactForPrice}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    연간 가격 (원)
                  </label>
                  <input
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, yearlyPrice: parseInt(e.target.value) })
                    }
                    placeholder="99000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                    required={!formData.contactForPrice}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                ℹ️ 가격이 "개별 문의"로 표시됩니다
              </div>
            )}
          </div>

          {/* 최대 사용자 수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              최대 사용자 수
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={formData.maxUsers}
                onChange={(e) =>
                  setFormData({ ...formData, maxUsers: parseInt(e.target.value) })
                }
                min={1}
                className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.maxUsers === 0}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsers: e.target.checked ? 0 : 1 })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  무제한
                </span>
              </label>
            </div>
          </div>

          {/* 포함된 기능 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              포함된 기능
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                placeholder="기능 입력 후 + 버튼 클릭"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>

            {/* 기능 리스트 */}
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">
                    check
                  </span>
                  <span className="flex-1 text-sm text-black dark:text-white">
                    {feature}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
