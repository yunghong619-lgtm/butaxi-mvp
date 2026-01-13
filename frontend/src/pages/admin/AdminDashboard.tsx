export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">BUTAXI 시스템 전체 현황</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">예약 요청</p>
            <p className="text-3xl font-bold text-black">24</p>
            <p className="text-xs text-gray-400 mt-1">이번 주</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">매칭 성공률</p>
            <p className="text-3xl font-bold text-black">85%</p>
            <p className="text-xs text-gray-400 mt-1">평균</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">운행 중</p>
            <p className="text-3xl font-bold text-black">3</p>
            <p className="text-xs text-gray-400 mt-1">현재</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">평균 탑승률</p>
            <p className="text-3xl font-bold text-black">72%</p>
            <p className="text-xs text-gray-400 mt-1">차량당</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-black mb-6">빠른 작업</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-black mb-1">수동 매칭 실행</h3>
              <p className="text-sm text-gray-600">대기 중인 요청 매칭</p>
            </button>

            <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-black mb-1">차량 관리</h3>
              <p className="text-sm text-gray-600">등록 및 상태 관리</p>
            </button>

            <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-black mb-1">통계 보고서</h3>
              <p className="text-sm text-gray-600">상세 분석 리포트</p>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-black mb-6">시스템 상태</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-black">백엔드 서버</span>
              </div>
              <span className="text-sm text-gray-600">정상</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-black">매칭 엔진</span>
              </div>
              <span className="text-sm text-gray-600">정상 (10분마다)</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-black">데이터베이스</span>
              </div>
              <span className="text-sm text-gray-600">정상</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-black">Kakao Maps API</span>
              </div>
              <span className="text-sm text-gray-600">대기 중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
