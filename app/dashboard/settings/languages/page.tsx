'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, DEFAULT_LANGUAGES } from '@/lib/languages/language-config';

/**
 * 언어 관리 페이지
 * 관리자 전용
 */
export default function LanguageSettingsPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/languages');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || DEFAULT_LANGUAGES);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      setLanguages(DEFAULT_LANGUAGES);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (code: string) => {
    setLanguages((prev) =>
      prev.map((lang) =>
        lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/languages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languages }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || '언어 설정이 저장되었습니다');
      } else {
        alert(data.error || '저장에 실패했습니다');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('서버 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('기본 언어 설정으로 초기화하시겠습니까?')) {
      setLanguages(DEFAULT_LANGUAGES);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const enabledCount = languages.filter((lang) => lang.enabled).length;

  return (
    <div className="px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">
              언어 설정
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              교육 시스템에서 사용할 언어를 관리합니다
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            뒤로 가기
          </button>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.723 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  전체 언어
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {languages.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  활성화된 언어
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {enabledCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  비활성화된 언어
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {languages.length - enabledCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 언어 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            지원 언어 목록
          </h2>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              초기화
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 국기 */}
                  <span className="text-4xl">{lang.flag}</span>

                  {/* 언어 정보 */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        {lang.nativeLabel}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({lang.label})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      언어 코드: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{lang.code}</code>
                    </p>
                  </div>
                </div>

                {/* 토글 스위치 */}
                <button
                  onClick={() => handleToggle(lang.code)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    lang.enabled
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      lang.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              주의사항
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>비활성화한 언어는 언어 선택 모달에 표시되지 않습니다</li>
              <li>한국어(ko)는 기본 언어로 항상 활성화되어 있어야 합니다</li>
              <li>변경사항은 저장 버튼을 눌러야 적용됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
