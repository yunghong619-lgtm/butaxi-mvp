export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">관리자 대시보드</h2>
        <p className="text-lg">RETURN 시스템 전체 현황</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">전체 예약 요청</p>
          <p className="text-3xl font-bold text-primary-600">24</p>
          <p className="text-xs text-gray-500 mt-1">이번 주</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">매칭 성공률</p>
          <p className="text-3xl font-bold text-success-600">85%</p>
          <p className="text-xs text-gray-500 mt-1">평균</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">운행 중 Trip</p>
          <p className="text-3xl font-bold text-warning-600">3</p>
          <p className="text-xs text-gray-500 mt-1">현재</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">평균 탑승률</p>
          <p className="text-3xl font-bold text-gray-800">72%</p>
          <p className="text-xs text-gray-500 mt-1">차량당</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">빠른 작업</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-primary-200 rounded-lg hover:bg-primary-50 transition text-left">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-semibold mb-1">수동 매칭 실행</h4>
            <p className="text-sm text-gray-600">대기 중인 요청들을 매칭합니다</p>
          </button>

          <button className="p-4 border-2 border-success-200 rounded-lg hover:bg-success-50 transition text-left">
            <div className="text-2xl mb-2">🚗</div>
            <h4 className="font-semibold mb-1">차량 관리</h4>
            <p className="text-sm text-gray-600">차량 등록 및 상태 관리</p>
          </button>

          <button className="p-4 border-2 border-warning-200 rounded-lg hover:bg-warning-50 transition text-left">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold mb-1">통계 보고서</h4>
            <p className="text-sm text-gray-600">상세 분석 리포트 확인</p>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">시스템 상태</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">백엔드 서버</span>
            </div>
            <span className="text-green-700 text-sm">정상</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">매칭 엔진</span>
            </div>
            <span className="text-green-700 text-sm">정상 (10분마다 실행)</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">데이터베이스</span>
            </div>
            <span className="text-green-700 text-sm">정상 (SQLite)</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-semibold">Kakao Maps API</span>
            </div>
            <span className="text-blue-700 text-sm">대기 (키 설정 필요)</span>
          </div>
        </div>
      </div>

      {/* MVP Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">📌 MVP 버전 안내</h3>
        <p className="text-yellow-700 text-sm mb-3">
          현재 MVP 단계로 일부 기능이 제한되거나 Mock으로 동작합니다.
        </p>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>✓ 결제: Mock 결제 (실제 결제 안 됨)</li>
          <li>✓ 매칭: 단순 규칙 기반 (10분마다 자동 실행)</li>
          <li>✓ 알림: 이메일만 지원 (Firebase 대신)</li>
          <li>✓ DB: SQLite (PostgreSQL로 전환 가능)</li>
        </ul>
      </div>
    </div>
  );
}
