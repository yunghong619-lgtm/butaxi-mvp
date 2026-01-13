import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Stop {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  stopType: string;
  sequence: number;
  scheduledTime: string;
  actualTime: string | null;
  customerId?: string;
}

interface RouteProgressProps {
  stops: Stop[];
  currentCustomerId?: string; // 고객용: 현재 고객 ID
  showCustomerInfo?: boolean;
}

export default function RouteProgress({
  stops,
  currentCustomerId,
  showCustomerInfo = false,
}: RouteProgressProps) {
  // 현재 진행 중인 정거장 찾기
  const currentStopIndex = stops.findIndex(stop => !stop.actualTime);
  const completedCount = stops.filter(stop => stop.actualTime).length;
  const progressPercentage = (completedCount / stops.length) * 100;

  // 고객의 정거장 찾기
  const myStopIndex = currentCustomerId
    ? stops.findIndex(stop => stop.customerId === currentCustomerId)
    : -1;

  const getStopStatus = (index: number) => {
    if (stops[index].actualTime) return 'completed';
    if (index === currentStopIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white animate-pulse';
      default:
        return 'bg-gray-200 text-gray-500';
    }
  };

  const getStatusIcon = (status: string, stopType: string) => {
    if (status === 'completed') return '✅';
    if (status === 'current') {
      return stopType === 'PICKUP' ? '🚌' : '🏁';
    }
    return stopType === 'PICKUP' ? '⭕' : '🔵';
  };

  return (
    <div className="space-y-4">
      {/* 전체 진행률 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">운행 진행률</h3>
          <span className="text-sm font-medium text-blue-600">
            {completedCount} / {stops.length} 완료
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 내 차례 표시 (고객용) */}
      {showCustomerInfo && myStopIndex >= 0 && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📍</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">내 픽업 정보</h4>
              <p className="text-sm text-blue-700">
                {myStopIndex - currentStopIndex <= 0 ? (
                  <span className="font-medium">곧 도착합니다!</span>
                ) : (
                  <>
                    내 차례까지{' '}
                    <span className="font-bold text-lg">
                      {myStopIndex - currentStopIndex}
                    </span>
                    개 정거장 남음
                  </>
                )}
              </p>
              {stops[myStopIndex].actualTime && (
                <p className="text-sm text-green-600 mt-1 font-medium">
                  ✅ 픽업 완료
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 정거장 목록 */}
      <div className="bg-white rounded-lg shadow divide-y">
        {stops.map((stop, index) => {
          const status = getStopStatus(index);
          const isMyStop = showCustomerInfo && myStopIndex === index;

          return (
            <div
              key={stop.id}
              className={`p-4 transition-all ${
                isMyStop ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
              } ${status === 'current' ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* 순서 번호 */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getStatusColor(
                    status
                  )}`}
                >
                  {getStatusIcon(status, stop.stopType)} {stop.sequence}
                </div>

                {/* 정거장 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {stop.stopType === 'PICKUP' ? '픽업' : '하차'}
                    </span>
                    {isMyStop && (
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                        내 정거장
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {stop.address}
                  </p>

                  {/* 시간 정보 */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-500">예정:</span>{' '}
                      {format(new Date(stop.scheduledTime), 'HH:mm', { locale: ko })}
                    </div>
                    {stop.actualTime && (
                      <div className="text-green-600 font-medium">
                        <span>실제:</span>{' '}
                        {format(new Date(stop.actualTime), 'HH:mm', { locale: ko })}
                      </div>
                    )}
                  </div>

                  {/* 현재 진행 중 표시 */}
                  {status === 'current' && !stop.actualTime && (
                    <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                      진행 중
                    </div>
                  )}
                </div>

                {/* 상태 아이콘 */}
                <div className="flex-shrink-0">
                  {status === 'completed' && (
                    <div className="text-green-500 text-2xl">✓</div>
                  )}
                  {status === 'current' && (
                    <div className="text-blue-500 text-2xl animate-bounce">⬤</div>
                  )}
                </div>
              </div>

              {/* 연결선 (마지막 정거장 제외) */}
              {index < stops.length - 1 && (
                <div className="ml-5 mt-2 mb-2">
                  <div
                    className={`w-0.5 h-8 ${
                      status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
