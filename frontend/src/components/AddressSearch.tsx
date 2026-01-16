import { useState, useEffect } from 'react';
import LocationMapModal from './LocationMapModal';
import { useSavedPlaces, PLACE_ICONS } from '../hooks/useSavedPlaces';

interface AddressSearchProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
  showSavedPlaces?: boolean;
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
  showSavedPlaces = true,
}: AddressSearchProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.5665,
    lng: 126.9780,
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveIcon, setSaveIcon] = useState('⭐');
  const [pendingSaveAddress, setPendingSaveAddress] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const { places, addPlace, removePlace } = useSavedPlaces();

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

  // 저장된 장소 선택
  const handleSelectSavedPlace = (place: { address: string; lat: number; lng: number }) => {
    setInternalValue(place.address);
    onChange(place.address, place.lat, place.lng);
  };

  // 현재 주소 저장하기 시작
  const handleStartSavePlace = () => {
    if (!internalValue || !value) return;
    setPendingSaveAddress({
      address: internalValue,
      lat: 0, // 실제 좌표는 geocode로 다시 가져오거나 기존 값 사용
      lng: 0,
    });
    setShowSaveModal(true);
  };

  // 장소 저장 완료
  const handleSavePlace = async () => {
    if (!pendingSaveAddress || !saveName.trim()) return;

    // 좌표 가져오기
    const coords = await geocodeAddress(pendingSaveAddress.address);
    const finalCoords = coords || generateFallbackCoordinates(pendingSaveAddress.address);

    addPlace({
      name: saveName.trim(),
      address: pendingSaveAddress.address,
      lat: finalCoords.lat,
      lng: finalCoords.lng,
      icon: saveIcon,
    });

    setShowSaveModal(false);
    setSaveName('');
    setSaveIcon('⭐');
    setPendingSaveAddress(null);
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

      {/* 저장된 장소 */}
      {showSavedPlaces && places.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">자주 가는 장소</p>
          <div className="flex flex-wrap gap-2">
            {places.slice(0, 5).map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectSavedPlace(place)}
                className="group flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-all"
              >
                <span>{place.icon}</span>
                <span className="font-medium">{place.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePlace(place.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 현재 주소 저장 버튼 */}
      {showSavedPlaces && internalValue && value && (
        <button
          type="button"
          onClick={handleStartSavePlace}
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          이 장소 저장하기
        </button>
      )}

      {/* 도움말 */}
      <p className="text-xs text-gray-500 px-1 mt-2">
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

      {/* 장소 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSaveModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">장소 저장</h3>

            {/* 주소 표시 */}
            <div className="bg-gray-100 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-600 truncate">{pendingSaveAddress?.address}</p>
            </div>

            {/* 이름 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">장소 이름</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="예: 집, 회사, 학교"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none"
                autoFocus
              />
            </div>

            {/* 아이콘 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">아이콘</label>
              <div className="flex flex-wrap gap-2">
                {PLACE_ICONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSaveIcon(item.icon)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${
                      saveIcon === item.icon
                        ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSavePlace}
                disabled={!saveName.trim()}
                className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
