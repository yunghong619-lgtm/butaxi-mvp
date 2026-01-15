// 간단하고 확실한 차량 카드 컴포넌트
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
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  return (
    <div className="flex items-center gap-4">
      {/* 세련된 차량 아이콘 - 우버/테슬라 스타일 */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg flex items-center justify-center p-3 relative overflow-hidden group`}>
        {/* 배경 그라디언트 효과 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
        
        {/* 미니밴 SVG 아이콘 - 모던하고 깔끔 */}
        <svg viewBox="0 0 120 60" className="w-full h-full relative z-10" fill="none">
          {/* 차체 실루엣 */}
          <path
            d="M 20 35 L 25 22 L 40 20 L 80 20 L 95 22 L 100 35 L 100 42 L 20 42 Z"
            fill="white"
            opacity="0.9"
          />
          {/* 창문 */}
          <rect x="30" y="23" width="15" height="10" rx="2" fill="#1e293b" opacity="0.3"/>
          <rect x="48" y="23" width="18" height="10" rx="2" fill="#1e293b" opacity="0.3"/>
          <rect x="70" y="23" width="15" height="10" rx="2" fill="#1e293b" opacity="0.3"/>
          {/* 바퀴 */}
          <circle cx="35" cy="42" r="6" fill="white" opacity="0.9"/>
          <circle cx="35" cy="42" r="3" fill="#1e293b" opacity="0.5"/>
          <circle cx="85" cy="42" r="6" fill="white" opacity="0.9"/>
          <circle cx="85" cy="42" r="3" fill="#1e293b" opacity="0.5"/>
          {/* 하이라이트 */}
          <path d="M 40 21 L 80 21" stroke="white" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
        </svg>
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
