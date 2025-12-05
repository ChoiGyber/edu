"use client";

import { useState, useRef } from "react";

type UploadMethod = "url" | "file";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface VideoUploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  userRole?: string; // "ADMIN", "SUB_ADMIN", "USER"
}

interface PreviewData {
  title: string;
  duration: number;
  thumbnailUrl: string;
  provider: string;
  providerId?: string;
}

export default function VideoUploadModal({
  onClose,
  onSuccess,
  userRole = "USER",
}: VideoUploadModalProps) {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
    isPublic: true,
  });

  const [tagInput, setTagInput] = useState("");

  // Categories (same as CategoryManagementModal)
  const [categories] = useState<Category[]>([
    { id: "1", name: "제조", icon: "🏭" },
    { id: "2", name: "화학", icon: "⚗️" },
    { id: "3", name: "건설", icon: "🏗️" },
    { id: "4", name: "공통", icon: "📚" },
    { id: "5", name: "일반", icon: "📋" },
  ]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data.metadata);
        setFormData({ ...formData, title: data.metadata.title });
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
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > MAX_SIZE) {
      setError("파일 크기는 2GB를 초과할 수 없습니다");
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("지원하지 않는 파일 형식입니다");
      return;
    }

    setSelectedFile(file);
    setError("");
    setFormData({
      ...formData,
      title: file.name.replace(/\.[^/.]+$/, ""),
    });
  };

  // Drag & Drop
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

    const formDataUpload = new FormData();
    formDataUpload.append("file", selectedFile);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setPreview(data.metadata);
        setFormData((prev) => ({ ...prev, title: data.metadata.title }));
      } else {
        setError("파일 업로드에 실패했습니다");
      }
      setLoading(false);
    });

    xhr.addEventListener("error", () => {
      setError("네트워크 오류가 발생했습니다");
      setLoading(false);
    });

    xhr.open("POST", "/api/videos/upload");
    xhr.send(formDataUpload);
  };

  // 태그 입력 처리 (쉼표 자동 분리)
  const handleTagInputChange = (value: string) => {
    // 쉼표가 입력되면 자동으로 태그 추가
    if (value.includes(",")) {
      const newTags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag && !formData.tags.includes(tag));

      if (newTags.length > 0) {
        setFormData({ ...formData, tags: [...formData.tags, ...newTags] });
      }
      setTagInput("");
    } else {
      setTagInput(value);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  // 영상 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // URL 방식이거나 파일 업로드가 완료되었는지 확인
    if (uploadMethod === "url" && !videoUrl.trim()) {
      setError("영상 URL을 입력해주세요");
      return;
    }

    if (uploadMethod === "file" && !selectedFile && !preview) {
      setError("파일을 선택하고 업로드해주세요");
      return;
    }

    if (!formData.title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }

    if (!formData.category) {
      setError("카테고리를 선택해주세요");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl:
            uploadMethod === "url"
              ? videoUrl
              : preview
              ? `https://videodelivery.net/${preview.providerId}`
              : "",
          title: formData.title,
          description: formData.content,
          category: [formData.category],
          tags: formData.tags,
          isPublic: formData.isPublic,
        }),
      });

      if (response.ok) {
        alert("영상이 등록되었습니다!");
        onSuccess?.();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "영상 등록에 실패했습니다");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              영상 등록
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
            {/* 업로드 방식 선택 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setUploadMethod("url");
                  setError("");
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                  uploadMethod === "url"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                  uploadMethod === "file"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                📤 파일 업로드
              </button>
            </div>

            {/* URL 입력 */}
            {uploadMethod === "url" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  영상 URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://vimeo.com/123456789"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "확인 중..." : "미리보기"}
                  </button>
                </div>
              </div>
            )}

            {/* 파일 업로드 */}
            {uploadMethod === "file" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  영상 파일 *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <span className="material-symbols-outlined text-4xl text-green-500">
                        check_circle
                      </span>
                      <p className="font-medium text-black dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg"
                        >
                          다른 파일
                        </button>
                        {!preview && (
                          <button
                            type="button"
                            onClick={handleFileUpload}
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"
                          >
                            {loading ? "업로드 중..." : "업로드"}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="material-symbols-outlined text-4xl text-gray-400">
                        cloud_upload
                      </span>
                      <p className="font-medium text-black dark:text-white">
                        파일을 드래그하거나 클릭하여 선택
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        MP4, WebM, MOV (최대 2GB)
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        파일 선택
                      </button>
                    </div>
                  )}
                </div>

                {/* 업로드 진행률 */}
                {loading && uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>업로드 중...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* 미리보기 */}
            {preview && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-black dark:text-white mb-2">
                  미리보기
                </h3>
                <div className="flex gap-4">
                  <img
                    src={preview.thumbnailUrl}
                    alt={preview.title}
                    className="w-32 h-18 object-cover rounded"
                  />
                  <div className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      제공자: {preview.provider}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      시간: {Math.floor(preview.duration / 60)}분{" "}
                      {preview.duration % 60}초
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 상세 정보 */}
            <>
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    교육 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                    required
                  />
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    카테고리 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                    required
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 태그 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    태그 (검색용)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInputChange(e.target.value)}
                    placeholder="태그 사이에 , 를 넣어 구분하세요 (예: 안전교육,제조업,화학)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white mb-2"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-600"
                          >
                            <span className="material-symbols-outlined text-xs">
                              close
                            </span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 교육 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    교육 내용
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white resize-vertical"
                    placeholder="교육 내용을 작성하세요..."
                  />
                </div>

                {/* 공개 설정 - 일반 사용자만 표시 */}
                {userRole !== "ADMIN" && userRole !== "SUB_ADMIN" && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) =>
                          setFormData({ ...formData, isPublic: e.target.checked })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        다른 사용자에게 공개
                      </span>
                    </label>
                  </div>
                )}

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
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "등록 중..." : "등록하기"}
                  </button>
                </div>
              </>
          </form>
        </div>
      </div>
    </>
  );
}
