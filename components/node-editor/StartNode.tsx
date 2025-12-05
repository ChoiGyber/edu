'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

/**
 * 시작 노드 컴포넌트
 */
function StartNode({ selected }: NodeProps) {
  return (
    <div
      className={`px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg border-2 transition ${
        selected ? 'border-green-700 shadow-green-500/50' : 'border-green-600'
      }`}
    >
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        <span className="font-bold text-lg">시작</span>
      </div>

      {/* 하단 핸들 (연결점) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-600 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(StartNode);
