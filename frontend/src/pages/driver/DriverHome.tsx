import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripApi } from '../../services/api';
import { format } from 'date-fns';

export default function DriverHome() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 테스트용 기사 ID
  const driverId = 'driver-id'; // TODO: 실제 로그인 시스템 연동

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const response: any = await tripApi.getDriverTrips(driverId);
      if (response.success) {
        setTrips(response.data);
      }
    } catch (error) {
      console.error('Trip 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      PLANNED: { color: 'bg-blue-100 text-blue-800', text: '계획됨' },
      READY: { color: 'bg-yellow-100 text-yellow-800', text: '준비 완료' },
      IN_PROGRESS: { color: 'bg-green-100 text-green-800', text: '운행 중' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', text: '완료' },
    };

    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">기사님 대시보드</h2>
        <p className="text-lg">오늘도 안전 운행 부탁드립니다! 🚗</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">오늘 예정 운행</p>
          <p className="text-3xl font-bold text-primary-600">{trips.length}건</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">총 승객</p>
          <p className="text-3xl font-bold text-success-600">
            {trips.reduce((sum, trip) => sum + (trip.bookings?.length || 0), 0)}명
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">완료율</p>
          <p className="text-3xl font-bold text-gray-800">
            {trips.length > 0
              ? Math.round(
                  (trips.filter((t) => t.status === 'COMPLETED').length / trips.length) * 100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Trip List */}
      <div>
        <h3 className="text-xl font-bold mb-4">배정된 운행</h3>

        {trips.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🚖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              배정된 운행이 없습니다
            </h3>
            <p className="text-gray-600">새로운 운행이 배정되면 알려드리겠습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/driver/trips/${trip.id}`}
                className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      {trip.direction === 'OUTBOUND' ? '🚖 가는 편' : '🏠 귀가 편'}
                    </h4>
                    <p className="text-sm text-gray-500">Trip ID: {trip.id}</p>
                  </div>
                  <div>{getStatusBadge(trip.status)}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">출발 시간</p>
                    <p className="font-semibold">
                      {format(new Date(trip.startTime), 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">차량</p>
                    <p className="font-semibold">{trip.vehicle.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">승객 수</p>
                    <p className="font-semibold">{trip.bookings?.length || 0}명</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    정거장 {trip.stops?.length || 0}개
                  </p>
                  <span className="text-primary-600 font-semibold">상세보기 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
