import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalDrivers: 0,
  });

  useEffect(() => {
    // MVP: 하드코딩된 통계 (추후 API 연동)
    setStats({
      totalRequests: 24,
      activeTrips: 3,
      completedTrips: 18,
      totalDrivers: 5,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - 우버 스타일 */}
      <div className="bg-black text-white p-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">butaxi</p>
            <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xl">👑</span>
          </div>
        </div>
        <p className="text-gray-300">시스템 전체 현황을 확인하세요</p>
      </div>

      {/* KPI Cards - 우버 스타일 */}
      <div className="px-4 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <span className="text-xs text-green-500 font-bold">+12%</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalRequests}</p>
            <p className="text-xs text-gray-500">이번 주 예약</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🚗</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-2xl font-bold">{stats.activeTrips}</p>
            <p className="text-xs text-gray-500">운행 중</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.completedTrips}</p>
            <p className="text-xs text-gray-500">완료된 운행</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">👨‍✈️</span>
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.totalDrivers}</p>
            <p className="text-xs text-gray-500">등록 기사</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 mt-6">
        <h2 className="text-lg font-bold mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all text-left group">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="font-bold mb-1">수동 매칭</h3>
            <p className="text-sm text-gray-500">대기 요청을 즉시 매칭</p>
          </button>

          <button className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all text-left group">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚗</span>
            </div>
            <h3 className="font-bold mb-1">차량 관리</h3>
            <p className="text-sm text-gray-500">차량 등록 및 상태</p>
          </button>

          <button className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all text-left group">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-bold mb-1">통계 보고서</h3>
            <p className="text-sm text-gray-500">상세 분석 리포트</p>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">시스템 상태</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            <StatusItem
              name="백엔드 서버"
              status="정상"
              color="green"
            />
            <StatusItem
              name="매칭 엔진"
              status="10분마다 실행"
              color="green"
            />
            <StatusItem
              name="데이터베이스"
              status="SQLite (개발)"
              color="green"
            />
            <StatusItem
              name="SMS 서비스"
              status="SOLAPI 연동"
              color="green"
            />
            <StatusItem
              name="지도 API"
              status="네이버 지도"
              color="green"
            />
          </div>
        </div>
      </div>

      {/* MVP Notice */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📌</span>
            </div>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">MVP 버전</h3>
              <p className="text-sm text-yellow-700 mb-3">
                현재 MVP 단계로 일부 기능이 제한됩니다.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-yellow-800">
                  <span className="w-4 h-4 bg-yellow-300 rounded flex items-center justify-center">✓</span>
                  Mock 결제
                </div>
                <div className="flex items-center gap-2 text-yellow-800">
                  <span className="w-4 h-4 bg-yellow-300 rounded flex items-center justify-center">✓</span>
                  단순 매칭
                </div>
                <div className="flex items-center gap-2 text-yellow-800">
                  <span className="w-4 h-4 bg-yellow-300 rounded flex items-center justify-center">✓</span>
                  SMS 알림
                </div>
                <div className="flex items-center gap-2 text-yellow-800">
                  <span className="w-4 h-4 bg-yellow-300 rounded flex items-center justify-center">✓</span>
                  SQLite DB
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 상태 아이템 컴포넌트
function StatusItem({ name, status, color }: { name: string; status: string; color: 'green' | 'yellow' | 'red' }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 ${colors[color]} rounded-full animate-pulse`}></div>
        <span className="font-medium">{name}</span>
      </div>
      <span className="text-sm text-gray-500">{status}</span>
    </div>
  );
}
