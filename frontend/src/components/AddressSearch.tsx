import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface AddressResult {
  address_name: string;
  road_address_name?: string;
  place_name?: string;
  x: string;
  y: string;
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
}

export default function AddressSearch({
  value,
  onChange,
  placeholder = '주소를 검색하세요 (예: 서울시 강남구 역삼동)',
  label,
}: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || '03e6693a8b25414be33cea9e8e88b3cf';

  const searchAddress = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        'https://dapi.kakao.com/v2/local/search/address.json',
        {
          params: { query },
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          },
        }
      );
      
      const keywordResponse = await axios.get(
        'https://dapi.kakao.com/v2/local/search/keyword.json',
        {
          params: { query },
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          },
        }
      );

      const addressResults = response.data.documents || [];
      const keywordResults = keywordResponse.data.documents || [];
      
      setResults([...addressResults, ...keywordResults].slice(0, 10));
    } catch (error) {
      console.error('주소 검색 실패:', error);
      // 검색 실패 시에도 수동 입력 가능하도록
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectAddress = (result: AddressResult) => {
    const addressName = result.place_name || result.road_address_name || result.address_name;
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    
    onChange(addressName, lat, lng);
    setSearchQuery(addressName);
    setIsOpen(false);
  };

  // 수동 입력 시 Enter 키로 확정
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery && results.length === 0) {
      // 검색 결과가 없을 때 수동 입력으로 처리 (기본 좌표: 서울시청)
      onChange(searchQuery, 37.5665, 126.978);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={value || searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
        />

        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && (searchQuery || results.length > 0) && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute z-20 w-full mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-black mb-2"></div>
                <p className="text-sm">검색 중...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectAddress(result)}
                    className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">
                      {result.place_name || result.road_address_name || result.address_name}
                    </div>
                    {result.place_name && (result.road_address_name || result.address_name) && (
                      <div className="text-sm text-gray-500">
                        {result.road_address_name || result.address_name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <p className="mb-2">검색 결과가 없습니다</p>
                <p className="text-xs text-gray-400">
                  💡 Enter 키를 누르면 직접 입력한 주소로 진행됩니다
                </p>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                2자 이상 입력해주세요
              </div>
            )}
          </div>
        </>
      )}

      {/* 도움말 텍스트 */}
      <p className="mt-2 text-xs text-gray-500">
        💡 주소를 검색하거나 직접 입력 후 Enter를 눌러주세요
      </p>
    </div>
  );
}
