import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import TripMap from '../../components/TripMap';
import RouteProgress from '../../components/RouteProgress';

export default function TripTracking() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 테스트용 고객 ID (실제로는 로그인된 사용자 ID 사용)
  const customerId = 'customer-id';

  useEffect(() => {
    if (tripId) {
      loadTripDetail();
    }
  }, [tripId]);

  // 자동 새로고침 (10초마다)
  useEffect(() => {
    if (!autoRefresh || !tripId) return;

    const intervalId = setInterval(() => {
      loadTripDetail();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [tripId, autoRefresh]);

  const loadTripDetail = async () => {
    try {
      const response: any = await tripApi.getTripDetail(tripId!);
      if (response.success) {
        setTrip(response.data);
      }
    } catch (error) {
      console.error('Trip 상세 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">운행 정보를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/customer')}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const currentLocation = trip.currentLat && trip.currentLng
    ? { lat: trip.currentLat, lng: trip.currentLng }
    : null;

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; icon: string }> = {
      PLANNED: { text: '계획됨', color: 'bg-blue-100 text-blue-800', icon: '📋' },
      READY: { text: '준비 완료', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' },
      IN_PROGRESS: { text: '운행 중', color: 'bg-green-100 text-green-800', icon: '🚗' },
      COMPLETED: { text: '완료', color: 'bg-gray-100 text-gray-800', icon: '✅' },
    };
    return statusMap[status] || statusMap.PLANNED;
  };

  const statusInfo = getStatusInfo(trip.status);

  // ETA 계산 (간단한 직선 거리 기반)
  const calculateETA = (stops: any[], currentLoc: { lat: number; lng: number }) => {
    const nextStop = stops?.find((s: any) => !s.actualTime);
    if (!nextStop || !currentLoc) return '--:--';

    // Haversine 거리 계산 (km)
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = toRad(nextStop.latitude - currentLoc.lat);
    const dLng = toRad(nextStop.longitude - currentLoc.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(currentLoc.lat)) *
        Math.cos(toRad(nextStop.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // 평균 속도 25km/h 가정 (도심 교통)
    const minutes = Math.round((distance / 25) * 60);

    if (minutes < 1) return '곧 도착';
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customer')}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          ← 뒤로
        </button>

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            autoRefresh
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <span>{autoRefresh ? '🔄' : '⏸️'}</span>
          <span className="text-sm font-medium">
            {autoRefresh ? '자동 새로고침 켜짐' : '자동 새로고침 꺼짐'}
          </span>
        </button>
      </div>

      {/* Trip Status Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {trip.direction === 'OUTBOUND' ? '🚖 가는 편' : '🏠 귀가 편'}
          </h2>
          <span className={`px-4 py-2 rounded-full font-semibold ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.text}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">출발 시간</p>
            <p className="text-lg font-semibold">
              {format(new Date(trip.startTime), 'HH:mm', { locale: ko })}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">도착 예정</p>
            <p className="text-lg font-semibold">
              {format(new Date(trip.endTime), 'HH:mm', { locale: ko })}
            </p>
          </div>
        </div>

        {trip.vehicle && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-blue-100 text-sm mb-1">차량 정보</p>
            <p className="text-lg font-semibold">
              {trip.vehicle.name} • {trip.vehicle.licensePlate}
            </p>
          </div>
        )}

        {trip.driver && (
          <div className="mt-3">
            <p className="text-blue-100 text-sm mb-1">기사님</p>
            <p className="text-lg font-semibold">
              {trip.driver.name} • {trip.driver.phone}
            </p>
          </div>
        )}
      </div>

      {/* 실시간 위치 정보 & ETA */}
      {trip.status === 'IN_PROGRESS' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl animate-pulse">🚗</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">기사님이 이동 중</h3>
                  {trip.lastLocationUpdate && (
                    <p className="text-green-100 text-sm">
                      {format(new Date(trip.lastLocationUpdate), 'HH:mm', { locale: ko })} 업데이트
                    </p>
                  )}
                </div>
              </div>
              {currentLocation && (
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {calculateETA(trip.stops, currentLocation)}
                  </div>
                  <p className="text-green-100 text-sm">예상 도착</p>
                </div>
              )}
            </div>
          </div>

          {/* 다음 정거장 정보 */}
          {(() => {
            const nextStop = trip.stops?.find((s: any) => !s.actualTime);
            if (!nextStop) return null;
            return (
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    nextStop.stopType === 'PICKUP' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {nextStop.stopType === 'PICKUP' ? '🚶' : '🏁'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {nextStop.stopType === 'PICKUP' ? '다음 픽업' : '다음 하차'}
                    </p>
                    <p className="font-semibold text-gray-900 truncate">{nextStop.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">예정 시간</p>
                    <p className="font-bold text-gray-900">
                      {format(new Date(nextStop.scheduledTime), 'HH:mm', { locale: ko })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 위치 대기 중 */}
          {!currentLocation && (
            <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-sm">위치 정보를 불러오는 중...</span>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      {trip.stops && trip.stops.length > 0 && (
        <TripMap
          stops={trip.stops}
          currentLocation={currentLocation}
          showRoute={true}
          height="500px"
        />
      )}

      {/* Route Progress */}
      {trip.stops && trip.stops.length > 0 && (
        <RouteProgress
          stops={trip.stops}
          currentCustomerId={customerId}
          showCustomerInfo={true}
        />
      )}

      {/* 안내 메시지 */}
      {trip.status === 'READY' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                기사님이 곧 출발합니다!
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                픽업 장소에서 대기해주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {trip.status === 'IN_PROGRESS' && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">🚗</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 font-medium">
                차량이 이동 중입니다!
              </p>
              <p className="text-xs text-green-600 mt-1">
                위 지도에서 실시간 위치를 확인하세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {trip.status === 'COMPLETED' && (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700 font-medium">
                운행이 완료되었습니다!
              </p>
              <p className="text-xs text-gray-600 mt-1">
                이용해 주셔서 감사합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 탑승자 정보 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          함께 타시는 분들 ({trip.bookings?.length || 0}명)
        </h3>
        <div className="space-y-2">
          {trip.bookings?.map((booking: any, index: number) => (
            <div
              key={booking.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{booking.customer.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
