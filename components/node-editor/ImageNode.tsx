'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { EducationNodeData } from '@/types/education-node';

/**
 * 이미지 노드 컴포넌트
 */
function ImageNode({ data, selected }: NodeProps<EducationNodeData>) {
  return (
    <div
      className={`w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition ${
        selected
          ? 'border-yellow-500 shadow-yellow-500/50'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {/* 상단 핸들 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-yellow-500 !border-2 !border-white"
      />

      {/* 이미지 미리보기 */}
      {data.imageUrl ? (
        <div className="relative w-full h-36 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          <img
            src={data.imageUrl}
            alt={data.imageTitle || 'Image'}
            className="w-full h-full object-cover"
          />

          {/* 이미지 아이콘 오버레이 */}
          <div className="absolute top-2 left-2 p-1.5 bg-yellow-500 rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-36 bg-gray-100 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 정보 */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <h3 className="font-semibold text-sm text-black dark:text-white line-clamp-1">
            {data.imageTitle || data.title || '이미지'}
          </h3>
        </div>

        {data.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {data.description}
          </p>
        )}
      </div>

      {/* 하단 핸들 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-yellow-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(ImageNode);
