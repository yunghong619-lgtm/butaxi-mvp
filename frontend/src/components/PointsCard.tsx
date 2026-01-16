import { useState, useEffect } from 'react';
import { pointsApi } from '../services/api';

interface PointHistoryItem {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function PointsCard() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const customerId = localStorage.getItem('butaxi_customer_id') || '';

  useEffect(() => {
    if (customerId) {
      loadPointsData();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  const loadPointsData = async () => {
    try {
      const response: any = await pointsApi.getBalance(customerId);
      if (response.success) {
        setBalance(response.data.balance);
        setHistory(response.data.history || []);
      }
    } catch (error) {
      console.error('포인트 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REFERRAL_BONUS': return '친구 초대 보상';
      case 'REFERRED_BONUS': return '초대 가입 보상';
      case 'RIDE_REWARD': return '운행 적립';
      case 'USED': return '포인트 사용';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white animate-pulse">
        <div className="h-6 w-32 bg-white/20 rounded mb-4" />
        <div className="h-10 w-48 bg-white/20 rounded" />
      </div>
    );
  }

  if (!customerId) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <h3 className="text-lg font-bold">내 포인트</h3>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="text-sm text-white/80 hover:text-white transition"
          >
            내역 보기 →
          </button>
        </div>

        {/* 잔액 */}
        <div className="text-4xl font-bold mb-4">
          {balance.toLocaleString()}<span className="text-lg font-normal ml-1">P</span>
        </div>

        {/* 안내 */}
        <div className="bg-white/10 rounded-xl p-3 text-sm">
          <p className="text-white/90">
            결제 시 포인트를 사용하면 최대 50%까지 할인 가능!
          </p>
        </div>
      </div>

      {/* 포인트 내역 모달 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowHistory(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">포인트 내역</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📭</span>
                  <p>포인트 내역이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold">{getTypeLabel(item.type)}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${item.amount > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
