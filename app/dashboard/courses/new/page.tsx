"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Node, Edge } from "reactflow";
import VideoSidebar from "@/components/node-editor/VideoSidebar";

// React Flow는 클라이언트 사이드에서만 동작
const CourseNodeEditor = dynamic(
  () => import("@/components/node-editor/CourseNodeEditor"),
  { ssr: false }
);

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "start-1",
      type: "START",
      position: { x: 250, y: 0 },
      data: {},
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleSave = async (savedNodes: Node[], savedEdges: Edge[]) => {
    if (!title.trim()) {
      alert("교육 과정 제목을 입력해주세요");
      return;
    }

    // 총 시간 계산
    const totalDuration = savedNodes
      .filter((node) => node.type === "VIDEO")
      .reduce((sum, node) => sum + (node.data.videoDuration || 0), 0);

    // 대표 썸네일 (첫 영상)
    const firstVideoNode = savedNodes.find((node) => node.type === "VIDEO");
    const thumbnail = firstVideoNode?.data.videoThumbnail || null;

    setSaving(true);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          nodes: savedNodes,
          edges: savedEdges,
          totalDuration,
          thumbnail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("교육 과정이 저장되었습니다!");
        router.push("/dashboard/courses");
      } else {
        alert(data.error || "저장에 실패했습니다");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("서버 오류가 발생했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              교육 과정 만들기
            </h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              취소
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                교육 과정 제목 *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 건설 현장 안전교육"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                설명
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="교육 과정에 대한 간단한 설명"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="flex-1 flex overflow-hidden">
        <VideoSidebar />
        <div className="flex-1">
          <CourseNodeEditor
            initialNodes={nodes}
            initialEdges={edges}
            onSave={handleSave}
          />
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-black dark:text-white">저장 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
