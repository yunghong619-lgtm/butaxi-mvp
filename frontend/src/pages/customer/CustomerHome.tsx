import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingApi } from '../../services/api';
import { format } from 'date-fns';
import ReferralCard from '../../components/ReferralCard';
import PointsCard from '../../components/PointsCard';

interface ActiveBooking {
  id: string;
  status: string;
  totalPrice: number;
  outboundTrip?: {
    driver?: {
      name: string;
    };
    vehicle?: {
      name: string;
      licensePlate: string;
    };
    stops?: Array<{
      stopType: string;
      scheduledTime: string;
      address: string;
    }>;
  };
}

export default function CustomerHome() {
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const customerId = localStorage.getItem('butaxi_customer_id') || '';

  useEffect(() => {
    if (customerId) {
      loadActiveBooking();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  const loadActiveBooking = async () => {
    try {
      const response: any = await bookingApi.getCustomerBookings(customerId);
      if (response.success) {
        // CONFIRMED 또는 IN_TRIP 상태인 예약 찾기
        const active = response.data.find(
          (b: any) => b.status === 'CONFIRMED' || b.status === 'IN_TRIP'
        );
        setActiveBooking(active || null);
      }
    } catch (error) {
      console.error('예약 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextPickup = () => {
    if (!activeBooking?.outboundTrip?.stops) return null;
    const pickupStop = activeBooking.outboundTrip.stops.find(
      (s) => s.stopType === 'PICKUP'
    );
    return pickupStop;
  };

  const nextPickup = getNextPickup();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-3">
            안녕하세요
          </h1>
          <p className="text-xl text-gray-600">
            어디로 이동하시나요?
          </p>
        </div>

        {/* 진행 중인 예약 */}
        {!loading && activeBooking && (
          <button
            onClick={() => navigate('/customer/bookings')}
            className="w-full mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/80">
                    {activeBooking.status === 'IN_TRIP' ? '운행 중' : '예약 확정'}
                  </p>
                  <p className="text-lg font-bold">
                    {nextPickup
                      ? `${format(new Date(nextPickup.scheduledTime), 'MM/dd HH:mm')} 픽업`
                      : '예약이 확정되었습니다'}
                  </p>
                  {activeBooking.outboundTrip?.driver && (
                    <p className="text-sm text-white/80 mt-1">
                      {activeBooking.outboundTrip.driver.name} 기사님 | {activeBooking.outboundTrip.vehicle?.licensePlate}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </button>
        )}

        {/* Main Action */}
        <Link
          to="/customer/booking"
          className="block bg-black text-white p-8 rounded-2xl hover:bg-gray-900 transition-all duration-300 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">지금 예약하기</h2>
              <p className="text-gray-400">왕복 예약을 한 번에</p>
            </div>
            <span className="text-4xl">→</span>
          </div>
        </Link>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/customer/requests"
            className="border-2 border-gray-200 p-6 rounded-xl hover:border-black transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">내 예약 요청</h3>
            <p className="text-gray-600 text-sm">신청한 예약 요청을 확인하세요</p>
          </Link>

          <Link
            to="/customer/proposals"
            className="border-2 border-gray-200 p-6 rounded-xl hover:border-black transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">받은 제안</h3>
            <p className="text-gray-600 text-sm">도착한 제안을 확인하세요</p>
          </Link>

          <Link
            to="/customer/bookings"
            className="border-2 border-gray-200 p-6 rounded-xl hover:border-black transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">예약 내역</h3>
            <p className="text-gray-600 text-sm">확정된 예약을 관리하세요</p>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-12">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-blue-900 mb-1 text-sm md:text-base">예약 후 제안을 기다려주세요</h4>
              <p className="text-blue-700 text-xs md:text-sm">
                예약 요청 후 매칭 시스템이 최적의 경로를 찾고 있습니다. 
                제안이 도착하면 15분 내로 수락해주세요!
              </p>
            </div>
          </div>
        </div>

        {/* 포인트 & 친구 초대 */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <PointsCard />
          <ReferralCard />
        </div>

        {/* How it works */}
        <div className="border-t pt-12">
          <h3 className="text-xl font-bold mb-6">이용 방법</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold mb-1">예약 요청</h4>
                <p className="text-gray-600 text-sm">출발지, 목적지, 시간을 입력하세요</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold mb-1">제안 받기</h4>
                <p className="text-gray-600 text-sm">매칭되면 15분 내로 수락하세요</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold mb-1">운행 이용</h4>
                <p className="text-gray-600 text-sm">픽업 장소에서 기사님을 만나세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
