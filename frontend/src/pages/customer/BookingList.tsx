import { useState, useEffect } from 'react';
import { bookingApi } from '../../services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import VehicleIcon from '../../components/VehicleIcon';

export default function BookingList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const customerId = localStorage.getItem('butaxi_customer_id') || '';

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response: any = await bookingApi.getCustomerBookings(customerId);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Booking 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('예약을 취소하시겠습니까? 취소 수수료가 부과될 수 있습니다.')) return;

    try {
      const response: any = await bookingApi.cancelBooking(bookingId);
      if (response.success) {
        alert(response.message);
        loadBookings();
      }
    } catch (error) {
      alert('취소 처리 중 오류가 발생했습니다.');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      CONFIRMED: {
        bg: 'bg-blue-500',
        text: 'text-white',
        label: '예약 확정',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      IN_TRIP: {
        bg: 'bg-green-500',
        text: 'text-white',
        label: '운행 중',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      },
      COMPLETED: {
        bg: 'bg-gray-400',
        text: 'text-white',
        label: '운행 완료',
        icon: 'M5 13l4 4L19 7',
      },
      CANCELLED: {
        bg: 'bg-red-500',
        text: 'text-white',
        label: '취소됨',
        icon: 'M6 18L18 6M6 6l12 12',
      },
      NO_SHOW: {
        bg: 'bg-orange-500',
        text: 'text-white',
        label: '노쇼',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      },
    };

    return configs[status] || configs.CONFIRMED;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      PAID: { label: '결제완료', color: 'text-green-600' },
      PENDING: { label: '결제대기', color: 'text-amber-600' },
      REFUNDED: { label: '환불완료', color: 'text-gray-600' },
      PARTIAL_REFUND: { label: '부분환불', color: 'text-orange-600' },
    };
    return labels[status] || { label: status, color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-500 font-medium">예약 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">예약 내역</h2>
        <span className="text-sm text-gray-500">{bookings.length}건</span>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            예약 내역이 없습니다
          </h3>
          <p className="text-gray-500 text-sm">
            새로운 예약을 하시면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const paymentConfig = getPaymentStatusLabel(booking.paymentStatus);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
              >
                {/* 상단 상태 바 */}
                <div className={`${statusConfig.bg} px-5 py-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${statusConfig.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusConfig.icon} />
                      </svg>
                      <span className={`font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                    </div>
                    <span className={`text-sm ${statusConfig.text} opacity-80`}>
                      #{booking.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {/* 차량 & 기사 정보 */}
                  {booking.outboundTrip?.vehicle && (
                    <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                      {/* 차량 아이콘 */}
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                          <VehicleIcon type="van" size={56} className="text-slate-600" />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">
                          {booking.outboundTrip.vehicle.licensePlate}
                        </div>
                      </div>

                      {/* 정보 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900">{booking.outboundTrip.vehicle.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                            {booking.outboundTrip.vehicle.capacity}인승
                          </span>
                        </div>

                        {booking.outboundTrip.driver && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {booking.outboundTrip.driver.name[0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{booking.outboundTrip.driver.name} 기사님</p>
                              <p className="text-xs text-gray-500">{booking.outboundTrip.driver.phone}</p>
                            </div>
                            <a
                              href={`tel:${booking.outboundTrip.driver.phone}`}
                              className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 경로 정보 - 타임라인 스타일 */}
                  {booking.outboundTrip?.stops && booking.outboundTrip.stops.length > 0 && (
                    <div className="py-5 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="font-semibold text-gray-700">운행 경로</span>
                      </div>

                      <div className="space-y-0">
                        {booking.outboundTrip.stops.map((stop: any, index: number) => {
                          const isPickup = stop.stopType === 'PICKUP';
                          const isLast = index === booking.outboundTrip.stops.length - 1;

                          return (
                            <div key={stop.id} className="flex gap-3">
                              {/* 타임라인 */}
                              <div className="flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                  isPickup ? 'bg-blue-500' : 'bg-emerald-500'
                                }`}>
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                {!isLast && (
                                  <div className="w-0.5 h-16 bg-gray-200"></div>
                                )}
                              </div>

                              {/* 내용 */}
                              <div className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                                    isPickup
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {isPickup ? '픽업' : '하차'}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {format(new Date(stop.scheduledTime), 'a h:mm', { locale: ko })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-1">{stop.address}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {format(new Date(stop.scheduledTime), 'M월 d일 (EEE)', { locale: ko })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 요금 정보 */}
                  <div className="pt-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">총 요금</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-gray-900">
                            {booking.totalPrice.toLocaleString()}
                          </p>
                          <span className="text-gray-500">원</span>
                        </div>
                        <p className={`text-sm font-medium mt-1 ${paymentConfig.color}`}>
                          {paymentConfig.label}
                        </p>
                      </div>

                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition text-sm"
                        >
                          예약 취소
                        </button>
                      )}

                      {booking.status === 'IN_TRIP' && (
                        <a
                          href={`/customer/trip/${booking.outboundTripId}`}
                          className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition text-sm"
                        >
                          실시간 추적
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
