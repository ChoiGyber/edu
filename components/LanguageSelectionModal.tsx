'use client';

import { useState, useEffect } from 'react';
import { Language, DEFAULT_LANGUAGES, getEnabledLanguages } from '@/lib/languages/language-config';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onSelect: (languageCode: string) => void;
  onClose?: () => void;
}

/**
 * 언어 선택 모달
 * Phase 3: 교육 실행 및 QR 시스템
 */
export default function LanguageSelectionModal({
  isOpen,
  onSelect,
  onClose,
}: LanguageSelectionModalProps) {
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 시스템 설정에서 언어 목록 가져오기
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/settings/languages');
      if (response.ok) {
        const data = await response.json();
        if (data.languages && data.languages.length > 0) {
          setLanguages(data.languages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // 실패 시 기본 언어 사용
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const enabledLanguages = getEnabledLanguages(languages);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
            언어를 선택하세요
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select Your Language
          </p>
        </div>

        {/* 언어 선택 그리드 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {enabledLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="group relative p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  {/* 국기 */}
                  <span className="text-4xl">{lang.flag}</span>

                  {/* 언어명 */}
                  <div className="text-center">
                    <p className="text-base font-bold text-black dark:text-white line-clamp-1">
                      {lang.nativeLabel}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {lang.label}
                    </p>
                  </div>

                  {/* 호버 효과 */}
                  <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                외국어 선택 시 QR 코드가 표시됩니다
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                For foreign languages, a QR code will be displayed for mobile viewing
              </p>
            </div>
          </div>
        </div>

        {/* 닫기 버튼 (옵션) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export type { Language };
