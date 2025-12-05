/**
 * 교육 노드 타입 정의
 * Phase 3: 교육 조합 노드 에디터
 */

export enum NodeType {
  START = "START",     // 시작점
  VIDEO = "VIDEO",     // 영상
  IMAGE = "IMAGE",     // 이미지 (표지, 중간)
  PDF = "PDF",         // PDF 문서
  END = "END"          // 종료점
}

/**
 * 교육 노드 데이터 인터페이스
 */
export interface EducationNodeData {
  // VIDEO 타입
  videoId?: string;
  videoTitle?: string;
  videoDuration?: number;
  videoThumbnail?: string;
  videoProvider?: "VIMEO" | "CLOUDFLARE";
  videoUrl?: string;

  // IMAGE 타입
  imageUrl?: string;
  imageTitle?: string;

  // PDF 타입
  pdfUrl?: string;
  pdfTitle?: string;

  // 공통
  title?: string;
  description?: string;
  duration?: number;  // 재생 시간 (초)
}

/**
 * 교육 노드 인터페이스
 */
export interface EducationNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: EducationNodeData;
}

/**
 * 교육 엣지 (노드 연결) 인터페이스
 */
export interface EducationEdge {
  id: string;
  source: string;      // 출발 노드 ID
  target: string;      // 도착 노드 ID
  type?: "default" | "smooth" | "step";
  animated?: boolean;
}

/**
 * 교육 과정 인터페이스
 */
export interface EducationCourse {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;

  // 노드 구조
  nodes: EducationNode[];
  edges: EducationEdge[];

  totalDuration: number;  // 총 시간 (초)

  // 소유 및 공유
  ownerId: string;
  isPublic: boolean;
  sharedWith: string[];

  // 통계
  viewCount: number;
  usedCount: number;

  createdAt: string;
  updatedAt: string;
}

/**
 * 드래그 가능한 아이템 타입
 */
export interface DraggableItem {
  type: NodeType;
  data: EducationNodeData;
}
