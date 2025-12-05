"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleSave = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert("서명을 입력해주세요");
      return;
    }

    const dataUrl = sigPadRef.current.toDataURL("image/png");
    onSave(dataUrl);
    setIsEmpty(true);
  };

  const handleClear = () => {
    sigPadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-black dark:text-white">
        ✍️ 전자 서명
      </h3>

      {/* 서명 캔버스 */}
      <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            className: "signature-canvas w-full h-48",
            style: { touchAction: "none" },
          }}
          backgroundColor="white"
          penColor="black"
          onBegin={handleBegin}
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          지우기
        </button>
        <button
          onClick={handleSave}
          disabled={isEmpty}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          저장
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        ℹ️ 위 박스에 서명을 작성해주세요
      </p>
    </div>
  );
}
