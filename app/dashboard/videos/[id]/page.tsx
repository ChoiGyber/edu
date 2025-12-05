"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { INDUSTRIES, LANGUAGES, SubtitleTrack } from "@/types";

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  provider: string;
  providerId: string;
  videoUrl: string;
  embedHtml: string;
  industry: string[];
  category: string[];
  hasKoreanAudio: boolean;
  subtitles: SubtitleTrack[];
  aiTranslation: boolean;
  isPublic: boolean;
  viewCount: number;
  usedInCourses: number;
  createdAt: string;
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 자막 업로드 상태
  const [uploadingSubtitle, setUploadingSubtitle] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 번역 상태
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState<string[]>([]);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/videos/${id}`);
      const data = await response.json();

      if (response.ok) {
        setVideo(data.video);
      } else {
        setError(data.error || "영상을 불러올 수 없습니다");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtitleUpload = async () => {
    if (!selectedFile || !selectedLanguage) {
      alert("언어와 파일을 선택해주세요");
      return;
    }

    const language = LANGUAGES.find((l) => l.code === selectedLanguage);
    if (!language) return;

    setUploadingSubtitle(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("language", language.code);
      formData.append("label", language.label);

      const response = await fetch(`/api/videos/${id}/subtitles`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "자막이 업로드되었습니다");
        setSelectedFile(null);
        setSelectedLanguage("");
        fetchVideo(); // 영상 정보 새로고침
      } else {
        alert(data.error || "자막 업로드에 실패했습니다");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다");
    } finally {
      setUploadingSubtitle(false);
    }
  };

  const handleSubtitleDelete = async (language: string) => {
    if (!confirm("이 자막을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `/api/videos/${id}/subtitles?language=${language}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("자막이 삭제되었습니다");
        fetchVideo(); // 영상 정보 새로고침
      } else {
        alert(data.error || "자막 삭제에 실패했습니다");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다");
    }
  };

  const handleAITranslate = async () => {
    if (selectedTargetLanguages.length === 0) {
      alert("번역할 언어를 선택해주세요");
      return;
    }

    // 한국어 자막이 있는지 확인
    const koreanSubtitle = video?.subtitles?.find((sub) => sub.language === "ko");
    if (!koreanSubtitle) {
      alert("AI 번역을 위해서는 먼저 한국어 자막을 업로드해주세요");
      return;
    }

    if (!confirm(`${selectedTargetLanguages.length}개 언어로 AI 번역을 시작하시겠습니까?\n\n번역에는 수 분이 소요될 수 있습니다.`)) {
      return;
    }

    setIsTranslating(true);

    try {
      const response = await fetch(`/api/videos/${id}/ai-subtitles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceLanguage: "ko",
          targetLanguages: selectedTargetLanguages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "AI 번역이 완료되었습니다");
        setSelectedTargetLanguages([]);
        fetchVideo(); // 영상 정보 새로고침
      } else {
        alert(data.error || "AI 번역에 실패했습니다");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다");
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleTargetLanguage = (langCode: string) => {
    if (selectedTargetLanguages.includes(langCode)) {
      setSelectedTargetLanguages(selectedTargetLanguages.filter((l) => l !== langCode));
    } else {
      setSelectedTargetLanguages([...selectedTargetLanguages, langCode]);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
        <Link
          href="/dashboard/videos"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← 영상 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 이미 업로드된 언어 필터링
  const availableLanguages = LANGUAGES.filter(
    (lang) => !video.subtitles?.find((sub) => sub.language === lang.code)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/dashboard/videos"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← 영상 목록
        </Link>
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {video.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 영상 플레이어 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 썸네일/플레이어 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{video.provider}</span>
                <span>{formatDuration(video.duration)}</span>
              </div>
            </div>
          </div>

          {/* 설명 */}
          {video.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
                설명
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          {/* 자막 관리 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              자막 관리
            </h2>

            {/* 자막 목록 */}
            {video.subtitles && video.subtitles.length > 0 ? (
              <div className="mb-6 space-y-2">
                {video.subtitles.map((subtitle) => {
                  const lang = LANGUAGES.find((l) => l.code === subtitle.language);
                  return (
                    <div
                      key={subtitle.language}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang?.flag || "🏳️"}</span>
                        <div>
                          <p className="font-medium text-black dark:text-white">
                            {subtitle.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {subtitle.format.toUpperCase()} • {subtitle.source === "AI" ? "AI 생성" : "수동 업로드"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={subtitle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          다운로드
                        </a>
                        <button
                          onClick={() => handleSubtitleDelete(subtitle.language)}
                          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                아직 업로드된 자막이 없습니다
              </p>
            )}

            {/* 자막 업로드 폼 */}
            {availableLanguages.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      언어 선택
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                    >
                      <option value="">선택하세요</option>
                      {availableLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      파일 선택 (SRT/VTT)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".srt,.vtt"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubtitleUpload}
                  disabled={!selectedLanguage || !selectedFile || uploadingSubtitle}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingSubtitle ? "업로드 중..." : "자막 업로드"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                모든 언어의 자막이 업로드되었습니다
              </p>
            )}
          </div>

          {/* AI 자동 번역 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black dark:text-white">
                AI 자동 번역
              </h2>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                OpenAI GPT-4
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              한국어 자막을 기반으로 여러 언어로 자동 번역합니다
            </p>

            {/* 한국어 자막 확인 */}
            {video.subtitles?.find((sub) => sub.language === "ko") ? (
              <div className="space-y-4">
                {/* 번역 가능한 언어 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    번역할 언어 선택
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {LANGUAGES.filter((lang) => lang.code !== "ko").map((lang) => {
                      const alreadyTranslated = video.subtitles?.find(
                        (sub) => sub.language === lang.code && sub.source === "AI"
                      );
                      const isSelected = selectedTargetLanguages.includes(lang.code);

                      return (
                        <button
                          key={lang.code}
                          onClick={() => toggleTargetLanguage(lang.code)}
                          disabled={!!alreadyTranslated || isTranslating}
                          className={`p-3 border rounded-lg transition flex items-center gap-2 ${
                            alreadyTranslated
                              ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 cursor-not-allowed"
                              : isSelected
                              ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                          }`}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-black dark:text-white">
                              {lang.label}
                            </p>
                            {alreadyTranslated && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                번역 완료
                              </p>
                            )}
                          </div>
                          {isSelected && !alreadyTranslated && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI 번역 시작 버튼 */}
                <button
                  onClick={handleAITranslate}
                  disabled={selectedTargetLanguages.length === 0 || isTranslating}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {isTranslating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>AI 번역 중...</span>
                    </div>
                  ) : (
                    `AI 번역 시작 (${selectedTargetLanguages.length}개 언어)`
                  )}
                </button>

                {/* 안내 메시지 */}
                {selectedTargetLanguages.length > 0 && !isTranslating && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      선택한 {selectedTargetLanguages.length}개 언어로 번역됩니다. 번역에는 수 분이 소요될 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  AI 번역을 사용하려면 먼저 한국어 자막을 업로드해주세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 정보 */}
        <div className="space-y-6">
          {/* 통계 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              통계
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">조회수</span>
                <span className="font-medium text-black dark:text-white">
                  {video.viewCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">사용 중인 과정</span>
                <span className="font-medium text-black dark:text-white">
                  {video.usedInCourses}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">등록일</span>
                <span className="font-medium text-black dark:text-white">
                  {new Date(video.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </div>
          </div>

          {/* 업종 */}
          {video.industry.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                업종
              </h2>
              <div className="flex flex-wrap gap-2">
                {video.industry.map((ind) => {
                  const industry = INDUSTRIES.find((i) => i.value === ind);
                  return industry ? (
                    <span
                      key={ind}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {industry.icon} {industry.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* 공개 설정 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              공개 설정
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {video.isPublic ? "🌐 공개 (모든 사용자)" : "🔒 비공개 (나만 보기)"}
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              교육 과정에 추가
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              편집
            </button>
            <button className="w-full px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
