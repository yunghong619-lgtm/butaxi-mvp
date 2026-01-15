import { useEffect, useState } from 'react';

interface ProgressStepperProps {
  currentStatus: string;
  direction?: 'OUTBOUND' | 'RETURN';
}

const STEPS = [
  { key: 'REQUESTED', label: '요청', icon: '📝' },
  { key: 'MATCHING', label: '배정중', icon: '🔍' },
  { key: 'ACCEPTED', label: '수락', icon: '✓' },
  { key: 'ARRIVED', label: '도착', icon: '📍' },
  { key: 'ON_TRIP', label: '운행중', icon: '🚗' },
  { key: 'COMPLETED', label: '완료', icon: '🎉' },
];

// 상태를 단계 인덱스로 매핑
const STATUS_TO_STEP: Record<string, number> = {
  REQUESTED: 0,
  MATCHING: 1,
  PROPOSED: 1,
  ACCEPTED: 2,
  CONFIRMED: 2,
  ARRIVED: 3,
  ON_TRIP: 4,
  IN_TRIP: 4,
  IN_PROGRESS: 4,
  COMPLETED: 5,
};

export default function ProgressStepper({ currentStatus, direction: _direction }: ProgressStepperProps) {
  const [animatedStep, setAnimatedStep] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const currentStep = STATUS_TO_STEP[currentStatus] ?? 0;

  useEffect(() => {
    // 단계 애니메이션
    const timer = setTimeout(() => {
      setAnimatedStep(currentStep);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // 현재 단계 펄스 애니메이션
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.15 : 1);
    }, 800);
    return () => clearInterval(pulseInterval);
  }, []);

  // ETA 정보 (가짜 값)
  const getETAInfo = () => {
    switch (currentStatus) {
      case 'REQUESTED':
      case 'MATCHING':
      case 'PROPOSED':
        return { text: '예상 배정까지', time: '1~3분', distance: null };
      case 'ACCEPTED':
      case 'CONFIRMED':
        return { text: '기사 도착까지', time: '약 6분', distance: '2.1km' };
      case 'ARRIVED':
        return { text: '탑승 대기중', time: null, distance: null };
      case 'ON_TRIP':
      case 'IN_TRIP':
      case 'IN_PROGRESS':
        return { text: '목적지까지', time: '약 12분', distance: '5.4km' };
      case 'COMPLETED':
        return { text: '운행 완료', time: null, distance: null };
      default:
        return { text: '상태 확인 중', time: null, distance: null };
    }
  };

  const etaInfo = getETAInfo();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* 상단 타임라인 */}
      <div className="relative mb-8">
        {/* 진행 바 배경 */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

        {/* 진행 바 (애니메이션) */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-black transition-all duration-700 ease-out"
          style={{ width: `${(animatedStep / (STEPS.length - 1)) * 100}%` }}
        />

        {/* 단계들 */}
        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < animatedStep;
            const isCurrent = index === animatedStep;
            const isPending = index > animatedStep;

            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* 원형 아이콘 */}
                <div className="relative">
                  {/* 펄스 링 (현재 단계) */}
                  {isCurrent && (
                    <>
                      <div
                        className="absolute inset-0 rounded-full bg-black/20 animate-ping"
                        style={{ animationDuration: '1.5s' }}
                      />
                      <div
                        className="absolute -inset-1 rounded-full bg-black/10"
                        style={{
                          transform: `scale(${pulseScale})`,
                          transition: 'transform 0.4s ease-in-out'
                        }}
                      />
                    </>
                  )}

                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                      isCompleted || isCurrent
                        ? 'bg-black text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}
                    style={{
                      transform: isCurrent ? `scale(${pulseScale})` : 'scale(1)',
                      transition: 'transform 0.4s ease-in-out, background-color 0.5s, color 0.5s'
                    }}
                  >
                    {isCompleted ? '✓' : isPending ? index + 1 : step.icon}
                  </div>
                </div>

                {/* 라벨 */}
                <span
                  className={`mt-2 text-xs font-medium transition-all duration-300 ${
                    isCompleted || isCurrent ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ETA/거리 카드 */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{etaInfo.text}</p>
            {etaInfo.time && (
              <p className="text-2xl font-bold text-black">{etaInfo.time}</p>
            )}
          </div>
          {etaInfo.distance && (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">거리</p>
              <p className="text-xl font-semibold text-gray-800">{etaInfo.distance}</p>
            </div>
          )}
        </div>
      </div>

      {/* 기사 위치 미니 라인 (운행 중일 때만) */}
      {(currentStatus === 'ON_TRIP' || currentStatus === 'IN_TRIP' || currentStatus === 'IN_PROGRESS') && (
        <MiniRouteAnimation />
      )}
    </div>
  );
}

// 미니 경로 애니메이션 컴포넌트
function MiniRouteAnimation() {
  const [position, setPosition] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev >= 80) return 20;
        return prev + 2;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-500 mb-3">실시간 위치</p>
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        {/* 경로 라인 */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-300 -translate-y-1/2" />

        {/* 출발점 */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full" />

        {/* 도착점 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />

        {/* 차량 아이콘 (애니메이션) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 text-xl transition-all duration-200"
          style={{ left: `${position}%` }}
        >
          🚗
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>출발</span>
        <span>도착</span>
      </div>
    </div>
  );
}
