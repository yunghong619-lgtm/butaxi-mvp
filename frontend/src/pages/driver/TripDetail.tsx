import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../services/api';
import { format } from 'date-fns';

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleCheckIn = async (stopId: string) => {
    try {
      await tripApi.checkInStop(stopId);
      alert('체크인 완료!');
      loadTripDetail();
    } catch (error) {
      alert('체크인 실패');
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
        <p className="text-gray-600">Trip을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/driver')}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          ← 뒤로
        </button>
      </div>

      {/* Trip Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">
          {trip.direction === 'OUTBOUND' ? '🚖 가는 편 운행' : '🏠 귀가 편 운행'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">출발 시간</p>
            <p className="font-semibold">
              {format(new Date(trip.startTime), 'yyyy-MM-dd HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">도착 시간</p>
            <p className="font-semibold">
              {format(new Date(trip.endTime), 'yyyy-MM-dd HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">차량</p>
            <p className="font-semibold">
              {trip.vehicle.name} ({trip.vehicle.licensePlate})
            </p>
          </div>
        </div>

        {/* Status Update */}
        <div className="flex space-x-4">
          {trip.status === 'PLANNED' && (
            <button
              onClick={() => handleStatusUpdate('READY')}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
            >
              준비 완료로 변경
            </button>
          )}
          {trip.status === 'READY' && (
            <button
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              운행 시작
            </button>
          )}
          {trip.status === 'IN_PROGRESS' && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              운행 완료
            </button>
          )}
        </div>
      </div>

      {/* Stops */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">경로 ({trip.stops?.length || 0}개 정거장)</h3>

        <div className="space-y-4">
          {trip.stops?.map((stop: any, index: number) => (
            <div
              key={stop.id}
              className="flex items-start space-x-4 p-4 border rounded-lg"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      stop.stopType === 'PICKUP'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {stop.stopType === 'PICKUP' ? '픽업' : '하차'}
                  </span>
                  {stop.actualTime && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                      ✓ 체크인 완료
                    </span>
                  )}
                </div>

                <p className="font-semibold">{stop.address}</p>
                <p className="text-sm text-gray-600">
                  예정: {format(new Date(stop.scheduledTime), 'HH:mm')}
                  {stop.actualTime &&
                    ` | 실제: ${format(new Date(stop.actualTime), 'HH:mm')}`}
                </p>
              </div>

              {trip.status === 'IN_PROGRESS' && !stop.actualTime && (
                <button
                  onClick={() => handleCheckIn(stop.id)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  체크인
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Passengers */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">승객 정보</h3>

        <div className="space-y-3">
          {trip.bookings?.map((booking: any) => (
            <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">{booking.customer.name}</p>
                <p className="text-sm text-gray-600">{booking.customer.phone}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
