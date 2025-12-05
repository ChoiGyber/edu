'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LanguageSelectionModal from '@/components/LanguageSelectionModal';
import { EducationNode, EducationEdge } from '@/types/education-node';

interface CourseData {
  id: string;
  title: string;
  description?: string;
  nodes: EducationNode[];
  edges: EducationEdge[];
  totalDuration: number;
}

/**
 * 교육 실행 페이지
 * Phase 3: 교육 실행 및 QR 시스템
 */
export default function EducationExecutePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [showLanguageModal, setShowLanguageModal] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{
    token: string;
    qrCodeUrl: string;
    mobileUrl: string;
  } | null>(null);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 언어 선택 핸들러
  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setShowLanguageModal(false);
    setLoading(true);

    try {
      // 교육 시작 API 호출
      const response = await fetch('/api/education/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          language: languageCode,
          qrTokenExpiry: 30,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCourse(data.course);
        setHistoryId(data.historyId);
        setSessionId(data.sessionId);
        setQrData(data.qrData);
      } else {
        alert(data.error || '교육 시작에 실패했습니다');
        router.back();
      }
    } catch (error) {
      console.error('Start education error:', error);
      alert('서버 오류가 발생했습니다');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // 노드 목록 가져오기
  const getVideoNodes = () => {
    if (!course) return [];
    return course.nodes.filter((node) => node.type === 'VIDEO');
  };

  const videoNodes = getVideoNodes();
  const currentNode = videoNodes[currentNodeIndex];

  // 다음 영상으로 이동
  const handleNextVideo = () => {
    if (currentNodeIndex < videoNodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    } else {
      // 모든 영상 완료
      handleComplete();
    }
  };

  // 교육 완료 핸들러
  const handleComplete = async () => {
    if (!confirm('교육을 종료하시겠습니까?')) {
      return;
    }

    // TODO: 교육 완료 API 호출 후 증빙 QR 표시
    router.push(`/dashboard/education/${historyId}/verify`);
  };

  // 로딩 화면
  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">교육 준비 중...</p>
        </div>
      </div>
    );
  }

  // 한국어: PC 재생
  if (selectedLanguage === 'ko') {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* 상단 헤더 */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {currentNodeIndex + 1} / {videoNodes.length} 영상
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              종료
            </button>
          </div>
        </div>

        {/* 영상 재생 영역 */}
        <div className="max-w-7xl mx-auto p-6">
          {currentNode && (
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              {/* 영상 플레이어 */}
              <div className="aspect-video bg-black">
                {currentNode.data.videoProvider === 'VIMEO' && (
                  <iframe
                    src={`https://player.vimeo.com/video/${currentNode.data.videoId}?autoplay=1&texttrack=ko`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {currentNode.data.videoProvider === 'CLOUDFLARE' && (
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    autoPlay
                    onEnded={handleNextVideo}
                  >
                    <source src={currentNode.data.videoUrl} type="video/mp4" />
                    <track kind="captions" srcLang="ko" label="한국어" default />
                  </video>
                )}
              </div>

              {/* 영상 정보 */}
              <div className="p-6 bg-gray-800">
                <h2 className="text-xl font-bold text-white mb-2">
                  {currentNode.data.videoTitle}
                </h2>
                {currentNode.data.description && (
                  <p className="text-gray-400">{currentNode.data.description}</p>
                )}

                {/* 진행률 바 */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>진행률</span>
                    <span>
                      {Math.round(((currentNodeIndex + 1) / videoNodes.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentNodeIndex + 1) / videoNodes.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setCurrentNodeIndex(Math.max(0, currentNodeIndex - 1))}
                    disabled={currentNodeIndex === 0}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전 영상
                  </button>
                  <button
                    onClick={handleNextVideo}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {currentNodeIndex < videoNodes.length - 1 ? '다음 영상' : '교육 완료'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 외국어: QR 코드 표시
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center">
          {/* 언어 정보 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              모바일에서 QR 코드를 스캔하여 교육을 시청하세요
            </p>
          </div>

          {/* QR 코드 */}
          {qrData && (
            <div className="mb-8">
              <div className="inline-block p-6 bg-white rounded-2xl shadow-lg">
                <img
                  src={qrData.qrCodeUrl}
                  alt="QR Code"
                  className="w-80 h-80 mx-auto"
                />
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  스마트폰으로 QR 코드를 스캔하세요
                </h3>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>스마트폰 카메라 앱을 실행하세요</li>
                  <li>위의 QR 코드를 화면에 맞추세요</li>
                  <li>화면에 나타나는 링크를 클릭하세요</li>
                  <li>모바일 브라우저에서 교육 영상이 재생됩니다</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowLanguageModal(true);
                setSelectedLanguage(null);
              }}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              언어 다시 선택
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              종료
            </button>
          </div>
        </div>
      </div>

      {/* 언어 선택 모달 */}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onSelect={handleLanguageSelect}
      />
    </div>
  );
}
