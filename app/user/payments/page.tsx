"use client";

import { useState, useEffect } from "react";

interface Subscription {
  plan: "INDIVIDUAL" | "COMPANY";
  amount: number;
  interval: "monthly" | "yearly";
  nextBillingDate: string;
  status: "active" | "trial" | "expired" | "cancelled";
  trialEndsAt?: string;
}

interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  method: string;
  receiptUrl?: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  cardNumber?: string;
  expiryDate?: string;
  bankName?: string;
  accountNumber?: string;
  isDefault: boolean;
}

export default function UserPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"subscription" | "history" | "settings">("subscription");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user payment data
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">payments</span>
          결제 관리
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          구독 및 결제 내역을 관리하세요
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("subscription")}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === "subscription"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            구독 정보
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            결제 내역
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === "settings"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            결제 설정
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "subscription" && <SubscriptionTab />}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "settings" && <SettingsTab />}
    </div>
  );
}

// 구독 정보 탭
function SubscriptionTab() {
  const subscription: Subscription = {
    plan: "COMPANY",
    amount: 990000,
    interval: "yearly",
    nextBillingDate: "2025-12-18",
    status: "active",
  };

  const getPlanName = (plan: string) => {
    return plan === "INDIVIDUAL" ? "개인 계정" : "회사 계정";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: "활성", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      trial: { text: "무료 체험", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      expired: { text: "만료", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      cancelled: { text: "취소됨", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 현재 구독 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined">workspace_premium</span>
            현재 구독 플랜
          </h2>
          {getStatusBadge(subscription.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">플랜</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {getPlanName(subscription.plan)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">결제 금액</p>
            <p className="text-2xl font-bold text-black dark:text-white">
              ₩{subscription.amount.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                /{subscription.interval === "monthly" ? "월" : "년"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">다음 결제일</p>
            <p className="text-2xl font-bold text-black dark:text-white">
              {new Date(subscription.nextBillingDate).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>

        {subscription.status === "trial" && subscription.trialEndsAt && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="material-symbols-outlined">info</span>
              <span className="font-medium">
                무료 체험 기간이 {new Date(subscription.trialEndsAt).toLocaleDateString("ko-KR")}에 종료됩니다
              </span>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-black dark:text-white mb-3">포함된 기능</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(subscription.plan === "COMPANY" ? [
              "무제한 회원 등록",
              "영상 조합 교육 무제한",
              "QR 증빙 시스템",
              "다국어 지원 (19개 언어)",
              "AI 자동 번역",
              "PDF 자동 생성",
              "교육 이력 관리",
              "통계 분석 대시보드",
              "우선 고객 지원",
              "맞춤 브랜딩",
            ] : [
              "1인 사용",
              "기본 교육 기능",
              "QR 증빙 시스템",
              "PDF 생성",
              "교육 이력 조회",
            ]).map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">
                  check_circle
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            플랜 변경
          </button>
          {subscription.status === "active" && (
            <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              구독 취소
            </button>
          )}
        </div>
      </div>

      {/* 플랜 비교 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
          플랜 비교
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 개인 플랜 */}
          <div className={`border-2 rounded-xl p-6 ${
            subscription.plan === "INDIVIDUAL"
              ? "border-blue-600 dark:border-blue-500 relative"
              : "border-gray-200 dark:border-gray-700"
          }`}>
            {subscription.plan === "INDIVIDUAL" && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                현재 플랜
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">개인 계정</h3>
              <p className="text-3xl font-bold text-black dark:text-white mt-2">
                ₩9,900 <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/월</span>
              </p>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                "1인 사용",
                "기본 교육 기능",
                "QR 증빙 시스템",
                "PDF 생성",
                "교육 이력 조회",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {subscription.plan !== "INDIVIDUAL" && (
              <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                이 플랜 선택
              </button>
            )}
          </div>

          {/* 회사 플랜 */}
          <div className={`border-2 rounded-xl p-6 ${
            subscription.plan === "COMPANY"
              ? "border-blue-600 dark:border-blue-500 relative"
              : "border-gray-200 dark:border-gray-700"
          }`}>
            {subscription.plan === "COMPANY" && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                현재 플랜
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">회사 계정</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                ₩990,000 <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/년</span>
              </p>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                "무제한 회원",
                "모든 기능 포함",
                "AI 자동 번역",
                "우선 지원",
                "맞춤 브랜딩",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {subscription.plan !== "COMPANY" && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                이 플랜 선택
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 결제 내역 탭
function HistoryTab() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      date: "2025-01-18",
      description: "회사 계정 - 연간 구독",
      amount: 990000,
      status: "completed",
      method: "신용카드",
      receiptUrl: "/receipts/2025-01-18.pdf",
    },
    {
      id: "2",
      date: "2024-12-18",
      description: "회사 계정 - 연간 구독",
      amount: 990000,
      status: "completed",
      method: "신용카드",
      receiptUrl: "/receipts/2024-12-18.pdf",
    },
  ]);

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { text: "완료", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      pending: { text: "대기", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      failed: { text: "실패", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };
    const badge = badges[status as keyof typeof badges] || badges.completed;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                날짜
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                내역
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                결제 수단
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                영수증
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  결제 내역이 없습니다
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                    {new Date(payment.date).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">
                    {payment.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                    ₩{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.receiptUrl && (
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>다운로드</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 결제 설정 탭
function SettingsTab() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      cardNumber: "•••• 1234",
      expiryDate: "12/2026",
      isDefault: true,
    },
  ]);

  const [autoRenewal, setAutoRenewal] = useState(true);
  const [renewalNotification, setRenewalNotification] = useState(true);

  return (
    <div className="space-y-6">
      {/* 결제 수단 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">credit_card</span>
          결제 수단
        </h2>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                    {method.type === "card" ? "credit_card" : "account_balance"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-black dark:text-white">
                      {method.type === "card" ? `신용카드 ${method.cardNumber}` : `${method.bankName} ${method.accountNumber}`}
                    </p>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        기본
                      </span>
                    )}
                  </div>
                  {method.type === "card" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      만료일: {method.expiryDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!method.isDefault && (
                  <button className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    기본으로 설정
                  </button>
                )}
                <button className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  수정
                </button>
                <button className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  삭제
                </button>
              </div>
            </div>
          ))}

          <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 transition flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add</span>
            <span>새 결제 수단 추가</span>
          </button>
        </div>
      </div>

      {/* 자동 갱신 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">autorenew</span>
          자동 갱신 설정
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black dark:text-white">자동 갱신</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                구독 만료 시 자동으로 갱신됩니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoRenewal}
                onChange={(e) => setAutoRenewal(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black dark:text-white">갱신 알림</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                갱신 7일 전 이메일 알림
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={renewalNotification}
                onChange={(e) => setRenewalNotification(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 청구서 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">receipt_long</span>
          청구서 정보
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              회사명
            </label>
            <input
              type="text"
              defaultValue="(주)안전건설"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              사업자등록번호
            </label>
            <input
              type="text"
              defaultValue="123-45-67890"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              청구서 이메일
            </label>
            <input
              type="email"
              defaultValue="billing@company.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
