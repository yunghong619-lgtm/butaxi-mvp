import { useState } from 'react';

// 실제 스타리아 이미지를 사용하는 차량 카드 컴포넌트
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

  const vehicleName = vehicle?.name || '스타리아 라운지';
  const licensePlate = vehicle?.licensePlate || '12가3456';
  const capacity = vehicle?.capacity || 7;

  // 크기별 클래스
  const sizeClasses = {
    small: 'w-20 h-16',
    medium: 'w-28 h-22',
    large: 'w-36 h-28'
  };

  return (
    <div className="flex items-center gap-4">
      {/* 스타리아 실제 이미지 (투명 배경) */}
      <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-2 shadow-md`}>
        {!imageError ? (
          <img
            src="/images/staria-transparent.png"
            alt="현대 스타리아"
            className="w-full h-full object-contain drop-shadow-md"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback: 깔끔한 미니밴 아이콘
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-2">
            <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
              <path
                d="M 20 35 L 25 22 L 40 20 L 80 20 L 95 22 L 100 35 L 100 42 L 20 42 Z"
                fill="white"
                opacity="0.9"
              />
              <rect x="30" y="23" width="15" height="10" rx="2" fill="#1e293b" opacity="0.3"/>
              <rect x="48" y="23" width="18" height="10" rx="2" fill="#1e293b" opacity="0.3"/>
              <rect x="70" y="23" width="15" height="10" rx="2" fill="#1e293b" opacity="0.3"/>
              <circle cx="35" cy="42" r="6" fill="white" opacity="0.9"/>
              <circle cx="85" cy="42" r="6" fill="white" opacity="0.9"/>
            </svg>
          </div>
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
