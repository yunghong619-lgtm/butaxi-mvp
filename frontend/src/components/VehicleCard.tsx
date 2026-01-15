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
      {/* 차량 아이콘 - 간단하고 확실한 방법 */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md flex items-center justify-center p-2 border border-blue-100`}>
        <div className="text-center">
          <div className="text-4xl mb-1">🚐</div>
          <div className="text-[8px] font-bold text-gray-600 whitespace-nowrap">STARIA</div>
        </div>
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
