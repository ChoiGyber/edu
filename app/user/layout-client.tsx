"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserLayoutClientProps {
  children: React.ReactNode;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
}

export default function UserLayoutClient({
  children,
  isAdmin,
  userName,
  userEmail,
}: UserLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const navigation = [
    { name: "대시보드", href: "/user", icon: "dashboard" },
    { name: "교육 과정", href: "/user/courses", icon: "school" },
    { name: "나의안전교육", href: "/user/my-education", icon: "bookmark" },
    { name: "내 교육 이력", href: "/user/history", icon: "history" },
    { name: "이수 증명서", href: "/user/certificates", icon: "verified" },
    { name: "결제 관리", href: "/user/payments", icon: "payments" },
    { name: "내 정보", href: "/user/profile", icon: "person" },
  ];

  const isActive = (href: string) => {
    if (href === "/user") {
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
              <Link href="/user" className="text-xl font-bold text-gray-800 dark:text-white">
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
            {navigation.map((item) => (
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
                placeholder="교육 검색..."
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

              {/* Admin Screen Button (only for admins) */}
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  title="관리자 화면으로 이동"
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  <span className="hidden md:inline">관리자 화면</span>
                </Link>
              )}

              {/* Notifications */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                title="알림"
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                  notifications
                </span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

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
                      href="/user/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span>내 프로필</span>
                    </Link>
                    <Link
                      href="/user/settings"
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
      </div>
    </div>
  );
}
