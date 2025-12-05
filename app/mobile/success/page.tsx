export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
          완료!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
          교육 이수 증빙이 제출되었습니다
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Education Completion Verified
        </p>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ℹ️ 교육 이수 확인서는 관리자가 발급합니다.<br />
            이 화면을 닫으셔도 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
