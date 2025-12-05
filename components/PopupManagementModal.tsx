"use client";

import { useState, useEffect } from "react";

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  order: number;
}

interface PopupManagementModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PopupManagementModal({
  onClose,
  onSuccess,
}: PopupManagementModalProps) {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [loading, setLoading] = useState(false);

  // 팝업 목록 조회
  const fetchPopups = async () => {
    try {
      const response = await fetch("/api/popups");
      const data = await response.json();
      setPopups(data);
    } catch (error) {
      console.error("Error fetching popups:", error);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  // 팝업 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("이 팝업을 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/popups/${id}`, { method: "DELETE" });
      fetchPopups();
    } catch (error) {
      console.error("Error deleting popup:", error);
      alert("팝업 삭제 중 오류가 발생했습니다");
    }
  };

  // 활성화/비활성화 토글
  const handleToggleActive = async (popup: Popup) => {
    try {
      await fetch(`/api/popups/${popup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...popup,
          isActive: !popup.isActive,
        }),
      });
      fetchPopups();
    } catch (error) {
      console.error("Error toggling popup:", error);
      alert("상태 변경 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            팝업 관리
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 팝업 추가 버튼 */}
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingPopup(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>새 팝업 추가</span>
            </button>
          </div>

          {/* 팝업 목록 */}
          <div className="space-y-4">
            {popups.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                등록된 팝업이 없습니다
              </div>
            ) : (
              popups.map((popup) => (
                <div
                  key={popup.id}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          {popup.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            popup.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {popup.isActive ? "활성" : "비활성"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <div>
                          <span className="font-medium">위치:</span> X:{" "}
                          {popup.positionX}px, Y: {popup.positionY}px
                        </div>
                        <div>
                          <span className="font-medium">크기:</span>{" "}
                          {popup.width}px × {popup.height}px
                        </div>
                        <div>
                          <span className="font-medium">시작일:</span>{" "}
                          {new Date(popup.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">종료일:</span>{" "}
                          {new Date(popup.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {popup.content}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(popup)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                      >
                        {popup.isActive ? "비활성화" : "활성화"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingPopup(popup);
                          setShowCreateModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(popup.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            닫기
          </button>
        </div>
      </div>

      {/* 팝업 생성/수정 모달 */}
      {showCreateModal && (
        <PopupFormModal
          popup={editingPopup}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPopup(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingPopup(null);
            fetchPopups();
          }}
        />
      )}
    </div>
  );
}

// 팝업 생성/수정 폼 모달
function PopupFormModal({
  popup,
  onClose,
  onSuccess,
}: {
  popup: Popup | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: popup?.title || "",
    content: popup?.content || "",
    imageUrl: popup?.imageUrl || "",
    positionX: popup?.positionX || 100,
    positionY: popup?.positionY || 100,
    width: popup?.width || 400,
    height: popup?.height || 300,
    startDate: "",
    endDate: "",
    isActive: popup?.isActive !== undefined ? popup.isActive : true,
    order: popup?.order || 0,
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // 클라이언트 측에서만 날짜 초기화
  useEffect(() => {
    if (popup?.startDate && popup?.endDate) {
      setFormData((prev) => ({
        ...prev,
        startDate: new Date(popup.startDate).toISOString().split("T")[0],
        endDate: new Date(popup.endDate).toISOString().split("T")[0],
      }));
    } else {
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setFormData((prev) => ({
        ...prev,
        startDate: today,
        endDate: thirtyDaysLater,
      }));
    }
  }, [popup]);

  // 이미지 업로드
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/r2", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 업로드 실패");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("이미지 업로드 중 오류가 발생했습니다");
    } finally {
      setUploading(false);
    }
  };

  // 폼 제출
  const handleSubmit = async () => {
    setError("");

    if (!formData.title || !formData.content) {
      setError("제목과 내용은 필수 입력 항목입니다");
      return;
    }

    try {
      const url = popup ? `/api/popups/${popup.id}` : "/api/popups";
      const method = popup ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("팝업 저장 실패");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving popup:", error);
      setError("팝업 저장 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {popup ? "팝업 수정" : "새 팝업 추가"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 오류 메시지 */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="팝업 제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white resize-vertical"
              placeholder="팝업 내용을 입력하세요"
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이미지 (선택사항)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            {uploading && (
              <p className="text-sm text-gray-500 mt-2">업로드 중...</p>
            )}
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded border border-gray-300 dark:border-gray-700"
                />
              </div>
            )}
          </div>

          {/* 위치 및 크기 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                위치 X (px)
              </label>
              <input
                type="number"
                value={formData.positionX}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    positionX: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                위치 Y (px)
              </label>
              <input
                type="number"
                value={formData.positionY}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    positionY: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                가로 크기 (px)
              </label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                세로 크기 (px)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    height: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
          </div>

          {/* 표시 기간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                시작일
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                종료일
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
          </div>

          {/* 표시 순서 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              표시 순서 (숫자가 낮을수록 먼저 표시)
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          {/* 활성화 여부 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                활성화 (체크 시 즉시 표시)
              </span>
            </label>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {popup ? "수정" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
