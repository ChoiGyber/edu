/**
 * Test fixture data for videos
 */

export const mockVideos = {
  vimeo: {
    id: 'video-vimeo-001',
    title: '포크리프트 안전 교육',
    description: '포크리프트 운전 시 필수 안전 수칙',
    duration: 620, // 10분 20초
    thumbnailUrl: 'https://i.vimeocdn.com/video/mock-thumbnail.jpg',
    provider: 'VIMEO',
    providerId: '123456789',
    videoUrl: 'https://vimeo.com/123456789',
    embedHtml: '<iframe src="https://player.vimeo.com/video/123456789"></iframe>',
    category: ['중장비', '안전'],
    industry: ['CONSTRUCTION', 'LOGISTICS'],
    hasKoreanAudio: true,
    subtitles: [
      {
        language: 'ko',
        label: '한국어',
        url: 'https://example.r2.cloudflarestorage.com/subtitles/video-001-ko.vtt',
        format: 'vtt',
        source: 'MANUAL',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        language: 'en',
        label: 'English',
        url: 'https://example.r2.cloudflarestorage.com/subtitles/video-001-en.vtt',
        format: 'vtt',
        source: 'AI',
        createdAt: '2024-01-02T00:00:00.000Z',
      },
      {
        language: 'vi',
        label: 'Tiếng Việt',
        url: 'https://example.r2.cloudflarestorage.com/subtitles/video-001-vi.vtt',
        format: 'vtt',
        source: 'AI',
        createdAt: '2024-01-02T00:00:00.000Z',
      },
    ],
    aiTranslation: true,
    uploadedBy: 'user-admin-001',
    isPublic: true,
    viewCount: 150,
    usedInCourses: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  cloudflare: {
    id: 'video-cloudflare-001',
    title: '전기 안전 교육',
    description: '전기 작업 시 감전 예방 및 안전 조치',
    duration: 525, // 8분 45초
    thumbnailUrl: 'https://cloudflarestream.com/mock-thumbnail.jpg',
    provider: 'CLOUDFLARE',
    providerId: 'abc123def456',
    videoUrl: 'https://cloudflarestream.com/abc123def456/manifest/video.m3u8',
    embedHtml: null,
    category: ['전기', '안전'],
    industry: ['CONSTRUCTION', 'ELECTRICITY'],
    hasKoreanAudio: true,
    subtitles: [
      {
        language: 'ko',
        label: '한국어',
        url: 'https://example.r2.cloudflarestorage.com/subtitles/video-002-ko.srt',
        format: 'srt',
        source: 'MANUAL',
        createdAt: '2024-01-05T00:00:00.000Z',
      },
      {
        language: 'zh',
        label: '中文',
        url: 'https://example.r2.cloudflarestorage.com/subtitles/video-002-zh.srt',
        format: 'srt',
        source: 'AI',
        createdAt: '2024-01-06T00:00:00.000Z',
      },
    ],
    aiTranslation: true,
    uploadedBy: 'user-admin-001',
    isPublic: true,
    viewCount: 89,
    usedInCourses: 3,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z',
  },

  private: {
    id: 'video-private-001',
    title: '현장 맞춤 안전 교육',
    description: '특정 현장 전용 안전 교육',
    duration: 900, // 15분
    thumbnailUrl: 'https://i.vimeocdn.com/video/private-thumbnail.jpg',
    provider: 'VIMEO',
    providerId: '987654321',
    videoUrl: 'https://vimeo.com/987654321',
    embedHtml: '<iframe src="https://player.vimeo.com/video/987654321"></iframe>',
    category: ['맞춤'],
    industry: ['CONSTRUCTION'],
    hasKoreanAudio: true,
    subtitles: [],
    aiTranslation: false,
    uploadedBy: 'user-admin-001',
    isPublic: false,
    viewCount: 12,
    usedInCourses: 1,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
};

/**
 * Mock video list for search/filter tests
 */
export const mockVideoList = Object.values(mockVideos);
