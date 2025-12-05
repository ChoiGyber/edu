"use client";

import { useState } from "react";

interface GrantTrialModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GrantTrialModal({ onClose, onSuccess }: GrantTrialModalProps) {
  const [formData, setFormData] = useState({
    userEmail: "",
    planType: "INDIVIDUAL" as "INDIVIDUAL" | "COMPANY",
    trialDays: 14,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userEmail.trim()) {
      alert("사용자 이메일을 입력하세요");
      return;
    }

    if (formData.trialDays <= 0) {
      alert("체험 기간은 1일 이상이어야 합니다");
      return;
    }

    // TODO: API 호출로 무료 체험 부여
    alert(`${formData.userEmail}에게 ${formData.trialDays}일 무료 체험이 부여되었습니다!`);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
        {/* 헤더 */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            무료 체험 부여
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
          {/* 사용자 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              사용자 이메일 *
            </label>
            <input
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              등록된 사용자의 이메일을 입력하세요
            </p>
          </div>

          {/* 플랜 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              플랜 유형 *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, planType: "INDIVIDUAL" })}
                className={`px-4 py-3 rounded-lg font-medium transition border-2 ${
                  formData.planType === "INDIVIDUAL"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                개인 계정
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, planType: "COMPANY" })}
                className={`px-4 py-3 rounded-lg font-medium transition border-2 ${
                  formData.planType === "COMPANY"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                회사 계정
              </button>
            </div>
          </div>

          {/* 체험 기간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              체험 기간 (일) *
            </label>
            <input
              type="number"
              value={formData.trialDays}
              onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
              min={1}
              max={90}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              1~90일 사이로 설정 가능합니다
            </p>
          </div>

          {/* 요약 */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              부여 내역
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• 이메일: {formData.userEmail || "-"}</li>
              <li>
                • 플랜: {formData.planType === "INDIVIDUAL" ? "개인 계정" : "회사 계정"}
              </li>
              <li>• 기간: {formData.trialDays}일</li>
              <li>
                • 종료일:{" "}
                {new Date(
                  Date.now() + formData.trialDays * 24 * 60 * 60 * 1000
                ).toLocaleDateString("ko-KR")}
              </li>
            </ul>
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
              부여하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
