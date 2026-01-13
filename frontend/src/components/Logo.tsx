interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  // Icon: 승합차 + 경로 컨셉
  const IconLogo = ({ height = '48' }: { height?: string }) => (
    <svg
      width={height}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 정거장들 (상단) */}
      <circle cx="12" cy="12" r="3" fill="#10B981" opacity="0.8" />
      <circle cx="24" cy="10" r="3" fill="#10B981" opacity="0.8" />
      <circle cx="36" cy="12" r="3" fill="#10B981" opacity="0.8" />
      
      {/* 연결선 */}
      <path
        d="M 12 12 Q 18 11 24 10 Q 30 11 36 12"
        stroke="#10B981"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      
      {/* 승합차 (중앙) */}
      <rect x="14" y="24" width="20" height="14" rx="2" fill="#000000" />
      {/* 창문들 */}
      <rect x="16" y="26" width="4" height="4" rx="1" fill="#FFFFFF" opacity="0.3" />
      <rect x="22" y="26" width="4" height="4" rx="1" fill="#FFFFFF" opacity="0.3" />
      <rect x="28" y="26" width="4" height="4" rx="1" fill="#FFFFFF" opacity="0.3" />
      {/* 바퀴 */}
      <circle cx="18" cy="38" r="2.5" fill="#000000" stroke="#10B981" strokeWidth="1.5" />
      <circle cx="30" cy="38" r="2.5" fill="#000000" stroke="#10B981" strokeWidth="1.5" />
    </svg>
  );

  if (variant === 'icon') {
    return <IconLogo height={sizeClasses[size].replace('h-', '')} />;
  }

  if (variant === 'text') {
    return (
      <div className={`font-bold text-black ${className}`}>
        <span className="tracking-tight">BUTAXI</span>
      </div>
    );
  }

  // Full logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <IconLogo height={size === 'sm' ? '32' : size === 'md' ? '40' : size === 'lg' ? '48' : '64'} />
      <div className="flex flex-col">
        <span className="font-bold text-black text-xl tracking-tight leading-none">
          BUTAXI
        </span>
        <span className="text-xs text-gray-500 leading-none mt-0.5">
          Share your ride
        </span>
      </div>
    </div>
  );
}
