import { useState } from 'react';
import { reviewApi } from '../services/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  bookingId: string;
  driverName?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onComplete,
  bookingId,
  driverName = '기사님',
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError('별점을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response: any = await reviewApi.createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (response.success) {
        onComplete();
      } else {
        setError(response.error || '리뷰 등록에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '리뷰 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoverRating || rating;

  // 별점 텍스트
  const getRatingText = (r: number) => {
    const texts = ['', '별로예요', '그저 그래요', '괜찮아요', '좋았어요', '최고예요!'];
    return texts[r] || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="p-6">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">운행은 어떠셨나요?</h2>
            <p className="text-gray-600">
              <span className="font-semibold">{driverName}</span>님과의 운행을 평가해주세요
            </p>
          </div>

          {/* 별점 선택 */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    star <= displayRating ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-lg font-semibold text-gray-700">
              {getRatingText(displayRating)}
            </p>
          </div>

          {/* 한줄평 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              한줄평 (선택)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="기사님께 한마디 남겨주세요..."
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none resize-none transition-all"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {comment.length}/200
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              나중에
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  등록 중...
                </>
              ) : (
                '리뷰 등록'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
