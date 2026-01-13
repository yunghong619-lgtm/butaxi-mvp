import { useState, useEffect } from 'react';

interface AddressSearchProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
}

// 주소 문자열에서 더미 좌표 생성 (서울 지역 기준)
const generateDummyCoordinates = (address: string): { lat: number; lng: number } => {
  // 주소 문자열을 해시하여 시드값 생성
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash = hash & hash; // 32비트 정수로 변환
  }
  
  // 서울 중심부 기준 (37.5665, 126.978)
  // ±0.05도 범위 내에서 랜덤 좌표 생성 (약 5km 반경)
  const centerLat = 37.5665;
  const centerLng = 126.978;
  
  // 해시값을 0~1 범위로 정규화
  const seed1 = Math.abs(hash % 10000) / 10000;
  const seed2 = Math.abs((hash >> 16) % 10000) / 10000;
  
  const lat = centerLat + (seed1 - 0.5) * 0.1; // ±0.05도
  const lng = centerLng + (seed2 - 0.5) * 0.1; // ±0.05도
  
  return { lat, lng };
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
  }
}

export default function AddressSearch({
  value,
  onChange,
  placeholder = '주소 찾기 버튼을 눌러주세요',
  label,
}: AddressSearchProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSearchAddress = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        // 도로명 주소가 있으면 도로명, 없으면 지번 주소
        const fullAddress = data.roadAddress || data.jibunAddress;
        const extraAddress = data.buildingName ? ` (${data.buildingName})` : '';
        const finalAddress = fullAddress + extraAddress;
        
        // 더미 좌표 생성
        const { lat, lng } = generateDummyCoordinates(fullAddress);
        
        setInternalValue(finalAddress);
        onChange(finalAddress, lat, lng);
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

  const handleManualSubmit = () => {
    if (internalValue.trim()) {
      const { lat, lng } = generateDummyCoordinates(internalValue);
      onChange(internalValue, lat, lng);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* 주소 입력 필드 */}
        <div className="flex-1 relative group">
          <input
            type="text"
            value={internalValue}
            onChange={(e) => handleManualChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-5 py-4 pr-12 text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
          />
          
          {/* Clear 버튼 */}
          {internalValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="지우기"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5"
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

        {/* 주소 찾기 버튼 */}
        <button
          type="button"
          onClick={handleSearchAddress}
          className="px-6 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          🔍 주소 찾기
        </button>
      </div>

      {/* 도움말 */}
      <p className="text-xs text-gray-500 px-1">
        💡 주소 찾기 버튼을 클릭하거나, 직접 입력 후 Enter를 눌러주세요
      </p>
    </div>
  );
}
