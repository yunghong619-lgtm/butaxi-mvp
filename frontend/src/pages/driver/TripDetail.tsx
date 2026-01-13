import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../services/api';
import { format } from 'date-fns';
import TripMap from '../../components/TripMap';
import RouteProgress from '../../components/RouteProgress';
import { useGeolocation } from '../../hooks/useGeolocation';

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locationUpdating, setLocationUpdating] = useState(false);
  
  // 실시간 위치 추적 (운행 중일 때만)
  const { latitude, longitude, error: geoError, getCurrentPosition } = useGeolocation({
    enableHighAccuracy: true,
    watch: false, // 수동으로 업데이트
  });

  useEffect(() => {
    if (tripId) {
      loadTripDetail();
    }
  }, [tripId]);

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

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await tripApi.updateTripStatus(tripId!, newStatus);
      alert('상태가 업데이트되었습니다.');
      loadTripDetail();
    } catch (error) {
      alert('상태 업데이트 실패');
    }
  };

  const handleUpdateLocation = async () => {
    if (!latitude || !longitude) {
      alert('위치 정보를 가져올 수 없습니다.');
      return;
    }

    setLocationUpdating(true);
    try {
      await tripApi.updateDriverLocation(tripId!, { latitude, longitude });
      alert('위치가 업데이트되었습니다!');
      loadTripDetail();
    } catch (error) {
      alert('위치 업데이트 실패');
    } finally {
      setLocationUpdating(false);
    }
  };

  // 운행 시작 시 위치 권한 요청
  useEffect(() => {
    if (trip?.status === 'IN_PROGRESS') {
      getCurrentPosition();
    }
  }, [trip?.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Trip을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/driver')}
            className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 현재 위치 객체 (지도용)
  const currentLocation = trip?.currentLat && trip?.currentLng
    ? { lat: trip.currentLat, lng: trip.currentLng }
    : null;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { text: string; color: string; icon: string }> = {
      PLANNED: { text: '계획됨', color: 'bg-blue-100 text-blue-800', icon: '📋' },
      READY: { text: '준비 완료', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' },
      IN_PROGRESS: { text: '운행 중', color: 'bg-green-100 text-green-800', icon: '🚗' },
      COMPLETED: { text: '완료', color: 'bg-gray-100 text-gray-800', icon: '✅' },
    };
    return configs[status] || configs.PLANNED;
  };

  const statusConfig = getStatusConfig(trip.status);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/driver')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition"
          >
            <span>←</span>
            <span>뒤로</span>
          </button>
          
          {/* 실시간 위치 업데이트 버튼 (운행 중일 때만) */}
          {trip.status === 'IN_PROGRESS' && (
            <button
              onClick={handleUpdateLocation}
              disabled={locationUpdating || !latitude || !longitude}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>📍</span>
              <span>{locationUpdating ? '전송 중...' : '내 위치 전송'}</span>
            </button>
          )}
        </div>

        {/* 위치 권한 에러 표시 */}
        {geoError && trip.status === 'IN_PROGRESS' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-yellow-800 mb-1">
                  위치 정보를 가져올 수 없습니다
                </p>
                <p className="text-sm text-yellow-700">
                  {geoError}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  브라우저 설정에서 위치 권한을 허용해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trip Status Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {trip.direction === 'OUTBOUND' ? '🚖 가는 편' : '🏠 귀가 편'}
            </h1>
            <span className={`px-4 py-2 rounded-full font-semibold ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.text}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">출발 시간</p>
              <p className="text-lg font-semibold">
                {format(new Date(trip.startTime), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">도착 시간</p>
              <p className="text-lg font-semibold">
                {format(new Date(trip.endTime), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">차량</p>
              <p className="text-lg font-semibold">
                {trip.vehicle.name} • {trip.vehicle.licensePlate}
              </p>
            </div>
          </div>

          {/* Status Action Buttons */}
          <div className="flex gap-3">
            {trip.status === 'PLANNED' && (
              <button
                onClick={() => handleStatusUpdate('READY')}
                className="flex-1 px-6 py-4 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
              >
                ⚡ 준비 완료로 변경
              </button>
            )}
            {trip.status === 'READY' && (
              <button
                onClick={() => handleStatusUpdate('IN_PROGRESS')}
                className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition"
              >
                🚗 운행 시작
              </button>
            )}
            {trip.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleStatusUpdate('COMPLETED')}
                className="flex-1 px-6 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition"
              >
                ✅ 운행 완료
              </button>
            )}
          </div>
        </div>

        {/* Map */}
        {trip.stops && trip.stops.length > 0 && (
          <div className="mb-8">
            <TripMap
              stops={trip.stops}
              currentLocation={currentLocation}
              showRoute={true}
              height="500px"
            />
          </div>
        )}

        {/* Route Progress */}
        {trip.stops && trip.stops.length > 0 && (
          <div className="mb-8">
            <RouteProgress stops={trip.stops} showCustomerInfo={false} />
          </div>
        )}

        {/* Passengers */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6">
            승객 정보 ({trip.bookings?.length || 0}명)
          </h3>

          {trip.bookings && trip.bookings.length > 0 ? (
            <div className="space-y-3">
              {trip.bookings.map((booking: any, index: number) => (
                <div key={booking.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{booking.customer.name}</p>
                      <p className="text-sm text-gray-600">{booking.customer.phone}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    booking.status === 'IN_TRIP' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status === 'CONFIRMED' ? '확정' : booking.status === 'IN_TRIP' ? '탑승 중' : booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">승객 정보가 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
