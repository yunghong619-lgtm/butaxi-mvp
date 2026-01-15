import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const completeTimer = setTimeout(() => onComplete(), 3000);
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
      {/* 역동적인 맥주잔 애니메이션 */}
      <div className="relative w-48 h-48 mb-6">
        {/* 배경 글로우 효과 */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent rounded-full blur-3xl animate-glow" />

        {/* 맥주잔 SVG */}
        <div className="relative w-full h-full flex items-center justify-center animate-float">
          <svg viewBox="0 0 100 120" className="w-32 h-32 drop-shadow-2xl">
            {/* 맥주잔 본체 */}
            <defs>
              <linearGradient id="beerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
              </linearGradient>
              <linearGradient id="foamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="100%" stopColor="#FEF3C7" />
              </linearGradient>
            </defs>

            {/* 맥주 액체 */}
            <path d="M25 35 L25 95 Q25 105 35 105 L65 105 Q75 105 75 95 L75 35 Z" fill="url(#beerGradient)">
              <animate attributeName="d"
                values="M25 35 L25 95 Q25 105 35 105 L65 105 Q75 105 75 95 L75 35 Z;
                        M25 33 L25 95 Q25 105 35 105 L65 105 Q75 105 75 95 L75 37 Z;
                        M25 35 L25 95 Q25 105 35 105 L65 105 Q75 105 75 95 L75 35 Z"
                dur="2s" repeatCount="indefinite" />
            </path>

            {/* 맥주 거품 */}
            <ellipse cx="50" cy="32" rx="28" ry="12" fill="url(#foamGradient)">
              <animate attributeName="ry" values="12;14;12" dur="1.5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="35" cy="28" rx="10" ry="6" fill="#FFFBEB" opacity="0.9" />
            <ellipse cx="55" cy="26" rx="12" ry="7" fill="#FFFBEB" opacity="0.8" />
            <ellipse cx="68" cy="30" rx="8" ry="5" fill="#FFFBEB" opacity="0.85" />

            {/* 유리잔 테두리 */}
            <path d="M22 25 L22 95 Q22 108 35 108 L65 108 Q78 108 78 95 L78 25"
              fill="none" stroke="url(#glassGradient)" strokeWidth="3" strokeLinecap="round" />

            {/* 손잡이 */}
            <path d="M78 40 Q95 40 95 60 Q95 80 78 80"
              fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" strokeLinecap="round" />

            {/* 반짝임 효과 */}
            <ellipse cx="32" cy="55" rx="3" ry="8" fill="rgba(255,255,255,0.4)">
              <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
            </ellipse>

            {/* 올라오는 거품들 */}
            <circle cx="40" cy="80" r="2" fill="rgba(255,255,255,0.6)">
              <animate attributeName="cy" values="85;40;40" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.6;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="55" cy="90" r="1.5" fill="rgba(255,255,255,0.5)">
              <animate attributeName="cy" values="90;45;45" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.5;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="62" cy="75" r="2.5" fill="rgba(255,255,255,0.7)">
              <animate attributeName="cy" values="85;35;35" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.7;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* 회전하는 택시 */}
        <div className="absolute inset-0 animate-orbit">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
            <svg viewBox="0 0 40 24" className="w-10 h-6 drop-shadow-lg">
              <rect x="5" y="8" width="30" height="12" rx="3" fill="#FBBF24" />
              <rect x="8" y="10" width="8" height="6" rx="1" fill="#1F2937" opacity="0.7" />
              <rect x="18" y="10" width="8" height="6" rx="1" fill="#1F2937" opacity="0.7" />
              <circle cx="12" cy="20" r="3" fill="#374151" />
              <circle cx="28" cy="20" r="3" fill="#374151" />
              <rect x="15" y="5" width="10" height="4" rx="1" fill="#FBBF24" />
            </svg>
          </div>
        </div>
      </div>

      {/* 로고 */}
      <div className="animate-fade-in-up animation-delay-200">
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight">
          butaxi
        </h1>
      </div>

      {/* 메인 슬로건 */}
      <div className="mt-5 animate-fade-in-up animation-delay-400 text-center px-4">
        <p className="text-xl md:text-2xl text-amber-400 font-black tracking-wide">
          설렘 태우고 출발,
        </p>
        <p className="text-xl md:text-2xl text-rose-400 font-black tracking-wide mt-1">
          행복과 취기를 모시고 귀가
        </p>
      </div>

      {/* 서브 슬로건 */}
      <div className="mt-3 animate-fade-in-up animation-delay-500">
        <p className="text-sm md:text-base text-gray-500">
          함께 타면 더 저렴하게
        </p>
      </div>

      {/* 로딩 인디케이터 */}
      <div className="absolute bottom-20 animate-fade-in animation-delay-600">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* 하단 태그라인 */}
      <div className="absolute bottom-8 animate-fade-in animation-delay-700">
        <p className="text-xs text-gray-600">함께 타면 더 저렴하게</p>
      </div>

      {/* 커스텀 애니메이션 스타일 */}
      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-orbit {
          animation: orbit 4s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  );
}
