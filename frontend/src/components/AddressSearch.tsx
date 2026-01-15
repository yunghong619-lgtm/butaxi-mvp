import { useState, useEffect } from 'react';
import LocationMapModal from './LocationMapModal';

interface AddressSearchProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
}

// 네이버 Geocode API로 주소에서 좌표 얻기
const geocodeAddress = (address: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
      console.error('Naver Maps Service not loaded');
      resolve(null);
      return;
    }

    window.naver.maps.Service.geocode(
      { query: address },
      (status: any, response: any) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          console.error('Geocode 실패:', status);
          resolve(null);
          return;
        }

        if (response.v2.addresses && response.v2.addresses.length > 0) {
          const addr = response.v2.addresses[0];
          resolve({
            lat: parseFloat(addr.y),
            lng: parseFloat(addr.x),
          });
        } else {
          resolve(null);
        }
      }
    );
  });
};

// Fallback: 더미 좌표 생성 (Geocode 실패 시)
const generateFallbackCoordinates = (address: string): { lat: number; lng: number } => {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash = hash & hash;
  }
  const centerLat = 37.5665;
  const centerLng = 126.978;
  const seed1 = Math.abs(hash % 10000) / 10000;
  const seed2 = Math.abs((hash >> 16) % 10000) / 10000;
  return {
    lat: centerLat + (seed1 - 0.5) * 0.1,
    lng: centerLng + (seed2 - 0.5) * 0.1,
  };
};

// Daum Postcode 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;
          roadAddress: string;
          jibunAddress: string;
          zonecode: string;
          addressType: string;
          bname: string;
          buildingName: string;
        }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
        embed: (element: HTMLElement) => void;
      };
    };
    naver: any;
  }
}

export default function AddressSearch({
  value,
  onChange,
  placeholder = '주소 찾기 버튼을 눌러주세요',
  label,
}: AddressSearchProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.5665,
    lng: 126.9780,
  });

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSearchAddress = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: async function(data) {
        // 도로명 주소가 있으면 도로명, 없으면 지번 주소
        const fullAddress = data.roadAddress || data.jibunAddress;
        const extraAddress = data.buildingName ? ` (${data.buildingName})` : '';
        const finalAddress = fullAddress + extraAddress;

        setInternalValue(finalAddress);

        // 네이버 Geocode API로 실제 좌표 획득
        const coords = await geocodeAddress(fullAddress);
        if (coords) {
          onChange(finalAddress, coords.lat, coords.lng);
        } else {
          // Fallback: 더미 좌표 사용
          const fallback = generateFallbackCoordinates(fullAddress);
          onChange(finalAddress, fallback.lat, fallback.lng);
        }
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('', 0, 0);
  };

  const handleManualChange = (newValue: string) => {
    setInternalValue(newValue);
    // 수동 입력 시에는 onChange를 즉시 호출하지 않음
  };

  const handleManualSubmit = async () => {
    if (internalValue.trim()) {
      // 네이버 Geocode API로 실제 좌표 획득
      const coords = await geocodeAddress(internalValue);
      if (coords) {
        onChange(internalValue, coords.lat, coords.lng);
      } else {
        // Fallback: 더미 좌표 사용
        const fallback = generateFallbackCoordinates(internalValue);
        onChange(internalValue, fallback.lat, fallback.lng);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  // 현위치 버튼 핸들러 (개선된 에러 핸들링)
  const handleCurrentLocation = () => {
    setIsLoadingLocation(true);

    // 브라우저 지원 여부 확인
    if (!navigator.geolocation) {
      alert('브라우저에서 위치 정보를 지원하지 않습니다.\n\n대신 "주소 찾기" 버튼을 이용해주세요.');
      setIsLoadingLocation(false);
      return;
    }

    // 위치 권한 요청
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('현재 위치:', lat, lng);

        // 현재 위치 저장
        setCurrentLocation({ lat, lng });

        // LocationMapModal 열기 (현재 위치로)
        setIsMapModalOpen(true);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);

        // 위치 정보 실패 시 기본 위치(서울)로 지도 열기
        console.log('기본 위치(서울)로 지도를 엽니다.');
        setCurrentLocation({ lat: 37.5665, lng: 126.9780 });
        setIsMapModalOpen(true);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // 20초로 증가
        maximumAge: 60000, // 1분 이내 캐시 허용
      }
    );
  };

  // LocationMapModal에서 위치 선택 완료
  const handleMapSelectLocation = (address: string, lat: number, lng: number) => {
    setInternalValue(address);
    onChange(address, lat, lng);
    setIsMapModalOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          {label}
        </label>
      )}

      {/* 주소 입력 필드 */}
      <div className="w-full relative group mb-3">
        <input
          type="text"
          value={internalValue}
          onChange={(e) => handleManualChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 md:px-5 py-3 md:py-4 pr-10 md:pr-12 text-sm md:text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
        />

        {/* Clear 버튼 */}
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            title="지우기"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-4 h-4 md:w-5 md:h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 버튼들 */}
      <div className="flex gap-2">
        {/* 주소 찾기 버튼 */}
        <button
          type="button"
          onClick={handleSearchAddress}
          className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-black text-white rounded-2xl text-sm md:text-base font-semibold hover:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          주소 찾기
        </button>

        {/* 현위치 버튼 */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLoadingLocation}
          className="flex-1 px-3 md:px-6 py-3 md:py-4 bg-white border-2 border-black text-black rounded-2xl text-sm md:text-base font-semibold hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          title="현재 위치로 지도에서 선택"
        >
          {isLoadingLocation ? (
            <>
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span className="hidden md:inline">로딩중...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>현위치</span>
            </>
          )}
        </button>
      </div>

      {/* 도움말 */}
      <p className="text-xs text-gray-500 px-1">
        주소 찾기 버튼을 클릭하거나, 현위치 버튼으로 지도에서 선택하거나, 직접 입력 후 Enter를 눌러주세요
      </p>

      {/* LocationMapModal */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={handleMapSelectLocation}
        initialLat={currentLocation.lat}
        initialLng={currentLocation.lng}
      />
    </div>
  );
}
