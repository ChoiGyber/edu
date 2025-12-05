"use client";

import { useState, useEffect } from "react";
import NewPlanModal from "@/components/NewPlanModal";
import GrantTrialModal from "@/components/GrantTrialModal";

interface SubscriptionPlan {
  id: string;
  type: "INDIVIDUAL" | "COMPANY";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxUsers: number | null;
  isActive: boolean;
}

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planType: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed" | "refunded";
  method: string;
  cardLast4?: string;
  receiptUrl?: string;
}

interface CardTransaction {
  id: string;
  userId: string;
  userName: string;
  cardLast4: string;
  cardBrand: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed" | "cancelled";
  description: string;
  canCancel: boolean;
}

interface FreeTrial {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "converted";
  planType: string;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"pgSettings" | "plans" | "pricing" | "history" | "cards" | "trials">("pgSettings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch admin payment data
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
        <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-4xl">payments</span>
          결제 관리 (관리자)
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          구독 플랜, 가격 설정, 전체 결제 내역 및 카드 관리
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                총 구독자
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                156
              </p>
            </div>
            <span className="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400 opacity-50">
              groups
            </span>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                이번 달 수익
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                ₩12.8M
              </p>
            </div>
            <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400 opacity-50">
              trending_up
            </span>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                활성 무료체험
              </p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                23
              </p>
            </div>
            <span className="material-symbols-outlined text-5xl text-purple-600 dark:text-purple-400 opacity-50">
              schedule
            </span>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
                이번 달 환불
              </p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                ₩198K
              </p>
            </div>
            <span className="material-symbols-outlined text-5xl text-orange-600 dark:text-orange-400 opacity-50">
              money_off
            </span>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pgSettings")}
            className={`px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "pgSettings"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            PG사 설정
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "plans"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            구독 설정
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "pricing"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            금액 설정
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            전체 결제 내역
          </button>
          <button
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "cards"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            카드 관리
          </button>
          <button
            onClick={() => setActiveTab("trials")}
            className={`px-4 py-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "trials"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            무료 체험 관리
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "pgSettings" && <PGSettingsTab />}
      {activeTab === "plans" && <PlansTab />}
      {activeTab === "pricing" && <PricingTab />}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "cards" && <CardsTab />}
      {activeTab === "trials" && <TrialsTab />}
    </div>
  );
}

// PG사 설정 탭
function PGSettingsTab() {
  const [selectedPG, setSelectedPG] = useState<"stripe" | "toss" | "ksnet" | null>(null);
  const [pgSettings, setPGSettings] = useState({
    stripe: { secretKey: "", publishableKey: "" },
    toss: { clientKey: "", secretKey: "" },
    ksnet: { mid: "", signKey: "" },
  });

  const handleSave = () => {
    alert("PG사 설정이 저장되었습니다.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
          PG사 선택
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          결제 대행사를 선택하고 API 키를 입력하면 자동으로 연동됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stripe */}
          <button
            onClick={() => setSelectedPG("stripe")}
            className={`p-6 border-2 rounded-xl transition ${
              selectedPG === "stripe"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">S</span>
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white">Stripe</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                글로벌 결제 플랫폼
              </p>
            </div>
          </button>

          {/* Toss Payments */}
          <button
            onClick={() => setSelectedPG("toss")}
            className={`p-6 border-2 rounded-xl transition ${
              selectedPG === "toss"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">T</span>
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white">Toss Payments</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                토스페이먼츠
              </p>
            </div>
          </button>

          {/* Ksnet */}
          <button
            onClick={() => setSelectedPG("ksnet")}
            className={`p-6 border-2 rounded-xl transition ${
              selectedPG === "ksnet"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">K</span>
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white">KSNET</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                케이에스넷
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* PG사별 설정 입력 */}
      {selectedPG && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            {selectedPG === "stripe" && "Stripe API 설정"}
            {selectedPG === "toss" && "Toss Payments API 설정"}
            {selectedPG === "ksnet" && "KSNET API 설정"}
          </h3>

          {selectedPG === "stripe" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key *
                </label>
                <input
                  type="password"
                  value={pgSettings.stripe.secretKey}
                  onChange={(e) =>
                    setPGSettings({
                      ...pgSettings,
                      stripe: { ...pgSettings.stripe, secretKey: e.target.value },
                    })
                  }
                  placeholder="sk_live_..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publishable Key *
                </label>
                <input
                  type="text"
                  value={pgSettings.stripe.publishableKey}
                  onChange={(e) =>
                    setPGSettings({
                      ...pgSettings,
                      stripe: { ...pgSettings.stripe, publishableKey: e.target.value },
                    })
                  }
                  placeholder="pk_live_..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                ℹ️ Stripe Dashboard → Developers → API keys에서 확인하실 수 있습니다.
              </p>
            </div>
          )}

          {selectedPG === "toss" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client Key *
                </label>
                <input
                  type="text"
                  value={pgSettings.toss.clientKey}
                  onChange={(e) =>
                    setPGSettings({
                      ...pgSettings,
                      toss: { ...pgSettings.toss, clientKey: e.target.value },
                    })
                  }
                  placeholder="test_ck_..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key *
                </label>
                <input
                  type="password"
                  value={pgSettings.toss.secretKey}
                  onChange={(e) =>
                    setPGSettings({
                      ...pgSettings,
                      toss: { ...pgSettings.toss, secretKey: e.target.value },
                    })
                  }
                  placeholder="test_sk_..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                ℹ️ 토스페이먼츠 개발자센터 → 내 개발 정보에서 확인하실 수 있습니다.
              </p>
            </div>
          )}

          {selectedPG === "ksnet" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  가맹점 ID (MID) *
                </label>
                <input
                  type="text"
                  value={pgSettings.ksnet.mid}
                  onChange={(e) =>
                    setPGSettings({
                      ...pgSettings,
                      ksnet: { ...pgSettings.ksnet, mid: e.target.value },
                    })
                  }
                  placeholder="2999199999"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sign Key *
                </label>
                <input
                  type="password"
                  value={pgSettings.ksnet.signKey}
                  onChange={(e) =>
                    setPGSettings({
                      ...pgSettings,
                      ksnet: { ...pgSettings.ksnet, signKey: e.target.value },
                    })
                  }
                  placeholder="XXXXXXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                ℹ️ KSNET 관리자페이지 → 가맹점정보에서 확인하실 수 있습니다.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setSelectedPG(null)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              저장 및 연동
            </button>
          </div>
        </div>
      )}

      {/* 현재 설정 상태 */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-900">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
            check_circle
          </span>
          <div>
            <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
              현재 연동 상태
            </h4>
            <p className="text-xs text-green-700 dark:text-green-400">
              {selectedPG ? `${selectedPG.toUpperCase()} 결제가 활성화되어 있습니다.` : "PG사가 연동되지 않았습니다."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 구독 설정 탭
function PlansTab() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    {
      id: "1",
      type: "INDIVIDUAL",
      name: "개인 계정",
      monthlyPrice: 9900,
      yearlyPrice: 99000,
      features: ["1인 사용", "기본 교육 기능", "QR 증빙 시스템", "PDF 생성"],
      maxUsers: 1,
      isActive: true,
    },
    {
      id: "2",
      type: "COMPANY",
      name: "회사 계정",
      monthlyPrice: 99000,
      yearlyPrice: 990000,
      features: ["무제한 회원", "모든 기능 포함", "AI 자동 번역", "우선 지원", "맞춤 브랜딩"],
      maxUsers: null,
      isActive: true,
    },
  ]);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          구독 플랜 관리
        </h2>
        <button
          onClick={() => setShowNewPlanModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>새 플랜 추가</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {plan.name}
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={plan.isActive}
                  onChange={(e) => {
                    const updated = plans.map((p) =>
                      p.id === plan.id ? { ...p, isActive: e.target.checked } : p
                    );
                    setPlans(updated);
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-black dark:text-white">
                  ₩{plan.monthlyPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">/월</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₩{plan.yearlyPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">/년</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                최대 사용자: {plan.maxUsers ? `${plan.maxUsers}명` : "무제한"}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                포함된 기능
              </p>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">
                      check
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                수정
              </button>
              <button className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 새 플랜 추가 모달 */}
      {showNewPlanModal && (
        <NewPlanModal
          onClose={() => setShowNewPlanModal(false)}
          onSuccess={() => {
            setShowNewPlanModal(false);
            // TODO: Refresh plans list
          }}
        />
      )}
    </div>
  );
}

// 금액 설정 탭
function PricingTab() {
  const [individualMonthly, setIndividualMonthly] = useState(9900);
  const [individualYearly, setIndividualYearly] = useState(99000);
  const [companyMonthly, setCompanyMonthly] = useState(99000);
  const [companyYearly, setCompanyYearly] = useState(990000);
  const [trialDays, setTrialDays] = useState(14);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
          개인 계정 가격
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              월간 구독 (원)
            </label>
            <input
              type="number"
              value={individualMonthly}
              onChange={(e) => setIndividualMonthly(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              표시: ₩{individualMonthly.toLocaleString()}/월
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              연간 구독 (원)
            </label>
            <input
              type="number"
              value={individualYearly}
              onChange={(e) => setIndividualYearly(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              표시: ₩{individualYearly.toLocaleString()}/년 ({Math.round((1 - individualYearly / (individualMonthly * 12)) * 100)}% 할인)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
          회사 계정 가격
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              월간 구독 (원)
            </label>
            <input
              type="number"
              value={companyMonthly}
              onChange={(e) => setCompanyMonthly(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              표시: ₩{companyMonthly.toLocaleString()}/월
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              연간 구독 (원)
            </label>
            <input
              type="number"
              value={companyYearly}
              onChange={(e) => setCompanyYearly(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              표시: ₩{companyYearly.toLocaleString()}/년 ({Math.round((1 - companyYearly / (companyMonthly * 12)) * 100)}% 할인)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
          무료 체험 기간
        </h2>

        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            체험 기간 (일)
          </label>
          <input
            type="number"
            value={trialDays}
            onChange={(e) => setTrialDays(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-black dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            신규 가입 시 {trialDays}일 무료 체험 제공
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          변경사항 저장
        </button>
      </div>
    </div>
  );
}

// 전체 결제 내역 탭
function HistoryTab() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      userId: "user1",
      userName: "김철수",
      userEmail: "kim@example.com",
      planType: "회사 계정",
      amount: 990000,
      date: "2025-01-18",
      status: "completed",
      method: "신용카드",
      cardLast4: "1234",
    },
    {
      id: "2",
      userId: "user2",
      userName: "이영희",
      userEmail: "lee@example.com",
      planType: "개인 계정",
      amount: 9900,
      date: "2025-01-17",
      status: "completed",
      method: "신용카드",
      cardLast4: "5678",
    },
    {
      id: "3",
      userId: "user3",
      userName: "박민수",
      userEmail: "park@example.com",
      planType: "회사 계정",
      amount: 990000,
      date: "2025-01-16",
      status: "refunded",
      method: "신용카드",
      cardLast4: "9012",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { text: "완료", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      pending: { text: "대기", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      failed: { text: "실패", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      refunded: { text: "환불", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
    };
    const badge = badges[status as keyof typeof badges] || badges.completed;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="사용자 이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="completed">완료</option>
            <option value="pending">대기</option>
            <option value="failed">실패</option>
            <option value="refunded">환불</option>
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Excel 다운로드</span>
          </button>
        </div>
      </div>

      {/* 결제 내역 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  플랜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  결제 수단
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">
                        {payment.userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.userEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">
                    {payment.planType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                    ₩{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(payment.date).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {payment.method} {payment.cardLast4 && `•••• ${payment.cardLast4}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 mr-3">
                      상세
                    </button>
                    {payment.status === "completed" && (
                      <button className="text-red-600 hover:text-red-800 dark:text-red-400">
                        환불
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 카드 관리 탭
function CardsTab() {
  const [transactions, setTransactions] = useState<CardTransaction[]>([
    {
      id: "1",
      userId: "user1",
      userName: "김철수",
      cardLast4: "1234",
      cardBrand: "VISA",
      amount: 990000,
      date: "2025-01-18",
      status: "completed",
      description: "회사 계정 - 연간 구독",
      canCancel: false,
    },
    {
      id: "2",
      userId: "user2",
      userName: "이영희",
      cardLast4: "5678",
      cardBrand: "MasterCard",
      amount: 9900,
      date: "2025-01-17",
      status: "completed",
      description: "개인 계정 - 월간 구독",
      canCancel: true,
    },
  ]);

  const handleCancelTransaction = (transactionId: string) => {
    if (confirm("정말 이 카드 거래를 취소하시겠습니까?")) {
      const updated = transactions.map((t) =>
        t.id === transactionId ? { ...t, status: "cancelled" as const, canCancel: false } : t
      );
      setTransactions(updated);
      alert("거래가 취소되었습니다.");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { text: "완료", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      pending: { text: "대기", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      failed: { text: "실패", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      cancelled: { text: "취소", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
    };
    const badge = badges[status as keyof typeof badges] || badges.completed;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          카드 거래 내역
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          ℹ️ 24시간 이내 거래만 취소 가능합니다
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  카드 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  내역
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">
                    {transaction.userName}
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                        credit_card
                      </span>
                      <span>{transaction.cardBrand} •••• {transaction.cardLast4}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                    ₩{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.canCancel && transaction.status === "completed" ? (
                      <button
                        onClick={() => handleCancelTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        <span>취소</span>
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 무료 체험 관리 탭
function TrialsTab() {
  const [trials, setTrials] = useState<FreeTrial[]>([
    {
      id: "1",
      userId: "user4",
      userName: "최지훈",
      userEmail: "choi@example.com",
      startDate: "2025-01-10",
      endDate: "2025-01-24",
      status: "active",
      planType: "회사 계정",
    },
    {
      id: "2",
      userId: "user5",
      userName: "정미영",
      userEmail: "jung@example.com",
      startDate: "2025-01-05",
      endDate: "2025-01-19",
      status: "active",
      planType: "개인 계정",
    },
    {
      id: "3",
      userId: "user6",
      userName: "강동욱",
      userEmail: "kang@example.com",
      startDate: "2024-12-20",
      endDate: "2025-01-03",
      status: "converted",
      planType: "회사 계정",
    },
  ]);
  const [showGrantTrialModal, setShowGrantTrialModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: "진행 중", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      expired: { text: "만료", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      converted: { text: "전환 완료", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleExtendTrial = (trialId: string) => {
    const days = prompt("연장할 일수를 입력하세요:", "7");
    if (days && parseInt(days) > 0) {
      alert(`무료 체험이 ${days}일 연장되었습니다.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          무료 체험 사용자 목록
        </h2>
        <button
          onClick={() => setShowGrantTrialModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span>무료 체험 부여</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  플랜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  시작일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  종료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  남은 기간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {trials.map((trial) => {
                const remainingDays = getRemainingDays(trial.endDate);
                return (
                  <tr key={trial.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">
                          {trial.userName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {trial.userEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-black dark:text-white">
                      {trial.planType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(trial.startDate).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(trial.endDate).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {trial.status === "active" && (
                        <span className={`font-medium ${
                          remainingDays <= 3 ? "text-red-600 dark:text-red-400" : "text-black dark:text-white"
                        }`}>
                          {remainingDays}일
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(trial.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {trial.status === "active" && (
                        <button
                          onClick={() => handleExtendTrial(trial.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          연장
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 무료 체험 부여 모달 */}
      {showGrantTrialModal && (
        <GrantTrialModal
          onClose={() => setShowGrantTrialModal(false)}
          onSuccess={() => {
            setShowGrantTrialModal(false);
            // TODO: Refresh trials list
          }}
        />
      )}
    </div>
  );
}
