"use client";

import { useState, useRef, useEffect } from "react";

interface DraggablePopupProps {
  popup: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
  };
  onClose: () => void;
  onDismiss: (days: number) => void;
}

export default function DraggablePopup({
  popup,
  onClose,
  onDismiss,
}: DraggablePopupProps) {
  const [position, setPosition] = useState({
    x: popup.positionX,
    y: popup.positionY,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!popupRef.current) return;

    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // 드래그 중
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={popupRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${popup.width}px`,
        height: `${popup.height}px`,
        zIndex: 1000,
      }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-300 dark:border-gray-700"
    >
      {/* 헤더 (드래그 핸들) */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-3 cursor-move flex items-center justify-between"
      >
        <h3 className="font-semibold text-sm">{popup.title}</h3>
        <button
          onClick={onClose}
          className="hover:bg-blue-700 dark:hover:bg-blue-800 rounded p-1"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* 내용 */}
      <div className="p-4 overflow-y-auto" style={{ height: "calc(100% - 100px)" }}>
        {/* 이미지 */}
        {popup.imageUrl && (
          <div className="mb-4">
            <img
              src={popup.imageUrl}
              alt={popup.title}
              className="w-full h-auto rounded"
            />
          </div>
        )}

        {/* 텍스트 내용 */}
        <div className="text-sm text-black dark:text-white whitespace-pre-wrap">
          {popup.content}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="border-t border-gray-300 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => onDismiss(1)}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
        >
          오늘 하루 보지 않기
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
