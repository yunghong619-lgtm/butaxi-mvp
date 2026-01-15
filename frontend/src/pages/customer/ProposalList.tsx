import { useState, useEffect } from 'react';
import { proposalApi } from '../../services/api';
import { format } from 'date-fns';
import PaymentModal from '../../components/PaymentModal';
import { useToast } from '../../components/Toast';
import VehicleCard from '../../components/VehicleCard';

export default function ProposalList() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    proposalId: string;
    amount: number;
  }>({ isOpen: false, proposalId: '', amount: 0 });
  const { showToast } = useToast();

  const customerId = localStorage.getItem('butaxi_customer_id') || '';

  useEffect(() => {
    if (customerId) {
      loadProposals();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  const loadProposals = async () => {
    try {
      const response: any = await proposalApi.getCustomerProposals(customerId);
      if (response.success) {
        setProposals(response.data);
      }
    } catch (error) {
      console.error('Proposal 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (proposalId: string, amount: number) => {
    setPaymentModal({ isOpen: true, proposalId, amount });
  };

  const handlePaymentComplete = async () => {
    try {
      const response: any = await proposalApi.acceptProposal(paymentModal.proposalId);
      if (response.success) {
        showToast('예약이 확정되었습니다!', 'success');
        loadProposals();
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || '처리 중 오류가 발생했습니다.', 'error');
    }
    setPaymentModal({ isOpen: false, proposalId: '', amount: 0 });
  };

  const handleReject = async (proposalId: string) => {
    if (!confirm('이 제안을 거부하시겠습니까?')) return;

    try {
      const response: any = await proposalApi.rejectProposal(proposalId);
      if (response.success) {
        showToast('제안이 거부되었습니다.', 'info');
        loadProposals();
      }
    } catch (error) {
      showToast('거부 처리 중 오류가 발생했습니다.', 'error');
    }
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
      <h2 className="text-2xl font-bold">받은 제안</h2>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            아직 제안이 없습니다
          </h3>
          <p className="text-gray-500">
            예약 요청을 하시면 매칭되는 즉시 제안을 보내드립니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const isAccepted = proposal.status === 'ACCEPTED';
            const vehicle = proposal.outboundTrip?.vehicle;
            const driver = proposal.outboundTrip?.driver;

            // 기본 기사 정보
            const displayDriver = {
              name: driver?.name || '박기사',
              phone: driver?.phone || '010-1234-5678',
              rating: 4.9,
              trips: 1234
            };

            return (
              <div
                key={proposal.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
                  isAccepted ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="p-5">
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                          isAccepted
                            ? 'bg-green-500 text-white'
                            : 'bg-black text-white'
                        }`}
                      >
                        {isAccepted ? '예약 확정' : '새 제안'}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        #{proposal.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {proposal.estimatedPrice.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  {/* 차량 정보 - 우버 스타일 */}
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <VehicleCard vehicle={vehicle} size="medium" showDetails={true} />
                  </div>

                  {/* 기사 정보 - 우버 스타일 */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      {/* 실제 사람 프로필 이미지 */}
                      <div className="relative">
                        <img
                          src="https://randomuser.me/api/portraits/men/32.jpg"
                          alt={displayDriver.name}
                          className="w-14 h-14 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${displayDriver.name}&background=000&color=fff&size=56`;
                          }}
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-bold text-lg">{displayDriver.name}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{displayDriver.rating}</span>
                          <span className="mx-1">·</span>
                          <span>{displayDriver.trips.toLocaleString()}회</span>
                        </div>
                      </div>
                    </div>

                    {/* 연락 버튼 */}
                    <a
                      href={`tel:${displayDriver.phone}`}
                      className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>

                  {/* 운행 정보 - 심플하게 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">가는 편 픽업</p>
                      <p className="text-xl font-bold">
                        {format(new Date(proposal.pickupTime), 'HH:mm')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(proposal.pickupTime), 'MM월 dd일')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">귀가 편 픽업</p>
                      <p className="text-xl font-bold">
                        {format(new Date(proposal.returnPickupTime), 'HH:mm')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(proposal.returnPickupTime), 'MM월 dd일')}
                      </p>
                    </div>
                  </div>

                  {/* 만료 시간 */}
                  {!isAccepted && (
                    <div className="bg-gray-100 rounded-xl p-3 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        <strong>{format(new Date(proposal.expiresAt), 'HH:mm')}</strong>
                        까지 수락해주세요
                      </p>
                    </div>
                  )}

                  {/* 버튼 */}
                  {isAccepted ? (
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        예약이 확정되었습니다
                      </div>
                      <p className="text-green-600 text-sm mt-1">
                        출발 30분 전에 알림을 보내드립니다
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(proposal.id)}
                        className="flex-1 py-3.5 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition"
                      >
                        거부
                      </button>
                      <button
                        onClick={() => handleAccept(proposal.id, proposal.estimatedPrice)}
                        className="flex-1 py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition"
                      >
                        결제 및 수락
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, proposalId: '', amount: 0 })}
        onComplete={handlePaymentComplete}
        amount={paymentModal.amount}
        bookingId={paymentModal.proposalId}
      />
    </div>
  );
}
