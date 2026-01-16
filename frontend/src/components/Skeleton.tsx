interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

// 기본 스켈레톤 블록
export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

// 제안 카드 스켈레톤
export function ProposalCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-6 w-16 bg-gray-200 rounded-full mb-2" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>

        {/* 차량 정보 */}
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        {/* 기사 정보 */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gray-200 rounded-full" />
            <div>
              <div className="h-5 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
        </div>

        {/* 운행 정보 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-14 bg-gray-100 rounded" />
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-14 bg-gray-100 rounded" />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gray-100 rounded-xl" />
          <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// 예약 카드 스켈레톤
export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="h-3 w-14 bg-gray-100 rounded mb-2" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-12 bg-gray-200 rounded-full" />
        </div>

        {/* Progress Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="h-2 w-12 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* 차량 정보 */}
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        {/* 기사 정보 */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-12 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        </div>

        {/* 경로 정보 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 요금 */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-3 w-12 bg-gray-100 rounded mb-2" />
              <div className="h-7 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 예약 요청 카드 스켈레톤
export function RideRequestCardSkeleton() {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-14 bg-gray-200 rounded-full" />
          <div className="h-3 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>

      {/* Progress Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-2 w-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 왕복 정보 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 가는 편 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="pl-4 space-y-3">
            <div>
              <div className="h-3 w-10 bg-gray-100 rounded mb-1" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-3 w-10 bg-gray-100 rounded mb-1" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-3 w-10 bg-gray-100 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* 귀가 편 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="pl-4 space-y-3">
            <div>
              <div className="h-3 w-10 bg-gray-100 rounded mb-1" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-3 w-10 bg-gray-100 rounded mb-1" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-3 w-10 bg-gray-100 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 w-12 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// 리스트 페이지 스켈레톤 래퍼
export function ListSkeleton({ count = 3, type = 'proposal' }: { count?: number; type?: 'proposal' | 'booking' | 'request' }) {
  const getSkeletonComponent = () => {
    switch (type) {
      case 'proposal':
        return ProposalCardSkeleton;
      case 'booking':
        return BookingCardSkeleton;
      case 'request':
        return RideRequestCardSkeleton;
      default:
        return ProposalCardSkeleton;
    }
  };

  const SkeletonComponent = getSkeletonComponent();

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
