"use client";

import { useRef, useState } from "react";

interface SelfieCaptureProps {
  onCapture: (dataUrl: string) => void;
}

export default function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // 전면 카메라
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setCaptured(false);
      setCapturedImage(null);
    } catch (error) {
      console.error("Camera access error:", error);
      alert("카메라 권한을 허용해주세요");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // 캔버스 크기 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 캔버스에 비디오 프레임 그리기
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);

      // Data URL 생성
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      setCaptured(true);
      onCapture(dataUrl);

      // 카메라 종료
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const retake = () => {
    setCaptured(false);
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-black dark:text-white">
        📷 셀카 촬영
      </h3>

      {/* 비디오/이미지 영역 */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        {!captured ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          capturedImage && (
            <img
              src={capturedImage}
              alt="Captured selfie"
              className="w-full h-full object-cover"
            />
          )
        )}
      </div>

      {/* 캔버스 (숨김) */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* 버튼 */}
      <div className="flex gap-2">
        {!stream && !captured && (
          <button
            onClick={startCamera}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            카메라 시작
          </button>
        )}

        {stream && !captured && (
          <button
            onClick={capturePhoto}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            촬영하기
          </button>
        )}

        {captured && (
          <button
            onClick={retake}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            다시 촬영
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        ℹ️ 얼굴이 잘 보이도록 촬영해주세요
      </p>
    </div>
  );
}
