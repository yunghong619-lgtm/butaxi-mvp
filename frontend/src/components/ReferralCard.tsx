import { useState, useEffect } from 'react';
import { referralApi } from '../services/api';
import { useToast } from './Toast';

interface ReferralData {
  referralCode: string;
  points: number;
  referredCount: number;
  rewards: {
    referrer: number;
    referred: number;
  };
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [loadingLong, setLoadingLong] = useState(false);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

  const customerId = localStorage.getItem('butaxi_customer_id') || '';

  useEffect(() => {
    if (customerId) {
      loadReferralData();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  const loadReferralData = async () => {
    setError(false);

    // 3초 후에도 로딩 중이면 안내 메시지 표시
    const longLoadingTimer = setTimeout(() => {
      setLoadingLong(true);
    }, 3000);

    try {
      const response: any = await referralApi.getMyReferralCode(customerId);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('초대 코드 로드 실패:', error);
      setError(true);
    } finally {
      clearTimeout(longLoadingTimer);
      setLoading(false);
      setLoadingLong(false);
    }
  };

  const handleCopyCode = async () => {
    if (!data?.referralCode) return;

    try {
      await navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
      showToast('초대 코드가 복사되었습니다!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = data.referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showToast('초대 코드가 복사되었습니다!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareKakao = () => {
    if (!data?.referralCode) return;

    const shareUrl = `https://butaxi-frontend.onrender.com?ref=${data.referralCode}`;
    const message = `butaxi에서 함께 타면 더 저렴하게! 내 초대 코드: ${data.referralCode}`;

    // 네이티브 공유 API 또는 fallback
    if (navigator.share) {
      navigator.share({
        title: 'butaxi 친구 초대',
        text: message,
        url: shareUrl,
      });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) {
      showToast('초대 코드를 입력해주세요.', 'error');
      return;
    }

    setApplying(true);

    try {
      const response: any = await referralApi.applyReferralCode({
        customerId,
        referralCode: inputCode.trim().toUpperCase(),
      });

      if (response.success) {
        showToast(response.message, 'success');
        setShowApplyModal(false);
        setInputCode('');
        loadReferralData();
      } else {
        showToast(response.error || '초대 코드 적용에 실패했습니다.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || '초대 코드 적용 중 오류가 발생했습니다.', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white animate-pulse">
        <div className="h-6 w-32 bg-white/20 rounded mb-4" />
        <div className="h-10 w-48 bg-white/20 rounded mb-4" />
        <div className="h-4 w-40 bg-white/20 rounded mb-3" />
        {loadingLong && (
          <p className="text-sm text-white/80">서버가 시작 중입니다...</p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎁</span>
          <h3 className="text-xl font-bold">친구 초대</h3>
        </div>
        <p className="text-white/80 text-sm mb-3">로드 실패</p>
        <button
          onClick={loadReferralData}
          className="px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!customerId) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <h3 className="text-xl font-bold">친구 초대</h3>
          </div>
          {data?.referredCount && data.referredCount > 0 ? (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {data.referredCount}명 초대 완료
            </div>
          ) : null}
        </div>

        {/* 내 초대 코드 */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
          <p className="text-sm text-white/80 mb-2">내 초대 코드</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white text-purple-600 text-2xl font-mono font-bold py-3 px-4 rounded-lg text-center tracking-wider">
              {data?.referralCode || '---'}
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-3 rounded-lg transition-colors ${
                copied ? 'bg-green-500' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="복사하기"
            >
              {copied ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 보상 정보 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-sm text-white/80">친구가 받는 포인트</p>
            <p className="text-lg font-bold">{data?.rewards.referred.toLocaleString()}P</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-sm text-white/80">내가 받는 포인트</p>
            <p className="text-lg font-bold">{data?.rewards.referrer.toLocaleString()}P</p>
          </div>
        </div>

        {/* 공유 버튼 */}
        <button
          onClick={handleShareKakao}
          className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-purple-50 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          친구에게 공유하기
        </button>

        {/* 초대 코드 입력 버튼 */}
        <button
          onClick={() => setShowApplyModal(true)}
          className="w-full mt-3 py-2 text-sm text-white/80 hover:text-white transition"
        >
          초대 코드가 있으신가요?
        </button>
      </div>

      {/* 초대 코드 입력 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowApplyModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold mb-4">초대 코드 입력</h3>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="초대 코드를 입력하세요"
              maxLength={10}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-center text-lg font-mono tracking-wider uppercase mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleApplyCode}
                disabled={applying}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition disabled:opacity-50"
              >
                {applying ? '적용 중...' : '적용하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
