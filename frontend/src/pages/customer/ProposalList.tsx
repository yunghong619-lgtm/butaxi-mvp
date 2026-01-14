import { useState, useEffect } from 'react';
import { proposalApi } from '../../services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import VehicleIcon from '../../components/VehicleIcon';

export default function ProposalList() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAccept = async (proposalId: string) => {
    if (!confirm('이 제안을 수락하시겠습니까?')) return;

    try {
      const response: any = await proposalApi.acceptProposal(proposalId);
      if (response.success) {
        alert('예약이 확정되었습니다!');
        loadProposals();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || '수락 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (proposalId: string) => {
    if (!confirm('이 제안을 거부하시겠습니까?')) return;

    try {
      const response: any = await proposalApi.rejectProposal(proposalId);
      if (response.success) {
        alert('제안이 거부되었습니다. 다른 제안을 찾아보겠습니다.');
        loadProposals();
      }
    } catch (error) {
      alert('거부 처리 중 오류가 발생했습니다.');
    }
  };

  // 남은 시간 계산
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return '만료됨';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
    return `${minutes}분 남음`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-500 font-medium">제안을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">받은 제안</h2>
        <span className="text-sm text-gray-500">{proposals.length}건</span>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            아직 제안이 없습니다
          </h3>
          <p className="text-gray-500 text-sm">
            예약 요청을 하시면 매칭되는 즉시<br/>제안을 보내드립니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* 상단 헤더 */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">합승 제안</p>
                      <p className="text-gray-400 text-xs">#{proposal.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {proposal.estimatedPrice.toLocaleString()}<span className="text-sm font-normal">원</span>
                    </p>
                    <p className="text-green-400 text-xs font-medium">최대 40% 절약</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* 차량 & 기사 정보 - 우버 스타일 */}
                {proposal.outboundTrip?.vehicle && (
                  <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                    {/* 차량 아이콘 (원형) */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                        <VehicleIcon type="van" size={56} className="text-gray-700" />
                      </div>
                      {/* 차량 번호 배지 */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {proposal.outboundTrip.vehicle.licensePlate}
                      </div>
                    </div>

                    {/* 차량/기사 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{proposal.outboundTrip.vehicle.name}</h4>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {proposal.outboundTrip.vehicle.capacity}인승
                        </span>
                      </div>

                      {proposal.outboundTrip.driver && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {proposal.outboundTrip.driver.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{proposal.outboundTrip.driver.name} 기사님</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>4.9</span>
                            </div>
                          </div>
                          <a
                            href={`tel:${proposal.outboundTrip.driver.phone}`}
                            className="ml-auto w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition"
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

                {/* 운행 일정 */}
                <div className="py-5 space-y-4">
                  {/* 가는 편 */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-0.5 h-12 bg-gray-200"></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">가는 편</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(proposal.pickupTime), 'M월 d일 (EEE)', { locale: ko })}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">픽업</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(proposal.pickupTime), 'a h:mm', { locale: ko })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">도착 예정</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(proposal.dropoffTime), 'a h:mm', { locale: ko })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 귀가 편 */}
                  <div className="flex items-start gap-3 pt-2">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="w-0.5 h-12 bg-gray-200"></div>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-100"></div>
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded">귀가 편</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(proposal.returnPickupTime), 'M월 d일 (EEE)', { locale: ko })}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">픽업</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(proposal.returnPickupTime), 'a h:mm', { locale: ko })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">도착 예정</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(proposal.returnDropoffTime), 'a h:mm', { locale: ko })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 만료 알림 */}
                <div className="flex items-center gap-2 py-3 px-4 bg-amber-50 rounded-xl mb-4">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-700 font-medium">
                    {getTimeRemaining(proposal.expiresAt)}
                  </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(proposal.id)}
                    className="flex-1 px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                  >
                    거부
                  </button>
                  <button
                    onClick={() => handleAccept(proposal.id)}
                    className="flex-[2] px-6 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20"
                  >
                    수락하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
