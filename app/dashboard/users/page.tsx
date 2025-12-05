"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  companyName: string | null;
  siteName: string | null;
  industry: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "관리자",
  SUB_ADMIN: "보조 관리자",
  USER: "일반 사용자",
};

const INDUSTRY_LABELS: Record<string, string> = {
  CONSTRUCTION: "건설업",
  MANUFACTURING: "제조업",
  LOGISTICS: "물류/운송",
  FOOD: "식음료",
  CHEMICAL: "화학",
  ELECTRICITY: "전기/전자",
  SERVICE: "서비스업",
  ETC: "기타",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (roleFilter) params.set("role", roleFilter);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/users?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("회원이 삭제되었습니다");
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("서버 오류가 발생했습니다");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            회원 관리
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            회사 소속 직원들을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkImport(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Excel 일괄 등록
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            회원 추가
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              역할
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            >
              <option value="">전체</option>
              <option value="ADMIN">관리자</option>
              <option value="SUB_ADMIN">보조 관리자</option>
              <option value="USER">일반 사용자</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              검색
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="이름, 이메일, 회사명"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 회원 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">회원이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      휴대폰
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      현장명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      업종
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.phone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.siteName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.industry
                          ? INDUSTRY_LABELS[user.industry] || user.industry
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : user.role === "SUB_ADMIN"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {user.isActive ? "활성" : "비활성"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  페이지 {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 회원 추가 모달 */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Excel 일괄 등록 모달 */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            setShowBulkImport(false);
            fetchUsers();
          }}
        />
      )}

      {/* 회원 수정 모달 */}
      {showEditModal && editingUserId && (
        <EditUserModal
          userId={editingUserId}
          onClose={() => {
            setShowEditModal(false);
            setEditingUserId(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingUserId(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// 회원 추가 모달 컴포넌트
function AddUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone1: "010",
    phone2: "",
    phone3: "",
    companyName: "",
    siteName: "",
    industry: "",
    role: "USER",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 중복 확인 상태
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [phoneChecked, setPhoneChecked] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState(false);

  // Toast 상태
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "success" });

  // 휴대폰 입력 박스 ref
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);

  // 휴대폰 입력 처리
  const handlePhoneChange = (
    field: "phone1" | "phone2" | "phone3",
    value: string
  ) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, [field]: numericValue });
    setPhoneChecked(false);
    setPhoneAvailable(false);

    // 자동 포커스 이동
    if (field === "phone2" && numericValue.length === 4) {
      phone3Ref.current?.focus();
    }
  };

  // 이메일 중복 확인
  const checkEmailDuplicate = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setErrors({ ...errors, email: "올바른 이메일 형식이 아닙니다" });
      return;
    }

    try {
      const response = await fetch(
        `/api/auth/check-email?email=${encodeURIComponent(formData.email)}`
      );
      const data = await response.json();

      if (data.available) {
        setEmailAvailable(true);
        setEmailChecked(true);
        setErrors({ ...errors, email: "" });
        setToast({
          show: true,
          message: "사용 가능한 이메일입니다.",
          type: "success",
        });
      } else {
        setErrors({ ...errors, email: "이미 사용 중인 이메일입니다" });
        setEmailAvailable(false);
        setEmailChecked(false);
        setToast({
          show: true,
          message: "이미 사용 중인 이메일입니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Email check error:", error);
      setToast({
        show: true,
        message: "이메일 확인 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  // 휴대폰 중복 확인
  const checkPhoneDuplicate = async () => {
    const phone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;

    if (!formData.phone2 || !formData.phone3) {
      setToast({
        show: true,
        message: "휴대폰번호를 입력하세요.",
        type: "error",
      });
      return;
    }

    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      setErrors({
        ...errors,
        phone: "휴대폰번호 형식이 올바르지 않습니다",
      });
      setToast({
        show: true,
        message: "휴대폰번호 형식이 올바르지 않습니다.",
        type: "error",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/users/check-phone?phone=${encodeURIComponent(phone)}`
      );
      const data = await response.json();

      if (data.available) {
        setPhoneAvailable(true);
        setPhoneChecked(true);
        setErrors({ ...errors, phone: "" });
        setToast({
          show: true,
          message: "사용 가능한 휴대폰번호입니다.",
          type: "success",
        });
      } else {
        setErrors({ ...errors, phone: "이미 사용 중인 휴대폰번호입니다" });
        setPhoneAvailable(false);
        setPhoneChecked(false);
        setToast({
          show: true,
          message: "이미 사용 중인 휴대폰번호입니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Phone check error:", error);
      setToast({
        show: true,
        message: "휴대폰번호 확인 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이메일 중복 확인 여부 검증
    if (!emailChecked || !emailAvailable) {
      setToast({
        show: true,
        message: "이메일 중복 확인을 먼저 진행해주세요.",
        type: "error",
      });
      return;
    }

    // 휴대폰번호 중복 확인 여부 검증 (필수)
    if (!phoneChecked || !phoneAvailable) {
      setToast({
        show: true,
        message: "휴대폰번호 중복 확인을 먼저 진행해주세요.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      const phone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone,
        }),
      });

      if (response.ok) {
        setToast({
          show: true,
          message: "회원이 추가되었습니다.",
          type: "success",
        });
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        const data = await response.json();
        setToast({
          show: true,
          message: data.error || "추가에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Add user error:", error);
      setToast({
        show: true,
        message: "서버 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          회원 추가
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이메일 *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setEmailChecked(false);
                  setEmailAvailable(false);
                }}
                disabled={emailChecked && emailAvailable}
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white disabled:opacity-50"
              />
              <button
                type="button"
                onClick={checkEmailDuplicate}
                disabled={emailChecked && emailAvailable}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  emailChecked && emailAvailable
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {emailChecked && emailAvailable ? "확인 완료" : "중복 확인"}
              </button>
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              휴대폰 *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.phone1}
                readOnly
                className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-600 text-black dark:text-white text-center"
              />
              <span className="text-gray-500">-</span>
              <input
                ref={phone2Ref}
                type="text"
                value={formData.phone2}
                onChange={(e) => handlePhoneChange("phone2", e.target.value)}
                maxLength={4}
                placeholder="1234"
                required
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white text-center"
              />
              <span className="text-gray-500">-</span>
              <input
                ref={phone3Ref}
                type="text"
                value={formData.phone3}
                onChange={(e) => handlePhoneChange("phone3", e.target.value)}
                maxLength={4}
                placeholder="5678"
                required
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white text-center"
              />
              <button
                type="button"
                onClick={checkPhoneDuplicate}
                disabled={
                  !formData.phone2 ||
                  !formData.phone3 ||
                  (phoneChecked && phoneAvailable)
                }
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  phoneChecked && phoneAvailable
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {phoneChecked && phoneAvailable ? "확인 완료" : "중복 확인"}
              </button>
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              휴대폰번호는 필수입니다 (비밀번호 찾기에 사용)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              회사명 (선택)
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="(주)안전건설"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              현장명 (선택)
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) =>
                setFormData({ ...formData, siteName: e.target.value })
              }
              placeholder="서울 00 현장"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              역할
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            >
              <option value="USER">일반 사용자</option>
              <option value="SUB_ADMIN">보조 관리자</option>
              <option value="ADMIN">관리자</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="미입력 시 임시 비밀번호 생성"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>

      {/* Toast 알림 */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

// Excel 일괄 등록 모달 컴포넌트
function BulkImportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/bulk-import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        if (data.results.failed.length > 0) {
          console.log("Failed imports:", data.results.failed);
        }
        onSuccess();
      } else {
        alert(data.error || "업로드에 실패했습니다");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("서버 오류가 발생했습니다");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          Excel 일괄 등록
        </h2>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            Excel 파일 형식:
          </p>
          <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
            <li>email (필수)</li>
            <li>name (필수)</li>
            <li>phone (선택)</li>
            <li>siteName (선택)</li>
            <li>industry (선택)</li>
            <li>role (선택: USER, SUB_ADMIN, ADMIN)</li>
            <li>password (선택)</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
          />

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? "업로드 중..." : "업로드"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// 회원 수정 모달 컴포넌트
function EditUserModal({
  userId,
  onClose,
  onSuccess,
}: {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    companyName: "",
    siteName: "",
    industry: "",
    role: "USER",
    isActive: true,
    password: "",
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name,
          phone: data.user.phone || "",
          companyName: data.user.companyName || "",
          siteName: data.user.siteName || "",
          industry: data.user.industry || "",
          role: data.user.role,
          isActive: data.user.isActive,
          password: "",
        });
      } else {
        alert("회원을 찾을 수 없습니다");
        onClose();
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      alert("서버 오류가 발생했습니다");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone || null,
        companyName: formData.companyName || null,
        siteName: formData.siteName || null,
        industry: formData.industry || null,
        role: formData.role,
        isActive: formData.isActive,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert("회원 정보가 수정되었습니다");
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || "수정에 실패했습니다");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("서버 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            회원 수정
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
              close
            </span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
            </div>

            {/* 휴대폰 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                휴대폰
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="010-1234-5678"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
            </div>

            {/* 회사명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                회사명
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="(주)안전건설"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
            </div>

            {/* 현장명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                현장명
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                placeholder="서울 재개발 현장"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
            </div>

            {/* 업종 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                업종
              </label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="">선택하세요</option>
                {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 역할 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                역할 *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="USER">일반 사용자</option>
                <option value="SUB_ADMIN">보조 관리자</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>

            {/* 상태 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  활성 상태
                </span>
              </label>
            </div>

            {/* 비밀번호 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호 변경 (선택)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="변경하려면 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                비밀번호를 변경하지 않으려면 비워두세요
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? "수정 중..." : "수정하기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
