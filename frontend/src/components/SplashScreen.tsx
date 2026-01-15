import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 2.5초 후 페이드아웃 시작
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // 3초 후 완료
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 동적 원형 애니메이션 */}
      <div className="relative w-40 h-40 mb-8 animate-fade-in-up">
        {/* 회전하는 원형 트랙 */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-700 animate-spin-slow" />

        {/* 펄스 효과 원 */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 animate-pulse-ring" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-500/10 to-orange-500/10 animate-pulse-ring animation-delay-300" />

        {/* 회전하는 택시 아이콘 */}
        <div className="absolute inset-0 animate-orbit">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl drop-shadow-lg">
            🚖
          </div>
        </div>

        {/* 중앙 아이콘 (집 + 맥주) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl animate-bounce-gentle">
            🍺
          </div>
        </div>

        {/* 시작점 (술집) */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-2xl">
          🏠
        </div>
      </div>

      {/* 로고 */}
      <div className="animate-fade-in-up animation-delay-200">
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight">
          butaxi
        </h1>
      </div>

      {/* 슬로건 - 재밌는 술자리 컨셉 */}
      <div className="mt-4 animate-fade-in-up animation-delay-400">
        <p className="text-xl md:text-2xl text-yellow-400 font-bold tracking-wide">
          오늘 밤, 걱정 말고 한 잔
        </p>
      </div>

      {/* 서브 슬로건 */}
      <div className="mt-2 animate-fade-in-up animation-delay-500">
        <p className="text-sm md:text-base text-gray-400">
          대리운전 없이 집까지 편하게
        </p>
      </div>

      {/* 로딩 인디케이터 */}
      <div className="absolute bottom-20 animate-fade-in animation-delay-600">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* 하단 태그라인 */}
      <div className="absolute bottom-8 animate-fade-in animation-delay-700">
        <p className="text-xs text-gray-600">공유 택시로 함께 가면, 더 저렴하게</p>
      </div>

      {/* 커스텀 애니메이션 스타일 */}
      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-orbit {
          animation: orbit 3s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        .animation-delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}
