"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRIES } from "@/types";

interface PreviewData {
  title: string;
  duration: number;
  thumbnailUrl: string;
  provider: string;
  providerId?: string;
}

type UploadMethod = "url" | "file";

export default function NewVideoPage() {
  const router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    industry: [] as string[],
    category: [] as string[],
    isPublic: true,
  });

  // URL 미리보기
  const handlePreview = async () => {
    if (!videoUrl.trim()) {
      setError("영상 URL을 입력해주세요");
      return;
    }

    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const response = await fetch("/api/videos/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data.metadata);
        setFormData({
          ...formData,
          title: data.metadata.title,
        });
      } else {
        setError(data.error || "메타데이터를 가져올 수 없습니다");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (file: File) => {
    // 파일 크기 검증 (2GB)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("파일 크기는 2GB를 초과할 수 없습니다");
      return;
    }

    // 파일 형식 검증
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
    if (!allowedTypes.includes(file.type)) {
      setError("지원하지 않는 파일 형식입니다. MP4, WebM, MOV 등을 사용하세요.");
      return;
    }

    setSelectedFile(file);
    setError("");
    setFormData({
      ...formData,
      title: file.name.replace(/\.[^/.]+$/, ""),
    });
  };

  // Drag & Drop 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 파일 선택 버튼
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 파일 업로드
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("파일을 선택해주세요");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const xhr = new XMLHttpRequest();

      // 업로드 진행률
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // 업로드 완료
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setPreview(data.metadata);
          setFormData((prev) => ({
            ...prev,
            title: data.metadata.title,
          }));
        } else {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || "파일 업로드에 실패했습니다");
        }
        setLoading(false);
      });

      // 에러 처리
      xhr.addEventListener("error", () => {
        setError("네트워크 오류가 발생했습니다");
        setLoading(false);
      });

      xhr.open("POST", "/api/videos/upload");
      xhr.send(formData);

    } catch (err) {
      setError("파일 업로드 중 오류가 발생했습니다");
      setLoading(false);
    }
  };

  // 영상 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!preview) {
      setError(uploadMethod === "url" ? "먼저 URL 미리보기를 확인해주세요" : "먼저 파일을 업로드해주세요");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: uploadMethod === "url" ? videoUrl : `https://videodelivery.net/${preview.providerId}`,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("영상이 등록되었습니다!");
        router.push("/dashboard/videos");
      } else {
        setError(data.error || "영상 등록에 실패했습니다");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          영상 등록
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Vimeo/Cloudflare Stream URL을 입력하거나 파일을 직접 업로드하세요
        </p>
      </div>

      {/* 업로드 방식 선택 탭 */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setUploadMethod("url");
            setError("");
            setPreview(null);
            setSelectedFile(null);
          }}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            uploadMethod === "url"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          🔗 URL 입력
        </button>
        <button
          type="button"
          onClick={() => {
            setUploadMethod("file");
            setError("");
            setPreview(null);
            setVideoUrl("");
          }}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            uploadMethod === "file"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          📤 파일 업로드 (Cloudflare)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL 입력 방식 */}
        {uploadMethod === "url" && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            영상 URL *
          </label>
          <div className="flex gap-2">
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://vimeo.com/123456789 or https://cloudflarestream.com/..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handlePreview}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "확인 중..." : "미리보기"}
            </button>
          </div>

          {error && uploadMethod === "url" && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        )}

        {/* 파일 업로드 방식 */}
        {uploadMethod === "file" && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              영상 파일 선택 *
            </label>

            {/* Drag & Drop 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-green-500">
                      check_circle
                    </span>
                  </div>
                  <p className="text-lg font-medium text-black dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      다른 파일 선택
                    </button>
                    {!preview && (
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? "업로드 중..." : "업로드 시작"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-gray-400">
                      cloud_upload
                    </span>
                  </div>
                  <p className="text-lg font-medium text-black dark:text-white">
                    파일을 드래그하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    MP4, WebM, MOV 등 (최대 2GB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    파일 선택
                  </button>
                </div>
              )}
            </div>

            {/* 업로드 진행률 */}
            {loading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>업로드 중...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && uploadMethod === "file" && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}

        {/* 미리보기 */}
        {preview && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              미리보기
            </h3>
            <div className="flex gap-4">
              <img
                src={preview.thumbnailUrl}
                alt={preview.title}
                className="w-48 h-27 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  제공자: {preview.provider}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  재생 시간: {Math.floor(preview.duration / 60)}분 {preview.duration % 60}초
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 상세 정보 */}
        {preview && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              상세 정보
            </h3>

            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목 *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
            </div>

            {/* 업종 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                업종 (복수 선택 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {INDUSTRIES.map((industry) => (
                  <label key={industry.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={industry.value}
                      checked={formData.industry.includes(industry.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            industry: [...formData.industry, industry.value],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            industry: formData.industry.filter((i) => i !== industry.value),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{industry.icon} {industry.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 공개 설정 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  다른 사용자에게 공개
                </span>
              </label>
            </div>
          </div>
        )}

        {/* 버튼 */}
        {preview && (
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "등록 중..." : "등록하기"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
