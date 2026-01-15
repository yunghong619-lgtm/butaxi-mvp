import { useState, useEffect } from 'react';
import { bookingApi } from '../../services/api';
import { format } from 'date-fns';
import ProgressStepper from '../../components/ProgressStepper';
import VehicleCard from '../../components/VehicleCard';

export default function BookingList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getCustomerId = () => {
    return localStorage.getItem('butaxi_customer_id') || 'customer1-id';
  };

  const customerId = getCustomerId();

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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      CONFIRMED: { color: 'bg-black text-white', text: '확정' },
      IN_TRIP: { color: 'bg-black text-white', text: '운행 중' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', text: '완료' },
      CANCELLED: { color: 'bg-red-100 text-red-800', text: '취소됨' },
      NO_SHOW: { color: 'bg-orange-100 text-orange-800', text: '노쇼' },
    };

    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">예약 내역</h2>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            예약 내역이 없습니다
          </h3>
          <p className="text-gray-500">
            새로운 예약을 하시면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">예약 번호</p>
                    <p className="font-mono text-sm font-bold">{booking.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {/* Progress Stepper - 진행 중인 예약에만 표시 */}
                {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                  <div className="mb-6">
                    <ProgressStepper currentStatus={booking.status} />
                  </div>
                )}

                {booking.outboundTrip && (
                  <div className="space-y-4 mb-4">
                    {/* 차량 정보 */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <VehicleCard vehicle={booking.outboundTrip.vehicle} size="small" showDetails={true} />
                    </div>

                    {/* 기사 정보 */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src="https://randomuser.me/api/portraits/men/32.jpg"
                            alt="기사"
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=박기사&background=000&color=fff&size=48';
                            }}
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="font-bold">{booking.outboundTrip.driver?.name || '박기사'}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">4.9</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`tel:${booking.outboundTrip.driver?.phone || '010-1234-5678'}`}
                        className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </a>
                    </div>

                    {/* 경로 정보 */}
                    {booking.outboundTrip.stops && booking.outboundTrip.stops.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="space-y-3">
                          {booking.outboundTrip.stops.map((stop: any, index: number) => (
                            <div key={stop.id} className="flex items-start gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                stop.actualTime ? 'bg-green-500 text-white' : 'bg-black text-white'
                              }`}>
                                {stop.actualTime ? '✓' : index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="px-2 py-0.5 bg-black text-white text-xs font-bold rounded">
                                    {stop.stopType === 'PICKUP' ? '픽업' : '하차'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(stop.scheduledTime), 'HH:mm')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{stop.address}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 요금 정보 */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">총 요금</p>
                      <p className="text-2xl font-bold">
                        {booking.totalPrice.toLocaleString()}원
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        결제: {booking.paymentStatus === 'PAID' ? '완료' : '대기'}
                      </p>
                    </div>

                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                      >
                        예약 취소
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
