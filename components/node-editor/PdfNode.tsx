'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { EducationNodeData } from '@/types/education-node';

/**
 * PDF 노드 컴포넌트
 */
function PdfNode({ data, selected }: NodeProps<EducationNodeData>) {
  return (
    <div
      className={`w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition ${
        selected
          ? 'border-red-500 shadow-red-500/50'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {/* 상단 핸들 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-500 !border-2 !border-white"
      />

      {/* PDF 아이콘 영역 */}
      <div className="relative w-full h-36 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-t-lg flex flex-col items-center justify-center">
        <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        <span className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">PDF 문서</span>

        {/* PDF 뱃지 */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
          PDF
        </div>
      </div>

      {/* 정보 */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-black dark:text-white line-clamp-2 mb-1">
          {data.pdfTitle || data.title || 'PDF 문서'}
        </h3>

        {data.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* PDF URL이 있는 경우 파일명 표시 */}
        {data.pdfUrl && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{data.pdfUrl.split('/').pop()}</span>
          </div>
        )}
      </div>

      {/* 하단 핸들 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-red-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(PdfNode);
