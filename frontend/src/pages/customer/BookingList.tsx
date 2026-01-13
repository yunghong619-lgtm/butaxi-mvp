import { useState, useEffect } from 'react';
import { bookingApi } from '../../services/api';
import { format } from 'date-fns';

export default function BookingList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 테스트용 고객 ID
  const customerId = 'customer1-id'; // TODO: 실제 로그인 시스템 연동

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
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', text: '확정' },
      IN_TRIP: { color: 'bg-green-100 text-green-800', text: '운행 중' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', text: '완료' },
      CANCELLED: { color: 'bg-red-100 text-red-800', text: '취소됨' },
      NO_SHOW: { color: 'bg-orange-100 text-orange-800', text: '노쇼' },
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
      <h2 className="text-2xl font-bold">예약 내역</h2>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            예약 내역이 없습니다
          </h3>
          <p className="text-gray-600">
            새로운 예약을 하시면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">예약 번호</p>
                  <p className="font-mono text-sm">{booking.id}</p>
                </div>
                <div>{getStatusBadge(booking.status)}</div>
              </div>

              {booking.outboundTrip && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold">차량:</span>
                    <span>{booking.outboundTrip.vehicle.name}</span>
                    <span className="text-gray-500">
                      ({booking.outboundTrip.vehicle.licensePlate})
                    </span>
                  </div>

                  {booking.outboundTrip.stops && booking.outboundTrip.stops.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {booking.outboundTrip.stops.map((stop: any, index: number) => (
                        <div key={stop.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">
                              {stop.stopType === 'PICKUP' ? '픽업' : '하차'}
                            </p>
                            <p className="text-sm text-gray-600">{stop.address}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(stop.scheduledTime), 'yyyy-MM-dd HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">총 요금</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {booking.totalPrice.toLocaleString()}원
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      결제 상태: {booking.paymentStatus}
                    </p>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                    >
                      예약 취소
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
