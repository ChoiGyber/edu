"use client";

import { useCallback, useState, useRef } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { VideoNode, ImageNode, PdfNode, StartNode, EndNode } from "./index";

// 노드 타입 정의
const nodeTypes: NodeTypes = {
  START: StartNode,
  VIDEO: VideoNode,
  IMAGE: ImageNode,
  PDF: PdfNode,
  END: EndNode,
};

interface CourseNodeEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

function CourseNodeEditorContent({
  initialNodes = [],
  initialEdges = [],
  onSave,
}: CourseNodeEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // 연결 처리
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge({ ...params, animated: true, type: "smoothstep" }, eds)
      );
    },
    [setEdges]
  );

  // 드래그 오버
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // 드롭 처리
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow-type");
      const nodeData = event.dataTransfer.getData("application/reactflow-data");

      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type.toLowerCase()}-${Date.now()}`,
        type,
        position,
        data: nodeData ? JSON.parse(nodeData) : { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // 총 시간 계산
  const calculateTotalDuration = () => {
    return nodes
      .filter((node) => node.type === "VIDEO")
      .reduce((sum, node) => {
        return sum + (node.data.videoDuration || 0);
      }, 0);
  };

  // 저장
  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  const totalDuration = calculateTotalDuration();
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;

  return (
    <div className="flex flex-col h-full">
      {/* 상단 툴바 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            교육 과정 편집기
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            총 시간: {minutes}분 {seconds}초 | 노드: {nodes.length}개
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>

      {/* React Flow 캔버스 */}
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case "START":
                  return "#22c55e";
                case "VIDEO":
                  return "#3b82f6";
                case "IMAGE":
                  return "#a855f7";
                case "PDF":
                  return "#ef4444";
                case "END":
                  return "#ef4444";
                default:
                  return "#e5e7eb";
              }
            }}
            style={{ background: "#1f2937" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function CourseNodeEditor(props: CourseNodeEditorProps) {
  return (
    <ReactFlowProvider>
      <CourseNodeEditorContent {...props} />
    </ReactFlowProvider>
  );
}
