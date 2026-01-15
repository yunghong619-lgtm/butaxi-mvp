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

export default function VehicleCard({ 
  vehicle, 
  size = 'medium',
  showDetails = true 
}: VehicleCardProps) {
  const [imageError, setImageError] = useState(false);
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
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm flex items-center justify-center p-2 border border-gray-200`}>
        {!imageError ? (
          <img
            src="https://www.hyundai.com/content/dam/hyundai/kr/ko/data/vehicle/staria/23my/gallery/exterior/staria-23my-gallery-exterior-color-01-s.jpg"
            alt="Hyundai Staria"
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback SVG - 깔끔한 차량 아이콘
          <svg viewBox="0 0 64 32" className="w-full h-full text-gray-700" fill="currentColor">
            {/* 차체 */}
            <path d="M8 18 L12 12 L20 12 L24 18 L56 18 L60 22 L60 26 L4 26 L4 22 Z" opacity="0.3"/>
            {/* 창문 */}
            <rect x="14" y="13" width="8" height="4" rx="1" opacity="0.5"/>
            {/* 바퀴 */}
            <circle cx="14" cy="26" r="3" opacity="0.6"/>
            <circle cx="50" cy="26" r="3" opacity="0.6"/>
            {/* 헤드라이트 */}
            <circle cx="58" cy="20" r="1.5" opacity="0.4"/>
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
