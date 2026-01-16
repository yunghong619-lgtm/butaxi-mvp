import { useState, useEffect } from 'react';
import { rideApi } from '../../services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ProgressStepper from '../../components/ProgressStepper';
import { ListSkeleton } from '../../components/Skeleton';

export default function RideRequestList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // customerId를 localStorage에서 가져오기
  const customerId = localStorage.getItem('butaxi_customer_id') || '';

  useEffect(() => {
    loadRequests();
  }, [customerId]);

  const loadRequests = async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response: any = await rideApi.getCustomerRequests(customerId);
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (error) {
      console.error('예약 요청 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      REQUESTED: { text: '요청됨', color: 'bg-blue-100 text-blue-800' },
      PROPOSED: { text: '제안됨', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { text: '확정됨', color: 'bg-green-100 text-green-800' },
      CANCELLED: { text: '취소됨', color: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status] || { text: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-black mb-8">내 예약 요청</h1>
          <ListSkeleton count={2} type="request" />
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-black mb-8">내 예약 요청</h1>

          <div className="text-center py-20">
            <div className="text-6xl mb-6">📋</div>
            <p className="text-xl text-gray-600 mb-2">아직 예약 요청이 없습니다</p>
            <p className="text-sm text-gray-500">새로운 예약을 신청해보세요!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">내 예약 요청</h1>
          <p className="text-gray-600">총 {requests.length}개의 예약 요청</p>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-black transition-all duration-300 hover:shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusBadge(request.status)}
                  <span className="text-xs text-gray-500">
                    {format(new Date(request.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  #{request.id.slice(0, 8)}
                </div>
              </div>

              {/* Progress Stepper - 진행 중인 요청에만 표시 */}
              {request.status !== 'CANCELLED' && request.status !== 'CONFIRMED' && (
                <div className="mb-6">
                  <ProgressStepper currentStatus={request.status} />
                </div>
              )}

              {/* 왕복 정보 */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 가는 편 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-900">가는 편</h3>
                  </div>
                  <div className="pl-4 space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">출발:</span>
                      <p className="font-medium">{request.pickupAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">도착:</span>
                      <p className="font-medium">{request.dropoffAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">시간:</span>
                      <p className="font-medium">
                        {format(new Date(request.desiredPickupTime), 'MM월 dd일 HH:mm', { locale: ko })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 귀가 편 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-900">귀가 편</h3>
                  </div>
                  <div className="pl-4 space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">출발:</span>
                      <p className="font-medium">{request.returnAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">도착:</span>
                      <p className="font-medium">{request.homeAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">시간:</span>
                      <p className="font-medium">
                        {format(new Date(request.desiredReturnTime), 'MM월 dd일 HH:mm', { locale: ko })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    👤 {request.passengerCount}명
                  </span>
                  {request.specialRequests && (
                    <span className="text-gray-500">
                      💬 특이사항 있음
                    </span>
                  )}
                </div>

                {request.status === 'REQUESTED' && (
                  <div className="text-xs text-gray-500">
                    ⏳ 매칭 진행 중...
                  </div>
                )}

                {request.status === 'PROPOSED' && (
                  <div className="text-xs text-green-600 font-semibold">
                    ✅ 제안 도착! "받은 제안"을 확인하세요
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
            <div className="text-sm">
              <p className="font-bold mb-1">예약 프로세스 안내</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>요청됨:</strong> 매칭 시스템이 최적의 운행을 찾고 있습니다</li>
                <li>• <strong>제안됨:</strong> "받은 제안"에서 확인하고 수락하세요</li>
                <li>• <strong>확정됨:</strong> "예약 내역"에서 상세 정보를 확인하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
