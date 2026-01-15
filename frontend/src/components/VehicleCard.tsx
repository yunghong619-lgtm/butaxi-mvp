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
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md flex items-center justify-center p-3 border border-gray-200/50`}>
        {!imageError ? (
          <img
            src="https://www.hyundai.com/content/dam/hyundai/kr/ko/data/vehicle/staria/23my/gallery/exterior/staria-23my-gallery-exterior-color-01-s.jpg"
            alt="Hyundai Staria"
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          // 실제 스타리아처럼 보이는 정교한 SVG
          <svg viewBox="0 0 280 140" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 메인 바디 (곡선형 박스) */}
            <path
              d="M 35 75 Q 38 50, 48 42 L 75 38 Q 90 36, 115 36 L 170 36 Q 190 37, 205 42 L 225 50 Q 235 60, 237 75 L 237 95 Q 235 100, 230 102 L 40 102 Q 35 100, 35 95 Z"
              fill="url(#bodyGradient)"
              stroke="#1a1a1a"
              strokeWidth="0.5"
            />
            
            {/* 그라디언트 정의 */}
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a3a3a" stopOpacity="1"/>
                <stop offset="50%" stopColor="#2d2d2d" stopOpacity="1"/>
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1"/>
              </linearGradient>
              <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a8d5f7" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#6fb1e0" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            
            {/* 루프 라인 (곡선) */}
            <path
              d="M 48 42 Q 90 34, 170 36 Q 190 37, 205 42"
              stroke="#0a0a0a"
              strokeWidth="2"
              fill="none"
            />
            
            {/* 전면부 (우주선 스타일) */}
            <path
              d="M 225 50 L 237 65 L 242 70 L 245 80 L 245 92 L 242 98 L 237 95 L 230 102"
              fill="url(#bodyGradient)"
              stroke="#1a1a1a"
              strokeWidth="0.5"
            />
            
            {/* DRL 라이트 (수평형) */}
            <rect x="230" y="58" width="12" height="2" rx="1" fill="#ffe6b3" opacity="0.9"/>
            <rect x="230" y="62" width="12" height="2" rx="1" fill="#ffe6b3" opacity="0.9"/>
            
            {/* 창문들 (곡선 처리) */}
            {/* 1열 창문 */}
            <path
              d="M 52 45 Q 55 40, 75 40 L 95 40 Q 97 40, 98 45 L 98 68 Q 97 72, 90 74 L 58 74 Q 52 72, 52 68 Z"
              fill="url(#windowGradient)"
              stroke="#2a2a2a"
              strokeWidth="1"
            />
            
            {/* 2열 창문 (큰 슬라이딩 도어) */}
            <rect
              x="105"
              y="40"
              width="50"
              height="34"
              rx="3"
              fill="url(#windowGradient)"
              stroke="#2a2a2a"
              strokeWidth="1"
            />
            
            {/* 3열 창문 */}
            <rect
              x="162"
              y="40"
              width="38"
              height="34"
              rx="3"
              fill="url(#windowGradient)"
              stroke="#2a2a2a"
              strokeWidth="1"
            />
            
            {/* 슬라이딩 도어 라인 */}
            <line x1="103" y1="50" x2="103" y2="95" stroke="#0a0a0a" strokeWidth="2.5" opacity="0.8"/>
            <line x1="157" y1="50" x2="157" y2="95" stroke="#0a0a0a" strokeWidth="2.5" opacity="0.8"/>
            
            {/* 도어 핸들 */}
            <ellipse cx="100" cy="70" rx="2.5" ry="5" fill="#1a1a1a" opacity="0.7"/>
            <ellipse cx="160" cy="70" rx="2.5" ry="5" fill="#1a1a1a" opacity="0.7"/>
            
            {/* 사이드 미러 (더 현실적) */}
            <path
              d="M 45 55 L 38 53 Q 35 53, 35 56 L 35 60 Q 35 63, 38 63 L 45 61 Z"
              fill="#2a2a2a"
              stroke="#1a1a1a"
              strokeWidth="0.5"
            />
            
            {/* 후면 램프 */}
            <rect x="37" y="82" width="4" height="12" rx="1" fill="#ff6b6b" opacity="0.8"/>
            <rect x="37" y="82" width="4" height="4" rx="1" fill="#ffcccc" opacity="0.6"/>
            
            {/* 바퀴 (더 입체적) */}
            <g>
              {/* 앞바퀴 */}
              <circle cx="75" cy="102" r="15" fill="#1a1a1a"/>
              <circle cx="75" cy="102" r="11" fill="#3a3a3a"/>
              <circle cx="75" cy="102" r="6" fill="#5a5a5a"/>
              <circle cx="75" cy="102" r="3" fill="#7a7a7a"/>
              {/* 휠 스포크 */}
              <line x1="75" y1="91" x2="75" y2="113" stroke="#4a4a4a" strokeWidth="1"/>
              <line x1="64" y1="102" x2="86" y2="102" stroke="#4a4a4a" strokeWidth="1"/>
            </g>
            
            <g>
              {/* 뒷바퀴 */}
              <circle cx="205" cy="102" r="15" fill="#1a1a1a"/>
              <circle cx="205" cy="102" r="11" fill="#3a3a3a"/>
              <circle cx="205" cy="102" r="6" fill="#5a5a5a"/>
              <circle cx="205" cy="102" r="3" fill="#7a7a7a"/>
              {/* 휠 스포크 */}
              <line x1="205" y1="91" x2="205" y2="113" stroke="#4a4a4a" strokeWidth="1"/>
              <line x1="194" y1="102" x2="216" y2="102" stroke="#4a4a4a" strokeWidth="1"/>
            </g>
            
            {/* 하이라이트 (빛 반사) */}
            <path
              d="M 75 40 Q 90 38, 170 38"
              stroke="white"
              strokeWidth="2"
              opacity="0.3"
              strokeLinecap="round"
            />
            
            {/* 현대 로고 (H) */}
            <g transform="translate(232, 52)">
              <rect x="-6" y="-6" width="12" height="12" rx="2" fill="white" opacity="0.15"/>
              <text x="0" y="2" fontSize="9" fill="white" opacity="0.5" fontWeight="bold" textAnchor="middle">H</text>
            </g>
            
            {/* 언더바디 쉐도우 */}
            <ellipse cx="140" cy="105" rx="90" ry="8" fill="black" opacity="0.1"/>
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
