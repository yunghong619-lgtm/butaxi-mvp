import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripApi } from '../../services/api';
import { format } from 'date-fns';
import VehicleCard from '../../components/VehicleCard';

export default function DriverHome() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 테스트용 기사 ID (localStorage 또는 기본값)
  const driverId = localStorage.getItem('butaxi_driver_id') || 'cmkce151w0002l12rbs8w4loc';

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
    const badges: Record<string, { label: string }> = {
      PLANNED: { label: '대기중' },
      READY: { label: '준비완료' },
      IN_PROGRESS: { label: '운행중' },
      COMPLETED: { label: '완료' },
    };

    const badge = badges[status] || { label: status };

    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-black text-white">
        {badge.label}
      </span>
    );
  };

  // 예상 총 수익 계산
  const totalEarnings = trips.reduce((sum, trip) => {
    const tripRevenue = trip.bookings?.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0) || 0;
    return sum + Math.round(tripRevenue * 0.9); // 10% 수수료 공제
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - 검은색 통일 */}
      <div className="bg-black text-white p-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm">안녕하세요</p>
            <h1 className="text-2xl font-bold">박기사님</h1>
          </div>
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Driver"
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=박기사&background=fff&color=000&size=48';
            }}
          />
        </div>
        <p className="text-gray-300">오늘도 안전 운행 부탁드립니다!</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-12">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-xs text-gray-400 mb-1">오늘 운행</p>
            <p className="text-2xl font-bold">{trips.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-xs text-gray-400 mb-1">총 승객</p>
            <p className="text-2xl font-bold">
              {trips.reduce((sum, trip) => sum + (trip.bookings?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-xs text-gray-400 mb-1">예상 수익</p>
            <p className="text-lg font-bold text-green-600">
              {totalEarnings > 0 ? `${(totalEarnings / 10000).toFixed(1)}만` : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="p-4 mt-6">
        <h2 className="text-lg font-bold mb-4">배정된 운행</h2>

        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              배정된 운행이 없습니다
            </h3>
            <p className="text-gray-500 text-sm">
              새로운 운행이 배정되면 알려드리겠습니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => {
              // 해당 Trip의 예상 수익
              const tripRevenue = trip.bookings?.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0) || 0;
              const tripEarnings = Math.round(tripRevenue * 0.9);

              return (
                <Link
                  key={trip.id}
                  to={`/driver/trips/${trip.id}`}
                  className="block bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-5">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                          {trip.direction === 'OUTBOUND' ? '가' : '귀'}
                        </div>
                        <div>
                          <h4 className="font-bold">
                            {trip.direction === 'OUTBOUND' ? '가는 편' : '귀가 편'}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {trip.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(trip.status)}
                    </div>

                    {/* 차량 정보 */}
                    <div className="p-3 bg-gray-50 rounded-xl mb-4">
                      <VehicleCard vehicle={trip.vehicle} size="small" showDetails={true} />
                    </div>

                    {/* 정보 그리드 */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">출발</p>
                        <p className="font-bold text-lg">
                          {format(new Date(trip.startTime), 'HH:mm')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">승객</p>
                        <p className="font-bold text-lg">{trip.bookings?.length || 0}명</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">예상 수익</p>
                        <p className="font-bold text-lg text-green-600">
                          {tripEarnings > 0 ? `${tripEarnings.toLocaleString()}` : '-'}
                        </p>
                      </div>
                    </div>

                    {/* 승객 목록 미리보기 */}
                    {trip.bookings && trip.bookings.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">탑승 승객</p>
                        <div className="flex -space-x-2">
                          {trip.bookings.slice(0, 4).map((booking: any, idx: number) => (
                            <div
                              key={idx}
                              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
                            >
                              {booking.customer?.name?.[0] || '?'}
                            </div>
                          ))}
                          {trip.bookings.length > 4 && (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                              +{trip.bookings.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 하단 */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        정거장 {trip.stops?.length || 0}개
                      </p>
                      <span className="text-black font-bold text-sm flex items-center gap-1">
                        상세보기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
