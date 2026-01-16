interface Driver {
  id: string;
  name: string;
  phone?: string;
  profileImage?: string;
  rating?: number;
  totalTrips?: number;
  bio?: string;
}

interface DriverProfileProps {
  driver: Driver | null | undefined;
  size?: 'small' | 'medium' | 'large';
  showContact?: boolean;
  showBio?: boolean;
  onClick?: () => void;
}

export default function DriverProfile({
  driver,
  size = 'medium',
  showContact = true,
  showBio = false,
  onClick,
}: DriverProfileProps) {
  // 기본값 설정
  const displayDriver = {
    name: driver?.name || '기사님',
    phone: driver?.phone || '010-****-****',
    profileImage: driver?.profileImage,
    rating: driver?.rating ?? 4.9,
    totalTrips: driver?.totalTrips ?? 0,
    bio: driver?.bio || '',
  };

  // 사이즈별 스타일
  const sizeStyles = {
    small: {
      container: 'p-3',
      image: 'w-10 h-10',
      name: 'text-sm font-semibold',
      stats: 'text-xs',
      button: 'w-8 h-8',
    },
    medium: {
      container: 'p-4',
      image: 'w-14 h-14',
      name: 'text-base font-bold',
      stats: 'text-sm',
      button: 'w-12 h-12',
    },
    large: {
      container: 'p-5',
      image: 'w-20 h-20',
      name: 'text-lg font-bold',
      stats: 'text-base',
      button: 'w-14 h-14',
    },
  };

  const styles = sizeStyles[size];

  // 프로필 이미지 fallback
  const getProfileImage = () => {
    if (displayDriver.profileImage) {
      return displayDriver.profileImage;
    }
    // 랜덤 프로필 이미지 (실제 서비스에서는 실제 이미지 사용)
    const seed = displayDriver.name.charCodeAt(0) % 70 + 1;
    return `https://randomuser.me/api/portraits/men/${seed}.jpg`;
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">★</span>
      );
    }
    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }

    return stars;
  };

  return (
    <div
      className={`flex items-center justify-between border border-gray-200 rounded-xl ${styles.container} ${onClick ? 'cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* 프로필 이미지 */}
        <div className="relative">
          <img
            src={getProfileImage()}
            alt={displayDriver.name}
            className={`${styles.image} rounded-full object-cover border-2 border-white shadow-md`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayDriver.name)}&background=000&color=fff&size=80`;
            }}
          />
          {/* 온라인 상태 표시 */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </div>

        {/* 기사 정보 */}
        <div>
          <p className={styles.name}>{displayDriver.name}</p>
          <div className={`flex items-center gap-2 ${styles.stats} text-gray-500`}>
            {/* 별점 */}
            <div className="flex items-center gap-1">
              {size === 'small' ? (
                <>
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{displayDriver.rating.toFixed(1)}</span>
                </>
              ) : (
                <>
                  <div className="flex">{renderStars(displayDriver.rating)}</div>
                  <span className="font-medium">{displayDriver.rating.toFixed(1)}</span>
                </>
              )}
            </div>
            <span className="text-gray-300">|</span>
            {/* 운행 횟수 */}
            <span>{displayDriver.totalTrips.toLocaleString()}회 운행</span>
          </div>
        </div>
      </div>

      {/* 연락 버튼 */}
      {showContact && displayDriver.phone && (
        <a
          href={`tel:${displayDriver.phone}`}
          className={`${styles.button} bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md`}
          title="전화하기"
          onClick={(e) => e.stopPropagation()}
        >
          <svg
            className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </a>
      )}

      {/* 자기소개 (large 사이즈 & showBio 활성화 시) */}
      {showBio && size === 'large' && displayDriver.bio && (
        <div className="mt-3 pt-3 border-t border-gray-100 w-full">
          <p className="text-sm text-gray-600 italic">"{displayDriver.bio}"</p>
        </div>
      )}
    </div>
  );
}
