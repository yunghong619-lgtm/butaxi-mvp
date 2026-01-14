import { useState, useEffect } from 'react';
import { proposalApi } from '../../services/api';
import { format } from 'date-fns';

export default function ProposalList() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // localStorage에서 customerId 가져오기
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
      <h2 className="text-2xl font-bold">받은 제안</h2>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            아직 제안이 없습니다
          </h3>
          <p className="text-gray-600">
            예약 요청을 하시면 매칭되는 즉시 제안을 보내드립니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    활성 제안
                  </span>
                  <div className="text-xs text-gray-400 font-mono">
                    제안 #{proposal.id.slice(0, 8)} / 요청 #{proposal.requestId?.slice(0, 8) || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">
                    {proposal.estimatedPrice.toLocaleString()}원
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 가는 편 */}
                <div className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-semibold mb-2">🚖 가는 편</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>픽업:</strong>{' '}
                      {format(new Date(proposal.pickupTime), 'yyyy-MM-dd HH:mm')}
                    </p>
                    <p>
                      <strong>도착:</strong>{' '}
                      {format(new Date(proposal.dropoffTime), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                </div>

                {/* 귀가 편 */}
                <div className="border-l-4 border-success-500 pl-4">
                  <h4 className="font-semibold mb-2">🏠 귀가 편</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>픽업:</strong>{' '}
                      {format(new Date(proposal.returnPickupTime), 'yyyy-MM-dd HH:mm')}
                    </p>
                    <p>
                      <strong>도착:</strong>{' '}
                      {format(new Date(proposal.returnDropoffTime), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 만료 시간 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⏰ 이 제안은{' '}
                  <strong>{format(new Date(proposal.expiresAt), 'HH:mm')}</strong>에
                  만료됩니다. 서둘러 수락해주세요!
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleReject(proposal.id)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  거부
                </button>
                <button
                  onClick={() => handleAccept(proposal.id)}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  수락하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
