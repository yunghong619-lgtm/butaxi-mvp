interface VehicleIconProps {
  type?: 'sedan' | 'suv' | 'van' | 'bus';
  size?: number;
  className?: string;
}

export default function VehicleIcon({ type = 'sedan', size = 48, className = '' }: VehicleIconProps) {
  const sedanPath = (
    <g>
      {/* 차체 */}
      <path
        d="M8 28h84v12c0 2-2 4-4 4H12c-2 0-4-2-4-4V28z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* 윈도우 */}
      <path
        d="M18 18l8-10h48l8 10v10H18V18z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* 지붕 라인 */}
      <path
        d="M26 8h48l10 12H16L26 8z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* 앞 바퀴 */}
      <circle cx="24" cy="40" r="8" fill="#1f2937" />
      <circle cx="24" cy="40" r="4" fill="#6b7280" />
      {/* 뒷 바퀴 */}
      <circle cx="76" cy="40" r="8" fill="#1f2937" />
      <circle cx="76" cy="40" r="4" fill="#6b7280" />
      {/* 헤드라이트 */}
      <rect x="6" y="26" width="6" height="4" rx="1" fill="#fbbf24" />
      {/* 테일라이트 */}
      <rect x="88" y="26" width="6" height="4" rx="1" fill="#ef4444" />
    </g>
  );

  const vanPath = (
    <g>
      {/* 차체 */}
      <path
        d="M6 16h88v28c0 2-2 4-4 4H10c-2 0-4-2-4-4V16z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* 윈도우 상단 */}
      <path
        d="M14 10h60c4 0 8 2 10 6H14V10z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* 프론트 윈도우 */}
      <rect x="10" y="18" width="20" height="14" rx="2" fill="white" opacity="0.3" />
      {/* 사이드 윈도우들 */}
      <rect x="34" y="18" width="14" height="14" rx="2" fill="white" opacity="0.3" />
      <rect x="52" y="18" width="14" height="14" rx="2" fill="white" opacity="0.3" />
      <rect x="70" y="18" width="14" height="14" rx="2" fill="white" opacity="0.3" />
      {/* 앞 바퀴 */}
      <circle cx="22" cy="44" r="8" fill="#1f2937" />
      <circle cx="22" cy="44" r="4" fill="#6b7280" />
      {/* 뒷 바퀴 */}
      <circle cx="78" cy="44" r="8" fill="#1f2937" />
      <circle cx="78" cy="44" r="4" fill="#6b7280" />
      {/* 헤드라이트 */}
      <rect x="4" y="22" width="4" height="6" rx="1" fill="#fbbf24" />
    </g>
  );

  const suvPath = (
    <g>
      {/* 차체 하단 */}
      <path
        d="M6 26h88v18c0 2-2 4-4 4H10c-2 0-4-2-4-4V26z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* 차체 상단 */}
      <path
        d="M16 12h68l6 14H10l6-14z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* 윈도우 */}
      <path
        d="M22 14h56l4 10H18l4-10z"
        fill="white"
        opacity="0.25"
      />
      {/* 앞 바퀴 */}
      <circle cx="24" cy="44" r="10" fill="#1f2937" />
      <circle cx="24" cy="44" r="5" fill="#6b7280" />
      {/* 뒷 바퀴 */}
      <circle cx="76" cy="44" r="10" fill="#1f2937" />
      <circle cx="76" cy="44" r="5" fill="#6b7280" />
      {/* 루프랙 */}
      <rect x="20" y="8" width="60" height="3" rx="1" fill="currentColor" opacity="0.5" />
      {/* 헤드라이트 */}
      <rect x="4" y="26" width="6" height="4" rx="1" fill="#fbbf24" />
    </g>
  );

  const getPath = () => {
    switch (type) {
      case 'van':
        return vanPath;
      case 'suv':
        return suvPath;
      default:
        return sedanPath;
    }
  };

  return (
    <svg
      viewBox="0 0 100 56"
      width={size}
      height={size * 0.56}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {getPath()}
    </svg>
  );
}
