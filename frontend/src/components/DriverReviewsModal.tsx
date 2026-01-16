import { useState, useEffect } from 'react';
import { reviewApi } from '../services/api';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface DriverReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  driverName: string;
  driverRating?: number;
  driverTrips?: number;
}

export default function DriverReviewsModal({
  isOpen,
  onClose,
  driverId,
  driverName,
  driverRating = 4.9,
  driverTrips = 0,
}: DriverReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (driverId) {
        loadReviews();
      } else {
        // driverId가 없으면 로딩 종료
        setLoading(false);
      }
    }
  }, [isOpen, driverId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response: any = await reviewApi.getDriverReviews(driverId);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{driverName} 기사님</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{driverRating.toFixed(1)}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span>{driverTrips.toLocaleString()}회 운행</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 리뷰 목록 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : !driverId ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">😅</span>
              <p>기사 정보가 아직 배정되지 않았습니다</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">📝</span>
              <p>아직 리뷰가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">작성된 코멘트가 없습니다</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
