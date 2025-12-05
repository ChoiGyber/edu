'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

/**
 * 종료 노드 컴포넌트
 */
function EndNode({ selected }: NodeProps) {
  return (
    <div
      className={`px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-lg border-2 transition ${
        selected ? 'border-gray-900 shadow-gray-700/50' : 'border-gray-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
        </svg>
        <span className="font-bold text-lg">종료</span>
      </div>

      {/* 상단 핸들 (연결점) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-800 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(EndNode);
