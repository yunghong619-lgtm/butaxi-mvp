import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripApi } from '../../services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DriverHome() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const driverId = 'driver-id';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS');
  const plannedTrips = trips.filter(t => t.status === 'PLANNED' || t.status === 'READY');
  const totalPassengers = trips.reduce((sum, trip) => sum + (trip.bookings?.length || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-3">
            기사님 대시보드
          </h1>
          <p className="text-xl text-gray-600">
            오늘도 안전 운행 하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="border-2 border-black p-6 rounded-xl">
            <div className="text-4xl font-bold mb-2">{plannedTrips.length}</div>
            <div className="text-gray-600">예정 운행</div>
          </div>
          <div className="border-2 border-gray-200 p-6 rounded-xl">
            <div className="text-4xl font-bold mb-2">{totalPassengers}</div>
            <div className="text-gray-600">총 승객</div>
          </div>
          <div className="border-2 border-gray-200 p-6 rounded-xl">
            <div className="text-4xl font-bold mb-2">{activeTrips.length}</div>
            <div className="text-gray-600">진행 중</div>
          </div>
        </div>

        {/* Active Trips */}
        {activeTrips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">진행 중인 운행</h2>
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/driver/trips/${trip.id}`}
                  className="block border-2 border-black p-6 rounded-xl hover:bg-black hover:text-white transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg mb-2">
                        {trip.direction === 'OUTBOUND' ? '가는편' : '귀가편'}
                      </div>
                      <div className="text-sm text-gray-600 group-hover:text-gray-300">
                        {format(new Date(trip.startTime), 'HH:mm', { locale: ko })} 출발 • 승객 {trip.bookings?.length || 0}명
                      </div>
                    </div>
                    <span className="text-2xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Planned Trips */}
        <div>
          <h2 className="text-2xl font-bold mb-6">예정된 운행</h2>
          {plannedTrips.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500">예정된 운행이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plannedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/driver/trips/${trip.id}`}
                  className="block border-2 border-gray-200 p-6 rounded-xl hover:border-black transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-lg">
                      {trip.direction === 'OUTBOUND' ? '가는편' : '귀가편'}
                    </div>
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                      {trip.status === 'PLANNED' ? '계획됨' : '준비 완료'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">출발</div>
                      <div className="font-medium">
                        {format(new Date(trip.startTime), 'MM/dd HH:mm', { locale: ko })}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">정거장</div>
                      <div className="font-medium">{trip.stops?.length || 0}개</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">승객</div>
                      <div className="font-medium">{trip.bookings?.length || 0}명</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
