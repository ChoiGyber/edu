'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EducationNode } from '@/types/education-node';

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  nodes: EducationNode[];
  edges: any[];
  totalDuration: number;
  viewCount: number;
  usedCount: number;
  isPublic: boolean;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 교육 과정 상세 페이지
 */
export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (response.ok) {
        setCourse(data.course);
      } else {
        alert(data.error || '교육 과정을 불러올 수 없습니다');
        router.back();
      }
    } catch (error) {
      console.error('Fetch course error:', error);
      alert('서버 오류가 발생했습니다');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}분 ${secs}초`;
  };

  const getVideoNodes = () => {
    if (!course) return [];
    return course.nodes.filter((node) => node.type === 'VIDEO');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">교육 과정을 찾을 수 없습니다</p>
      </div>
    );
  }

  const videoNodes = getVideoNodes();

  return (
    <div className="px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            뒤로 가기
          </button>

          <div className="flex gap-2">
            <Link
              href={`/dashboard/courses/${course.id}/edit`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              편집
            </Link>
            <Link
              href={`/dashboard/education/${course.id}/execute`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              교육 시작
            </Link>
          </div>
        </div>
      </div>

      {/* 썸네일 및 기본 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        {/* 썸네일 */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🎓</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            {course.title}
          </h1>

          {course.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formatDuration(course.totalDuration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{course.viewCount} 조회</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>{course.usedCount} 실행</span>
            </div>

            <div>
              {course.isPublic ? (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">
                  공개
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded">
                  비공개
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              작성자: {course.owner.name} ({course.owner.email})
            </p>
          </div>
        </div>
      </div>

      {/* 영상 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          교육 영상 ({videoNodes.length}개)
        </h2>

        {videoNodes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            등록된 영상이 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {videoNodes.map((node, index) => (
              <div
                key={node.id}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {/* 순서 */}
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                {/* 썸네일 */}
                {node.data.videoThumbnail && (
                  <div className="flex-shrink-0 w-32 h-18 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                    <img
                      src={node.data.videoThumbnail}
                      alt={node.data.videoTitle || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-black dark:text-white line-clamp-1">
                    {node.data.videoTitle || node.data.title || '제목 없음'}
                  </h3>
                  {node.data.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {node.data.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {node.data.videoDuration && (
                      <span>{formatDuration(node.data.videoDuration)}</span>
                    )}
                    {node.data.videoProvider && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                        {node.data.videoProvider}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
