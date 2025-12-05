"use client";

import { useState, useEffect } from "react";
import { SETTING_CATEGORIES, SettingKey, SettingCategory, SettingField } from "@/types/system-settings";
import PopupManagementModal from "@/components/PopupManagementModal";

interface SettingStatus {
  key: string;
  hasValue: boolean;
  encrypted: boolean;
  updatedAt: Date;
}

interface RequiredCheck {
  isComplete: boolean;
  missing: SettingKey[];
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<SettingStatus[]>([]);
  const [requiredCheck, setRequiredCheck] = useState<RequiredCheck | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [showPopupManagement, setShowPopupManagement] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings");

      if (response.ok) {
        const data = await response.json();
        setSettingsStatus(data.settings || []);
        setRequiredCheck(data.requiredCheck || null);

        // 기본적으로 필수 설정이 누락된 카테고리는 펼치기
        if (data.requiredCheck && !data.requiredCheck.isComplete) {
          const newExpanded = new Set<string>();
          SETTING_CATEGORIES.forEach((category) => {
            const hasMissing = category.settings.some((field) =>
              data.requiredCheck.missing.includes(field.key)
            );
            if (hasMissing) {
              newExpanded.add(category.title);
            }
          });
          setExpandedCategories(newExpanded);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      alert("설정을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryTitle: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryTitle)) {
      newExpanded.delete(categoryTitle);
    } else {
      newExpanded.add(categoryTitle);
    }
    setExpandedCategories(newExpanded);
  };

  const handleInputChange = (key: SettingKey, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleShowValue = (key: SettingKey) => {
    setShowValues((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveCategory = async (category: SettingCategory) => {
    setSaving(true);
    try {
      const settingsToSave = category.settings
        .filter((field) => formValues[field.key] && formValues[field.key].trim() !== '')
        .map((field) => ({
          key: field.key,
          value: formValues[field.key],
          encrypted: field.encrypted,
        }));

      if (settingsToSave.length === 0) {
        alert("저장할 설정이 없습니다");
        return;
      }

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "설정이 저장되었습니다");

        // 폼 초기화
        const newFormValues = { ...formValues };
        settingsToSave.forEach(({ key }) => {
          delete newFormValues[key];
        });
        setFormValues(newFormValues);

        fetchSettings();
      } else {
        const data = await response.json();
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("서버 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  const generateRandomKey = (length: number = 64) => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const handleGenerateKey = (key: SettingKey) => {
    const randomKey = generateRandomKey(key === SettingKey.ENCRYPTION_KEY ? 64 : 32);
    handleInputChange(key, randomKey);
  };

  const hasSettingValue = (key: SettingKey): boolean => {
    return settingsStatus.some((s) => s.key === key && s.hasValue);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                시스템 설정
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                플랫폼의 환경 변수를 관리하세요. DATABASE_URL 외의 모든 설정을 여기서 관리할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setShowPopupManagement(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                notifications_active
              </span>
              <span>팝업 관리</span>
            </button>
          </div>

          {/* 필수 설정 완료 상태 */}
          {requiredCheck && (
            <div className={`mt-4 p-4 rounded-lg ${
              requiredCheck.isComplete
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {requiredCheck.isComplete ? '✅' : '⚠️'}
                </span>
                <div>
                  <p className={`font-medium ${
                    requiredCheck.isComplete ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {requiredCheck.isComplete
                      ? '모든 필수 설정이 완료되었습니다'
                      : `${requiredCheck.missing.length}개의 필수 설정이 누락되었습니다`
                    }
                  </p>
                  {!requiredCheck.isComplete && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      필수 설정을 완료해야 일부 기능이 정상적으로 작동합니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {SETTING_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.has(category.title);
            const categoryMissingCount = requiredCheck
              ? category.settings.filter((field) =>
                  field.required && requiredCheck.missing.includes(field.key)
                ).length
              : 0;

            return (
              <div
                key={category.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.title)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-black dark:text-white">
                        {category.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {categoryMissingCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded">
                        {categoryMissingCount}개 누락
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                      {category.settings.map((field) => {
                        const hasValue = hasSettingValue(field.key);
                        const isMissing = requiredCheck?.missing.includes(field.key);

                        return (
                          <div
                            key={field.key}
                            className={`p-4 rounded-lg border ${
                              isMissing
                                ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {field.label}
                                  {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                  {hasValue && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                      ✓ 설정됨
                                    </span>
                                  )}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {field.description}
                                </p>
                              </div>
                              {field.encrypted && (
                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                                  암호화
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <div className="flex-1 relative">
                                <input
                                  type={
                                    field.type === 'password' && !showValues[field.key]
                                      ? 'password'
                                      : 'text'
                                  }
                                  value={formValues[field.key] || ''}
                                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                                  placeholder={field.placeholder || `${field.label} 입력...`}
                                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                                />
                                {field.type === 'password' && (
                                  <button
                                    type="button"
                                    onClick={() => toggleShowValue(field.key)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                  >
                                    {showValues[field.key] ? '👁️' : '👁️‍🗨️'}
                                  </button>
                                )}
                              </div>

                              {(field.key === SettingKey.ENCRYPTION_KEY ||
                                field.key === SettingKey.JWT_SECRET ||
                                field.key === SettingKey.NEXTAUTH_SECRET) && (
                                <button
                                  type="button"
                                  onClick={() => handleGenerateKey(field.key)}
                                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm whitespace-nowrap"
                                >
                                  🎲 생성
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleSaveCategory(category)}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {saving ? '저장 중...' : '이 섹션 저장'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 도움말 */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 설정 가이드
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• <strong>필수 설정</strong>은 빨간색 별표(*)로 표시됩니다</li>
            <li>• <strong>암호화</strong> 라벨이 있는 값은 데이터베이스에 암호화되어 저장됩니다</li>
            <li>• <strong>랜덤 키 생성</strong> 버튼(🎲)을 클릭하여 안전한 키를 자동 생성할 수 있습니다</li>
            <li>• OAuth 설정은 각 제공자의 개발자 콘솔에서 발급받을 수 있습니다</li>
            <li>• Cloudflare R2 설정은 필수이며, 파일 저장에 사용됩니다</li>
            <li>• OpenAI API는 선택사항이며, AI 자동 번역 기능을 사용하려면 설정하세요</li>
          </ul>
        </div>
      </div>

      {/* 팝업 관리 모달 */}
      {showPopupManagement && (
        <PopupManagementModal
          onClose={() => setShowPopupManagement(false)}
          onSuccess={() => setShowPopupManagement(false)}
        />
      )}
    </div>
  );
}
