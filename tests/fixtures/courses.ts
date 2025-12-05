/**
 * Test fixture data for education courses
 */

import { mockVideos } from './videos';

export const mockCourses = {
  basic: {
    id: 'course-001',
    title: '건설 현장 기본 안전 교육',
    description: '신규 근로자를 위한 필수 안전 교육',
    thumbnail: mockVideos.vimeo.thumbnailUrl,
    nodes: [
      {
        id: 'node-start',
        type: 'START',
        position: { x: 250, y: 0 },
        data: { label: '시작' },
      },
      {
        id: 'node-image-1',
        type: 'IMAGE',
        position: { x: 250, y: 100 },
        data: {
          imageUrl: 'https://example.r2.cloudflarestorage.com/covers/safety-cover.jpg',
          imageTitle: '안전교육 표지',
          title: '안전교육 표지',
        },
      },
      {
        id: 'node-video-1',
        type: 'VIDEO',
        position: { x: 250, y: 200 },
        data: {
          videoId: mockVideos.vimeo.id,
          videoTitle: mockVideos.vimeo.title,
          videoDuration: mockVideos.vimeo.duration,
          videoThumbnail: mockVideos.vimeo.thumbnailUrl,
        },
      },
      {
        id: 'node-video-2',
        type: 'VIDEO',
        position: { x: 250, y: 300 },
        data: {
          videoId: mockVideos.cloudflare.id,
          videoTitle: mockVideos.cloudflare.title,
          videoDuration: mockVideos.cloudflare.duration,
          videoThumbnail: mockVideos.cloudflare.thumbnailUrl,
        },
      },
      {
        id: 'node-end',
        type: 'END',
        position: { x: 250, y: 400 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-start',
        target: 'node-image-1',
        type: 'default',
      },
      {
        id: 'edge-2',
        source: 'node-image-1',
        target: 'node-video-1',
        type: 'default',
      },
      {
        id: 'edge-3',
        source: 'node-video-1',
        target: 'node-video-2',
        type: 'default',
      },
      {
        id: 'edge-4',
        source: 'node-video-2',
        target: 'node-end',
        type: 'default',
      },
    ],
    totalDuration: mockVideos.vimeo.duration + mockVideos.cloudflare.duration,
    ownerId: 'user-admin-001',
    isPublic: true,
    sharedWith: ['user-subadmin-001'],
    viewCount: 45,
    usedCount: 12,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },

  advanced: {
    id: 'course-002',
    title: '중장비 안전 교육',
    description: '포크리프트 및 크레인 운전자 전문 교육',
    thumbnail: mockVideos.vimeo.thumbnailUrl,
    nodes: [
      {
        id: 'node-start',
        type: 'START',
        position: { x: 250, y: 0 },
        data: { label: '시작' },
      },
      {
        id: 'node-video-1',
        type: 'VIDEO',
        position: { x: 250, y: 100 },
        data: {
          videoId: mockVideos.vimeo.id,
          videoTitle: mockVideos.vimeo.title,
          videoDuration: mockVideos.vimeo.duration,
          videoThumbnail: mockVideos.vimeo.thumbnailUrl,
        },
      },
      {
        id: 'node-pdf-1',
        type: 'PDF',
        position: { x: 250, y: 200 },
        data: {
          pdfUrl: 'https://example.r2.cloudflarestorage.com/docs/safety-manual.pdf',
          pdfTitle: '안전 매뉴얼',
          title: '안전 매뉴얼',
        },
      },
      {
        id: 'node-end',
        type: 'END',
        position: { x: 250, y: 300 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-start',
        target: 'node-video-1',
        type: 'smooth',
      },
      {
        id: 'edge-2',
        source: 'node-video-1',
        target: 'node-pdf-1',
        type: 'smooth',
      },
      {
        id: 'edge-3',
        source: 'node-pdf-1',
        target: 'node-end',
        type: 'smooth',
      },
    ],
    totalDuration: mockVideos.vimeo.duration,
    ownerId: 'user-admin-001',
    isPublic: false,
    sharedWith: [],
    viewCount: 8,
    usedCount: 2,
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
};

/**
 * Mock course list for dashboard tests
 */
export const mockCourseList = Object.values(mockCourses);
