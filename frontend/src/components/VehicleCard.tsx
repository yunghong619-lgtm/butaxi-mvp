// 우버 스타일 차량 카드 컴포넌트
interface VehicleCardProps {
  vehicle?: {
    name?: string;
    licensePlate?: string;
    capacity?: number;
  };
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export default function VehicleCard({ 
  vehicle, 
  size = 'medium',
  showDetails = true 
}: VehicleCardProps) {
  const vehicleName = vehicle?.name || '스타리아 1호';
  const licensePlate = vehicle?.licensePlate || '12가3456';
  const capacity = vehicle?.capacity || 7;

  // 크기별 클래스
  const sizeClasses = {
    small: 'w-20 h-12',
    medium: 'w-32 h-20',
    large: 'w-40 h-24'
  };

  return (
    <div className="flex items-center gap-4">
      {/* 차량 이미지 - 우버 스타일 */}
      <div className={`${sizeClasses[size]} bg-white rounded-lg shadow-sm flex items-center justify-center p-2 border border-gray-100`}>
        <img
          src="https://i.imgur.com/9KqZxHF.png"
          alt="Hyundai Staria"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback 이미지들
            const fallbacks = [
              'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=240&fit=crop',
              'https://cdn.autotribune.co.kr/news/photo/202104/4812_27881_1051.jpg'
            ];
            
            const currentSrc = (e.target as HTMLImageElement).src;
            const currentIndex = fallbacks.indexOf(currentSrc);
            
            if (currentIndex < fallbacks.length - 1) {
              (e.target as HTMLImageElement).src = fallbacks[currentIndex + 1];
            } else {
              // 모든 이미지 실패시 SVG 표시
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = `
                  <svg viewBox="0 0 200 100" class="w-full h-full text-gray-800">
                    <rect x="20" y="30" width="160" height="50" rx="8" fill="currentColor" opacity="0.1"/>
                    <rect x="30" y="35" width="50" height="40" rx="4" fill="currentColor" opacity="0.2"/>
                    <circle cx="60" cy="75" r="12" fill="currentColor" opacity="0.3"/>
                    <circle cx="160" cy="75" r="12" fill="currentColor" opacity="0.3"/>
                    <path d="M 40 30 L 50 20 L 100 20 L 110 30 Z" fill="currentColor" opacity="0.15"/>
                    <text x="100" y="55" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">STARIA</text>
                  </svg>
                `;
              }
            }
          }}
        />
      </div>

      {/* 차량 상세 정보 */}
      {showDetails && (
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-900">
            {vehicleName}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-black text-white text-xs font-mono rounded">
              {licensePlate}
            </span>
            <span className="text-xs text-gray-500">
              최대 {capacity}명
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
