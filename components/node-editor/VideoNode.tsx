'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { EducationNodeData } from '@/types/education-node';

/**
 * 영상 노드 컴포넌트 (향상된 버전)
 */
function VideoNode({ data, selected }: NodeProps<EducationNodeData>) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition ${
        selected
          ? 'border-blue-500 shadow-blue-500/50'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {/* 상단 핸들 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* 썸네일 */}
      {data.videoThumbnail && (
        <div className="relative w-full h-36 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          <img
            src={data.videoThumbnail}
            alt={data.videoTitle || 'Video'}
            className="w-full h-full object-cover"
          />

          {/* 재생 아이콘 오버레이 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>

          {/* 재생 시간 */}
          {data.videoDuration !== undefined && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 text-white text-xs rounded">
              {formatDuration(data.videoDuration)}
            </div>
          )}
        </div>
      )}

      {/* 정보 */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-black dark:text-white line-clamp-2 mb-1">
          {data.videoTitle || data.title || '제목 없음'}
        </h3>

        {data.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* 제공자 뱃지 */}
        {data.videoProvider && (
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
              {data.videoProvider}
            </span>
          </div>
        )}
      </div>

      {/* 하단 핸들 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(VideoNode);
