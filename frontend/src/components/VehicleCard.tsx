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
          // Staria SVG - 우버 스타일 정교한 디자인
          <svg viewBox="0 0 240 120" className="w-full h-full" fill="none">
            {/* 차체 메인 (박스형 바디) */}
            <path
              d="M 30 65 L 40 40 L 70 35 L 100 35 L 130 35 L 160 35 L 200 45 L 210 55 L 210 85 L 30 85 Z"
              fill="#2D3748"
              opacity="0.95"
            />
            
            {/* 루프 (지붕) */}
            <path
              d="M 40 40 L 70 35 L 160 35 L 200 45 L 198 38 L 165 32 L 75 32 L 42 37 Z"
              fill="#1A202C"
              opacity="0.9"
            />
            
            {/* 프론트 범퍼 */}
            <path
              d="M 200 45 L 210 55 L 215 60 L 215 75 L 210 80 L 210 85 L 200 85 L 200 75 Z"
              fill="#4A5568"
              opacity="0.85"
            />
            
            {/* 창문 1 (운전석) */}
            <path
              d="M 45 42 L 65 37 L 88 37 L 88 60 L 75 63 L 50 63 Z"
              fill="#90CDF4"
              opacity="0.4"
            />
            
            {/* 창문 2 (2열) */}
            <rect
              x="95"
              y="37"
              width="35"
              height="26"
              rx="2"
              fill="#90CDF4"
              opacity="0.35"
            />
            
            {/* 창문 3 (3열) */}
            <rect
              x="135"
              y="37"
              width="30"
              height="26"
              rx="2"
              fill="#90CDF4"
              opacity="0.3"
            />
            
            {/* 슬라이딩 도어 라인 */}
            <line x1="92" y1="45" x2="92" y2="80" stroke="#1A202C" strokeWidth="1.5" opacity="0.6"/>
            <line x1="132" y1="45" x2="132" y2="80" stroke="#1A202C" strokeWidth="1.5" opacity="0.6"/>
            
            {/* 사이드 미러 */}
            <ellipse cx="42" cy="52" rx="4" ry="3" fill="#4A5568" opacity="0.8"/>
            
            {/* 헤드라이트 */}
            <ellipse cx="206" cy="58" rx="5" ry="6" fill="#FBD38D" opacity="0.7"/>
            
            {/* 테일라이트 */}
            <rect x="32" y="70" width="6" height="10" rx="1" fill="#FC8181" opacity="0.6"/>
            
            {/* 앞바퀴 */}
            <g>
              <circle cx="65" cy="85" r="12" fill="#2D3748" opacity="0.9"/>
              <circle cx="65" cy="85" r="8" fill="#4A5568" opacity="0.7"/>
              <circle cx="65" cy="85" r="4" fill="#718096" opacity="0.5"/>
            </g>
            
            {/* 뒷바퀴 */}
            <g>
              <circle cx="185" cy="85" r="12" fill="#2D3748" opacity="0.9"/>
              <circle cx="185" cy="85" r="8" fill="#4A5568" opacity="0.7"/>
              <circle cx="185" cy="85" r="4" fill="#718096" opacity="0.5"/>
            </g>
            
            {/* 하이라이트 (입체감) */}
            <path
              d="M 70 38 L 160 38 L 158 40 L 72 40 Z"
              fill="white"
              opacity="0.15"
            />
            
            {/* 현대 로고 위치 (간단한 H) */}
            <text x="205" y="52" fontSize="8" fill="white" opacity="0.3" fontWeight="bold">H</text>
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
