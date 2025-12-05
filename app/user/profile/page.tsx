"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  companyName: string;
  siteName?: string;
  industry: string;
  role: string;
  preferredLanguages: string[];
  emailNotification: boolean;
  createdAt: string;
}

const INDUSTRIES = [
  { value: "CONSTRUCTION", label: "건설업" },
  { value: "MANUFACTURING", label: "제조업" },
  { value: "LOGISTICS", label: "물류/운송" },
  { value: "FOOD", label: "식음료" },
  { value: "CHEMICAL", label: "화학" },
  { value: "ELECTRICITY", label: "전기/전자" },
  { value: "SERVICE", label: "서비스업" },
  { value: "ETC", label: "기타" },
];

const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "zh", label: "中文" },
  { code: "th", label: "ไทย" },
];

export default function UserProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    companyName: "",
    siteName: "",
    industry: "",
    preferredLanguages: [] as string[],
    emailNotification: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (response.ok && data.user) {
        setProfile(data.user);
        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          companyName: data.user.companyName || "",
          siteName: data.user.siteName || "",
          industry: data.user.industry || "",
          preferredLanguages: data.user.preferredLanguages || ["ko"],
          emailNotification: data.user.emailNotification || false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setEditing(false);
        alert("프로필이 업데이트되었습니다");
      } else {
        alert(data.error || "업데이트에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("서버 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (langCode: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(langCode)
        ? prev.preferredLanguages.filter((l) => l !== langCode)
        : [...prev.preferredLanguages, langCode],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">프로필을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            내 정보
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            개인 정보를 확인하고 수정하세요
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>수정</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  name: profile.name || "",
                  phone: profile.phone || "",
                  companyName: profile.companyName || "",
                  siteName: profile.siteName || "",
                  industry: profile.industry || "",
                  preferredLanguages: profile.preferredLanguages || ["ko"],
                  emailNotification: profile.emailNotification || false,
                });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>{saving ? "저장 중..." : "저장"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Avatar Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">
                {profile.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
              <div className="mt-1">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    profile.role === "ADMIN"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : profile.role === "SUB_ADMIN"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {profile.role === "ADMIN"
                    ? "관리자"
                    : profile.role === "SUB_ADMIN"
                    ? "보조 관리자"
                    : "일반 사용자"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              기본 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  이름
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-black dark:text-white">
                    {profile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  전화번호
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-black dark:text-white">
                    {profile.phone || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  회사명
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-black dark:text-white">
                    {profile.companyName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  현장명
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) =>
                      setFormData({ ...formData, siteName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-black dark:text-white">
                    {profile.siteName || "-"}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  업종
                </label>
                {editing ? (
                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                  >
                    {INDUSTRIES.map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-black dark:text-white">
                    {INDUSTRIES.find((i) => i.value === profile.industry)?.label ||
                      profile.industry}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              환경 설정
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  선호 언어
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => editing && toggleLanguage(lang.code)}
                      disabled={!editing}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        formData.preferredLanguages.includes(lang.code)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${!editing ? "cursor-default" : "cursor-pointer hover:opacity-80"}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailNotification}
                    onChange={(e) =>
                      editing &&
                      setFormData({ ...formData, emailNotification: e.target.checked })
                    }
                    disabled={!editing}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    교육 관련 이메일 알림 받기
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              계정 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">이메일</span>
                <span className="text-black dark:text-white font-medium">
                  {profile.email}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">가입일</span>
                <span className="text-black dark:text-white font-medium">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">계정 ID</span>
                <span className="text-black dark:text-white font-mono text-xs">
                  {profile.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
          위험 구역
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </p>
        <button
          onClick={() => {
            if (
              confirm(
                "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
              )
            ) {
              // TODO: Implement account deletion
              alert("계정 삭제 기능은 아직 구현되지 않았습니다");
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          계정 삭제
        </button>
      </div>
    </div>
  );
}
