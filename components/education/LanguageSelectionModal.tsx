"use client";

import { LANGUAGES } from "@/types";

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onSelect: (languageCode: string) => void;
  onClose?: () => void;
}

export default function LanguageSelectionModal({
  isOpen,
  onSelect,
  onClose,
}: LanguageSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
            언어를 선택하세요
          </h2>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Select Language
          </h3>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            ℹ️ 외국어 선택 시 QR 코드가 표시됩니다
          </p>
        </div>

        {/* 언어 목록 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => onSelect(language.code)}
              className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all transform hover:scale-105"
            >
              <div className="text-6xl mb-3">{language.flag}</div>
              <p className="text-lg font-semibold text-black dark:text-white">
                {language.label}
              </p>
            </button>
          ))}
        </div>

        {/* 닫기 버튼 (선택사항) */}
        {onClose && (
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
