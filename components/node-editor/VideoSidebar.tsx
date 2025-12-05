"use client";

import { useState, useEffect } from "react";

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  provider: string;
}

export default function VideoSidebar() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVideos();
  }, [search]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "50",
      });
      if (search) params.set("search", search);

      const response = await fetch(`/api/videos?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = (event: React.DragEvent, video: Video) => {
    event.dataTransfer.setData("application/reactflow-type", "VIDEO");
    event.dataTransfer.setData(
      "application/reactflow-data",
      JSON.stringify({
        videoId: video.id,
        videoTitle: video.title,
        videoDuration: video.duration,
        videoThumbnail: video.thumbnailUrl,
      })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
          영상 라이브러리
        </h3>
        <input
          type="text"
          placeholder="영상 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
        />
      </div>

      {/* 기본 노드 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          기본 노드
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div
            className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 text-center"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/reactflow-type", "START");
              e.dataTransfer.effectAllowed = "move";
            }}
          >
            <div className="text-2xl mb-1">▶️</div>
            <div className="text-xs text-gray-700 dark:text-gray-300">시작</div>
          </div>
          <div
            className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 text-center"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/reactflow-type", "END");
              e.dataTransfer.effectAllowed = "move";
            }}
          >
            <div className="text-2xl mb-1">⏹️</div>
            <div className="text-xs text-gray-700 dark:text-gray-300">종료</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          *시작/종료 노드를 오른쪽 화면에 넣으세요.
        </p>
      </div>

      {/* 영상 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          영상 목록
        </h4>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            영상이 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {videos.map((video) => (
              <div
                key={video.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-move hover:shadow-md transition"
                draggable
                onDragStart={(e) => onDragStart(e, video)}
              >
                {/* 썸네일 */}
                <div className="relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-2">
                  <p className="text-xs font-medium text-black dark:text-white line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {video.provider}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
