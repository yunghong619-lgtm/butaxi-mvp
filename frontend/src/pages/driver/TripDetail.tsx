import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../services/api';
import { format } from 'date-fns';
import { useToast } from '../../components/Toast';
import VehicleCard from '../../components/VehicleCard';

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
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

      const messages: Record<string, string> = {
        READY: '출발 준비가 완료되었습니다!',
        ARRIVED: '픽업 장소에 도착했습니다!',
        IN_PROGRESS: '운행이 시작되었습니다!',
        COMPLETED: '운행이 완료되었습니다!',
      };

      showToast(messages[newStatus] || '상태가 업데이트되었습니다.', 'success');
      loadTripDetail();
    } catch (error) {
      showToast('상태 업데이트에 실패했습니다.', 'error');
    }
  };

  const handleCheckIn = async (stopId: string) => {
    try {
      await tripApi.checkInStop(stopId);
      showToast('체크인 완료!', 'success');
      loadTripDetail();
    } catch (error) {
      showToast('체크인에 실패했습니다.', 'error');
    }
  };

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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Trip을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/driver')}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 상태 정보 - 심플하고 통일된 스타일
  const getStatusInfo = (status: string) => {
    const info: Record<string, { label: string; active: boolean }> = {
      PLANNED: { label: '대기', active: false },
      READY: { label: '준비', active: false },
      ARRIVED: { label: '도착', active: false },
      IN_PROGRESS: { label: '운행', active: false },
      COMPLETED: { label: '완료', active: false },
    };
    return info[status] || { label: status, active: false };
  };

  const statusOrder = ['PLANNED', 'READY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
  const currentStatusIndex = statusOrder.indexOf(trip.status);

  // 예상 수익 계산 (10% 플랫폼 수수료 공제)
  const totalRevenue = trip.bookings?.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0) || 0;
  const platformFee = Math.round(totalRevenue * 0.1);
  const driverEarnings = totalRevenue - platformFee;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - 검은색 통일 */}
      <div className="bg-black text-white p-6 pb-24">
        <button
          onClick={() => navigate('/driver')}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로
        </button>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm mb-1">
              {trip.direction === 'OUTBOUND' ? '가는 편' : '귀가 편'}
            </p>
            <h1 className="text-2xl font-bold">운행 상세</h1>
          </div>
          <span className="px-4 py-2 bg-white text-black rounded-full font-bold text-sm">
            {getStatusInfo(trip.status).label}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-16 pb-8 space-y-4">
        {/* Trip Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          {/* 차량 정보 */}
          <div className="pb-4 border-b border-gray-100">
            <VehicleCard vehicle={trip.vehicle} size="small" showDetails={true} />
          </div>

          {/* 운행 정보 */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">출발</p>
              <p className="text-xl font-bold">
                {format(new Date(trip.startTime), 'HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">승객</p>
              <p className="text-xl font-bold">{trip.bookings?.length || 0}명</p>
            </div>
          </div>
        </div>

        {/* 예상 수익 카드 */}
        {totalRevenue > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-sm font-bold text-gray-400 mb-4">예상 수익</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">운행 수입</span>
                <span className="font-bold">{totalRevenue.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center text-red-500">
                <span>플랫폼 수수료 (10%)</span>
                <span>-{platformFee.toLocaleString()}원</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-lg">정산 예정</span>
                <span className="font-bold text-xl text-green-600">{driverEarnings.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Control */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-sm font-bold text-gray-400 mb-4">운행 상태</h3>

          {/* Status Progress - 심플한 스타일 */}
          <div className="flex items-center justify-between mb-6">
            {statusOrder.map((status, idx) => {
              const isActive = currentStatusIndex >= idx;
              const isCurrent = currentStatusIndex === idx;
              const info = getStatusInfo(status);

              return (
                <div key={status} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-black ring-offset-2' : ''}`}>
                    {isActive ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-black font-medium' : 'text-gray-400'}`}>
                    {info.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Button - 모두 검은색 통일 */}
          {trip.status === 'PLANNED' && (
            <button
              onClick={() => handleStatusUpdate('READY')}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all"
            >
              출발 준비 완료
            </button>
          )}

          {trip.status === 'READY' && (
            <button
              onClick={() => handleStatusUpdate('ARRIVED')}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all"
            >
              픽업 장소 도착
            </button>
          )}

          {trip.status === 'ARRIVED' && (
            <button
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all"
            >
              운행 시작
            </button>
          )}

          {trip.status === 'IN_PROGRESS' && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all"
            >
              운행 완료
            </button>
          )}

          {trip.status === 'COMPLETED' && (
            <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-lg text-center">
              운행이 완료되었습니다
            </div>
          )}
        </div>

        {/* Route - 픽업/하차 심플한 검은색 스타일 */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400">경로</h3>
            <span className="text-xs text-gray-400">{trip.stops?.length || 0}개 정거장</span>
          </div>

          <div className="space-y-0">
            {trip.stops?.map((stop: any, index: number) => (
              <div key={stop.id} className="flex items-start gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    stop.actualTime
                      ? 'bg-green-500 text-white'
                      : 'bg-black text-white'
                  }`}>
                    {stop.actualTime ? '✓' : index + 1}
                  </div>
                  {index < (trip.stops?.length || 0) - 1 && (
                    <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-black text-white text-xs font-bold rounded">
                      {stop.stopType === 'PICKUP' ? '픽업' : '하차'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(stop.scheduledTime), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{stop.address}</p>

                  {/* Check-in Button */}
                  {trip.status === 'IN_PROGRESS' && !stop.actualTime && (
                    <button
                      onClick={() => handleCheckIn(stop.id)}
                      className="mt-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
                    >
                      체크인
                    </button>
                  )}
                  {stop.actualTime && (
                    <p className="mt-1 text-xs text-green-600 font-medium">
                      {format(new Date(stop.actualTime), 'HH:mm')} 완료
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-sm font-bold text-gray-400 mb-4">탑승 승객</h3>

          {trip.bookings?.length > 0 ? (
            <div className="space-y-3">
              {trip.bookings?.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {booking.customer?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-bold">{booking.customer?.name || '이름 없음'}</p>
                      <p className="text-sm text-gray-500">{booking.customer?.phone || '-'}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${booking.customer?.phone}`}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>탑승 승객이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
