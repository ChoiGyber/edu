"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyQRToken } from "@/lib/qr/qr-token";
import { LANGUAGES } from "@/types";

interface Course {
  id: string;
  title: string;
  totalDuration: number;
  nodes: any[];
}

function MobileLearnContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [language, setLanguage] = useState("ko");
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [completedVideos, setCompletedVideos] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (token) {
      verifyAndLoadCourse();
    } else {
      setError("유효하지 않은 접근입니다");
      setLoading(false);
    }
  }, [token]);

  const verifyAndLoadCourse = async () => {
    try {
      // 토큰 검증 (클라이언트 사이드)
      const payload = verifyQRToken(token!);

      if (!payload) {
        setError("만료되었거나 유효하지 않은 QR 코드입니다");
        setLoading(false);
        return;
      }

      setSessionId(payload.sessionId);
      setHistoryId(payload.historyId || null);
      setLanguage(payload.language || "ko");

      // 교육 과정 정보 조회
      const response = await fetch(`/api/courses/${payload.courseId}`);
      const data = await response.json();

      if (response.ok) {
        setCourse({
          ...data.course,
          nodes: JSON.parse(data.course.nodes),
        });
      } else {
        setError("교육 과정을 불러올 수 없습니다");
      }
    } catch (err) {
      setError("오류가 발생했습니다");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const videoNodes = course?.nodes.filter((node) => node.type === "VIDEO") || [];
  const currentNode = videoNodes[currentNodeIndex];

  const handleVideoEnd = () => {
    // 현재 영상 완료 표시
    setCompletedVideos((prev) => new Set(prev).add(currentNodeIndex));

    // 자동으로 다음 영상으로 이동
    if (currentNodeIndex < videoNodes.length - 1) {
      setTimeout(() => {
        setCurrentNodeIndex(currentNodeIndex + 1);
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentNodeIndex < videoNodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    } else {
      // 모든 영상 완료 - 완료 QR 페이지로 이동
      if (historyId) {
        window.location.href = `/mobile/verify?historyId=${historyId}&language=${language}`;
      }
    }
  };

  const handlePrevious = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(currentNodeIndex - 1);
    }
  };

  const selectedLanguageInfo = LANGUAGES.find((l) => l.code === language);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">오류</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="bg-gray-800 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{course.title}</h1>
            <p className="text-sm text-gray-400">
              {selectedLanguageInfo?.flag} {selectedLanguageInfo?.label}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">
              {currentNodeIndex + 1} / {videoNodes.length}
            </div>
          </div>
        </div>
      </div>

      {/* 영상 재생 영역 */}
      {currentNode && (
        <div className="relative">
          {/* 영상 플레이어 */}
          <div className="aspect-video bg-black">
            {/* Vimeo 플레이어 */}
            {currentNode.data.videoProvider === "VIMEO" && currentNode.data.videoId && (
              <iframe
                src={`https://player.vimeo.com/video/${currentNode.data.videoId}?autoplay=1&texttrack=${language}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  // Vimeo Player API로 종료 이벤트 감지 가능
                }}
              />
            )}

            {/* Cloudflare Stream 플레이어 */}
            {currentNode.data.videoProvider === "CLOUDFLARE" && currentNode.data.videoUrl && (
              <video
                key={currentNodeIndex}
                controls
                autoPlay
                playsInline
                className="w-full h-full"
                onEnded={handleVideoEnd}
              >
                <source src={currentNode.data.videoUrl} type="video/mp4" />

                {/* 자막 트랙 */}
                {currentNode.data.subtitleUrl && (
                  <track
                    kind="captions"
                    src={currentNode.data.subtitleUrl}
                    srcLang={language}
                    label={selectedLanguageInfo?.label || language}
                    default
                  />
                )}

                Your browser does not support the video tag.
              </video>
            )}

            {/* 영상 정보가 없는 경우 */}
            {!currentNode.data.videoProvider && (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <img
                  src={currentNode.data.videoThumbnail || "/placeholder.png"}
                  alt={currentNode.data.videoTitle}
                  className="max-w-full max-h-64 object-contain mb-4"
                />
                <p className="text-xl font-semibold text-center">{currentNode.data.videoTitle}</p>
                <p className="text-sm text-gray-400 mt-2">
                  ⏱ {Math.floor(currentNode.data.videoDuration / 60)}:
                  {(currentNode.data.videoDuration % 60).toString().padStart(2, "0")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 컨트롤 */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentNodeIndex === 0}
            className="flex-1 px-6 py-3 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            ← 이전
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {currentNodeIndex < videoNodes.length - 1 ? "다음 →" : "완료 ✓"}
          </button>
        </div>

        {/* 진행률 바 */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(completedVideos.size / videoNodes.length) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            진행률: {Math.round((completedVideos.size / videoNodes.length) * 100)}% ({completedVideos.size}/{videoNodes.length} 완료)
          </p>
        </div>

        {/* 영상 목록 */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">영상 목록</h3>
          <div className="space-y-2">
            {videoNodes.map((node, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentNodeIndex(idx)}
                className={`w-full p-3 rounded-lg text-left transition ${
                  idx === currentNodeIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {idx + 1}. {node.data.videoTitle || "제목 없음"}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      {Math.floor(node.data.videoDuration / 60)}:
                      {(node.data.videoDuration % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                  <div className="ml-2">
                    {completedVideos.has(idx) ? (
                      <span className="text-green-400 text-xl">✓</span>
                    ) : idx === currentNodeIndex ? (
                      <span className="text-blue-400 text-xl">▶</span>
                    ) : (
                      <span className="text-gray-600 text-xl">○</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function MobileLearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <MobileLearnContent />
    </Suspense>
  );
}
