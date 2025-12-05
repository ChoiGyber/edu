"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryManagementModalProps {
  onClose: () => void;
}

// 사용 가능한 아이콘 리스트
const AVAILABLE_ICONS = [
  "🏭", "⚗️", "🏗️", "📚", "📋", "🔧", "⚙️", "🔨",
  "🏢", "🏪", "🏬", "🏭", "🏗️", "⛏️", "🔩", "⚡",
  "🔥", "💧", "🌊", "🌲", "🌳", "🍃", "🌾", "🌿",
  "🍔", "🍕", "🍗", "🥘", "🍱", "🍜", "☕", "🍺",
  "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
  "🚒", "🚐", "🚚", "🚛", "🚜", "✈️", "🚁", "🚂",
  "📦", "📮", "📫", "📪", "📬", "📭", "📄", "📃",
  "📑", "📊", "📈", "📉", "💼", "📁", "📂", "🗂️",
];

export default function CategoryManagementModal({
  onClose,
}: CategoryManagementModalProps) {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "제조", icon: "🏭" },
    { id: "2", name: "화학", icon: "⚗️" },
    { id: "3", name: "건설", icon: "🏗️" },
    { id: "4", name: "공통", icon: "📚" },
    { id: "5", name: "일반", icon: "📋" },
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📁");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [iconPickerType, setIconPickerType] = useState<"new" | "edit">("new");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert("카테고리 이름을 입력하세요");
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon || "📁",
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setNewCategoryIcon("");
  };

  const handleEditStart = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditIcon(category.icon || "");
  };

  const handleEditSave = (id: string) => {
    if (!editName.trim()) {
      alert("카테고리 이름을 입력하세요");
      return;
    }

    setCategories(
      categories.map((cat) =>
        cat.id === id
          ? { ...cat, name: editName.trim(), icon: editIcon }
          : cat
      )
    );
    setEditingId(null);
    setEditName("");
    setEditIcon("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            카테고리 관리
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

        {/* 새 카테고리 추가 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-black dark:text-white mb-3">
            새 카테고리 추가
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIconPickerType("new");
                setShowIconPicker(true);
              }}
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition text-2xl text-center bg-white dark:bg-gray-600"
            >
              {newCategoryIcon}
            </button>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              placeholder="카테고리 이름"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-black dark:text-white"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>추가</span>
            </button>
          </div>
        </div>

        {/* 카테고리 목록 */}
        <div>
          <h3 className="font-semibold text-black dark:text-white mb-3">
            등록된 카테고리
          </h3>
          {categories.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              등록된 카테고리가 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  {editingId === category.id ? (
                    <>
                      {/* 편집 모드 */}
                      <button
                        type="button"
                        onClick={() => {
                          setIconPickerType("edit");
                          setShowEditIconPicker(true);
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition text-2xl text-center bg-white dark:bg-gray-600"
                      >
                        {editIcon}
                      </button>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-black dark:text-white"
                      />
                      <button
                        onClick={() => handleEditSave(category.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 보기 모드 */}
                      <span className="text-2xl w-12 text-center">
                        {category.icon}
                      </span>
                      <span className="flex-1 text-black dark:text-white font-medium">
                        {category.name}
                      </span>
                      <button
                        onClick={() => handleEditStart(category)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition"
                        title="수정"
                      >
                        <span className="material-symbols-outlined text-sm text-gray-600 dark:text-gray-400">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                        title="삭제"
                      >
                        <span className="material-symbols-outlined text-sm text-red-600 dark:text-red-400">
                          delete
                        </span>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            닫기
          </button>
          <button
            onClick={() => {
              // TODO: API 호출로 카테고리 저장
              alert("카테고리가 저장되었습니다");
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            저장하고 닫기
          </button>
        </div>
      </div>

      {/* 아이콘 선택 팝업 (새 카테고리) */}
      {showIconPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">
                아이콘 선택
              </h3>
              <button
                onClick={() => setShowIconPicker(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
              {AVAILABLE_ICONS.map((icon, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setNewCategoryIcon(icon);
                    setShowIconPicker(false);
                  }}
                  className="p-3 text-2xl hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition border border-gray-200 dark:border-gray-600"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 아이콘 선택 팝업 (편집) */}
      {showEditIconPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">
                아이콘 선택
              </h3>
              <button
                onClick={() => setShowEditIconPicker(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
              {AVAILABLE_ICONS.map((icon, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setEditIcon(icon);
                    setShowEditIconPicker(false);
                  }}
                  className="p-3 text-2xl hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition border border-gray-200 dark:border-gray-600"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
