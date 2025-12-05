"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleContentClick = () => {
    router.push("/auth/signin");
  };

  const courses = [
    {
      id: 1,
      title: "건설현장 안전교육 기본과정",
      duration: "45분",
      videos: 5,
      students: 128,
      thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "전기안전 종합교육",
      duration: "30분",
      videos: 3,
      students: 95,
      thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "화재예방 및 소화기 사용법",
      duration: "25분",
      videos: 4,
      students: 156,
      thumbnail: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "고소작업 안전수칙",
      duration: "35분",
      videos: 4,
      students: 87,
      thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    },
  ];

  const features = [
    {
      icon: "video_library",
      title: "영상 조합 교육",
      description: "10분대 짧은 영상을 조합하여 맞춤형 교육 과정을 만드세요",
    },
    {
      icon: "qr_code_scanner",
      title: "QR 증빙 시스템",
      description: "모바일 QR 코드로 간편하게 교육 이수를 증빙하세요",
    },
    {
      icon: "translate",
      title: "다국어 지원",
      description: "AI 자동 번역으로 외국인 근로자도 쉽게 교육받을 수 있습니다",
    },
    {
      icon: "description",
      title: "PDF 자동 생성",
      description: "교육 이수 확인서를 자동으로 생성하여 법적 효력을 확보하세요",
    },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏗️</span>
                <span className="text-xl font-bold text-black dark:text-white">
                  안전교육 플랫폼
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={darkMode ? "라이트 모드" : "다크 모드"}
                >
                  <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                    {darkMode ? "light_mode" : "dark_mode"}
                  </span>
                </button>

                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  시작하기
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-black dark:text-white mb-4">
              건설 안전교육을 더 쉽고 효과적으로
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              영상 조합 교육부터 QR 증빙까지, 올인원 안전교육 플랫폼
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>무료로 시작하기</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button
                onClick={handleContentClick}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                둘러보기
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={handleContentClick}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition cursor-pointer group"
              >
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-5xl mb-4 block group-hover:scale-110 transition">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-800 rounded-2xl mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              📚 인기 교육 과정
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              업종별 맞춤 안전교육을 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={handleContentClick}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-xl transition group cursor-pointer"
              >
                <div className="relative h-40 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-5xl opacity-0 group-hover:opacity-100 transition">
                      play_circle
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-black dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        video_library
                      </span>
                      <span>{course.videos}개</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>모든 교육 과정 보기</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              💰 합리적인 가격
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              규모에 맞는 플랜을 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual Plan */}
            <div
              onClick={handleContentClick}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition cursor-pointer"
            >
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                개인 계정
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-black dark:text-white">
                  ₩9,900
                </span>
                <span className="text-gray-600 dark:text-gray-400">/월</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["1인 사용", "기본 교육 기능", "QR 증빙 시스템", "PDF 생성"].map(
                  (feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600">
                        check_circle
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  )
                )}
              </ul>
              <button className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                시작하기
              </button>
            </div>

            {/* Company Plan */}
            <div
              onClick={handleContentClick}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 border-2 border-blue-600 hover:shadow-2xl transition cursor-pointer relative"
            >
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-medium">
                추천
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">회사 계정</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₩990,000</span>
                <span className="text-blue-100">/년</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "무제한 회원",
                  "모든 기능 포함",
                  "AI 자동 번역",
                  "우선 지원",
                  "커스텀 브랜딩",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">
                      check_circle
                    </span>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium">
                시작하기
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              무료 체험으로 안전교육 플랫폼을 경험해보세요
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition shadow-lg hover:shadow-xl font-medium"
            >
              <span>무료로 시작하기</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏗️</span>
                  <span className="text-lg font-bold text-black dark:text-white">
                    안전교육 플랫폼
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  건설 안전교육의 새로운 기준
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-4">
                  제품
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      기능
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      가격
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      사례
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-4">
                  지원
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      문서
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      고객센터
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-4">
                  회사
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      소개
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      블로그
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-blue-600">
                      문의
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              © 2025 Safety Education Platform. All rights reserved.
            </div>
          </div>
        </footer>

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </div>
  );
}
