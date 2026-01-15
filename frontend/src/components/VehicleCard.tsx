import { useState } from 'react';

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

// 여러 이미지 URL 시도
const STARIA_IMAGES = [
  // 투명 배경 PNG (가능하면)
  'https://png.pngtree.com/png-vector/20230930/ourmid/pngtree-hyundai-staria-luxury-van-transparent-png-image_10153826.png',
  // 현대 공식 이미지들
  'https://www.hyundai.com/content/dam/hyundai/ww/en/images/find-a-car/staria/highlights/hyundai-staria-exterior-side-white-pc.jpg',
  'https://www.hyundai.com/content/dam/hyundai/kr/ko/images/vehicles/staria/23my/highlights/exterior/pc/hyundai-staria-exterior-01-pc.jpg',
];

export default function VehicleCard({ 
  vehicle, 
  size = 'medium',
  showDetails = true 
}: VehicleCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [allImagesFailed, setAllImagesFailed] = useState(false);
  const vehicleName = vehicle?.name || '스타리아 1호';
  const licensePlate = vehicle?.licensePlate || '12가3456';
  const capacity = vehicle?.capacity || 7;

  // 크기별 클래스
  const sizeClasses = {
    small: 'w-20 h-12',
    medium: 'w-32 h-20',
    large: 'w-40 h-24'
  };

  const handleImageError = () => {
    if (imageIndex < STARIA_IMAGES.length - 1) {
      // 다음 이미지 시도
      setImageIndex(imageIndex + 1);
    } else {
      // 모든 이미지 실패
      setAllImagesFailed(true);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* 차량 이미지 - 우버 스타일 */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md flex items-center justify-center p-3 border border-gray-200/50`}>
        {!allImagesFailed ? (
          <img
            key={imageIndex}
            src={STARIA_IMAGES[imageIndex]}
            alt="Hyundai Staria"
            className="w-full h-full object-contain drop-shadow-lg"
            onError={handleImageError}
          />
        ) : (
          // 깔끔한 미니밴 실루엣 (우버 스타일)
          <svg viewBox="0 0 100 50" className="w-full h-full text-gray-800" fill="currentColor">
            {/* 간단한 미니밴 실루엣 (우버 스타일) */}
            {/* 바디 */}
            <rect x="15" y="18" width="70" height="20" rx="3" opacity="0.2"/>
            {/* 루프 */}
            <path d="M 20 18 L 25 10 L 50 10 L 55 18 Z" opacity="0.3"/>
            {/* 창문 */}
            <rect x="27" y="12" width="8" height="5" rx="1" opacity="0.4"/>
            <rect x="38" y="12" width="10" height="5" rx="1" opacity="0.4"/>
            {/* 바퀴 */}
            <circle cx="30" cy="38" r="5" opacity="0.5"/>
            <circle cx="70" cy="38" r="5" opacity="0.5"/>
            {/* 헤드라이트 */}
            <circle cx="83" cy="25" r="2" opacity="0.3"/>
            {/* STARIA 텍스트 */}
            <text x="50" y="30" fontSize="6" textAnchor="middle" opacity="0.6" fontWeight="600">STARIA</text>
          </svg>
        )}
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
