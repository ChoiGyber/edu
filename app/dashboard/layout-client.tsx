"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationDropdown from "@/components/NotificationDropdown";
import DraggablePopup from "@/components/DraggablePopup";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
}

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export default function DashboardLayoutClient({
  children,
  isAdmin,
  userName,
  userEmail,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activePopups, setActivePopups] = useState<Popup[]>([]);
  const [dismissedPopups, setDismissedPopups] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  // 팝업 로딩
  useEffect(() => {
    const loadPopups = async () => {
      try {
        const response = await fetch("/api/popups?activeOnly=true");
        if (response.ok) {
          const popups = await response.json();
          setActivePopups(popups);
        }
      } catch (error) {
        console.error("Error loading popups:", error);
      }
    };

    // 로컬 스토리지에서 닫은 팝업 목록 불러오기
    const dismissed = localStorage.getItem("dismissedPopups");
    if (dismissed) {
      setDismissedPopups(new Set(JSON.parse(dismissed)));
    }

    loadPopups();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleClosePopup = (popupId: string) => {
    setDismissedPopups((prev) => new Set([...prev, popupId]));
  };

  const handleDismissPopup = async (popupId: string, days: number) => {
    try {
      // 서버에 기록 (사용자 ID 필요)
      await fetch("/api/popups/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id", // TODO: 실제 사용자 ID로 교체
          popupId,
          days,
        }),
      });

      // 로컬 스토리지에 저장
      const newDismissed = new Set([...dismissedPopups, popupId]);
      setDismissedPopups(newDismissed);
      localStorage.setItem("dismissedPopups", JSON.stringify([...newDismissed]));
    } catch (error) {
      console.error("Error dismissing popup:", error);
    }
  };

  const navigation = [
    { name: "대시보드", href: "/dashboard", icon: "dashboard", adminOnly: false },
    { name: "회원 관리", href: "/dashboard/users", icon: "group", adminOnly: true },
    { name: "회사 관리", href: "/dashboard/companies", icon: "business", adminOnly: true },
    { name: "영상 라이브러리", href: "/dashboard/videos", icon: "video_library", adminOnly: false },
    { name: "교육 과정", href: "/dashboard/courses", icon: "school", adminOnly: false },
    { name: "교육 이력", href: "/dashboard/histories", icon: "history", adminOnly: false },
    { name: "이수 확인", href: "/dashboard/certificates", icon: "verified", adminOnly: true },
    { name: "통계 분석", href: "/dashboard/analytics", icon: "analytics", adminOnly: true },
    { name: "고객관리", href: "/dashboard/support", icon: "support_agent", adminOnly: true },
    { name: "결제 관리", href: "/dashboard/payments", icon: "payments", adminOnly: true },
    { name: "시스템 설정", href: "/dashboard/settings", icon: "settings", adminOnly: true },
  ];

  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            {sidebarOpen && (
              <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white">
                🏗️ 안전교육
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                {sidebarOpen ? "menu_open" : "menu"}
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {visibleNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive(item.href)
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userEmail}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
            <div className="flex items-center flex-1 max-w-2xl">
              <span className="material-symbols-outlined text-gray-400 mr-2">
                search
              </span>
              <input
                type="text"
                placeholder="검색..."
                className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
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

              {/* User Screen Button (only for admins) */}
              {isAdmin && (
                <Link
                  href="/user"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  title="사용자 화면으로 이동"
                >
                  <span className="material-symbols-outlined">person</span>
                  <span className="hidden md:inline">사용자 화면</span>
                </Link>
              )}

              {/* Notifications */}
              <NotificationDropdown isAdmin={isAdmin} />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span>내 프로필</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="material-symbols-outlined text-sm">settings</span>
                      <span>설정</span>
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <form action="/api/auth/signout" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        <span>로그아웃</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* 팝업 표시 */}
        {activePopups
          .filter((popup) => !dismissedPopups.has(popup.id))
          .map((popup) => (
            <DraggablePopup
              key={popup.id}
              popup={popup}
              onClose={() => handleClosePopup(popup.id)}
              onDismiss={(days) => handleDismissPopup(popup.id, days)}
            />
          ))}
      </div>
    </div>
  );
}
