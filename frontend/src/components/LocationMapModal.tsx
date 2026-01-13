import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

interface SearchResult {
  address_name: string;
  road_address_name?: string;
  place_name?: string;
  x: string;
  y: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function LocationMapModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = 37.5665,
  initialLng = 126.9780,
}: LocationMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState('위치를 가져오는 중...');
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 주소 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || '03e6693a8b25414be33cea9e8e88b3cf';

  // 지도 중심 이동 함수
  const moveMapToLocation = (lat: number, lng: number, updateAddress: boolean = true) => {
    if (!map || !marker || !window.kakao) return;

    const kakao = window.kakao;
    const newPosition = new kakao.maps.LatLng(lat, lng);
    
    // 지도 중심 이동
    map.setCenter(newPosition);
    // 마커 이동
    marker.setPosition(newPosition);

    // 주소 업데이트
    if (updateAddress) {
      setSelectedLat(lat);
      setSelectedLng(lng);
      setSelectedAddress('주소를 가져오는 중...');

      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(lng, lat, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const address = result[0].road_address?.address_name || result[0].address.address_name;
          setSelectedAddress(address);
        } else {
          setSelectedAddress('선택된 위치');
        }
      });
    }
  };

  // 주소 검색
  const searchAddress = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // 주소 검색
      const addressResponse = await axios.get(
        'https://dapi.kakao.com/v2/local/search/address.json',
        {
          params: { query },
          headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        }
      );

      // 키워드 검색 (건물명, 장소명 등)
      const keywordResponse = await axios.get(
        'https://dapi.kakao.com/v2/local/search/keyword.json',
        {
          params: { query },
          headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        }
      );

      const addressResults = addressResponse.data.documents || [];
      const keywordResults = keywordResponse.data.documents || [];

      setSearchResults([...addressResults, ...keywordResults].slice(0, 10));
    } catch (error) {
      console.error('주소 검색 실패:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 검색어 입력 시 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 검색 결과 선택
  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    const address = result.place_name || result.road_address_name || result.address_name;

    setSelectedAddress(address);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);

    // 지도 이동
    moveMapToLocation(lat, lng, false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const initializeMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.error('Kakao Maps SDK가 로드되지 않았습니다.');
        setError('지도를 로드할 수 없습니다. 페이지를 새로고침해주세요.');
        setMapLoading(false);
        return;
      }

      if (!mapRef.current) {
        console.error('Map container not found');
        return;
      }

      try {
        window.kakao.maps.load(() => {
          if (!mapRef.current) return;

          const kakao = window.kakao;
          const container = mapRef.current;
          const options = {
            center: new kakao.maps.LatLng(initialLat, initialLng),
            level: 3,
          };

          console.log('Initializing Kakao Map...', { initialLat, initialLng });
          const mapInstance = new kakao.maps.Map(container, options);
          setMap(mapInstance);
          setMapLoading(false);

          // 마커 생성
          const markerInstance = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(initialLat, initialLng),
            map: mapInstance,
          });
          setMarker(markerInstance);

          // 지도 클릭 이벤트
          kakao.maps.event.addListener(mapInstance, 'click', function (mouseEvent: any) {
            const latlng = mouseEvent.latLng;
            const lat = latlng.getLat();
            const lng = latlng.getLng();

            // 마커 위치 변경
            markerInstance.setPosition(latlng);

            // 좌표로 주소 검색
            setSelectedAddress('주소를 가져오는 중...');
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.coord2Address(lng, lat, (result: any, status: any) => {
              if (status === kakao.maps.services.Status.OK) {
                const address = result[0].road_address?.address_name || result[0].address.address_name;
                setSelectedAddress(address);
                setSelectedLat(lat);
                setSelectedLng(lng);
              } else {
                setSelectedAddress('주소를 가져올 수 없습니다');
              }
            });
          });

          // 초기 주소 가져오기
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.coord2Address(initialLng, initialLat, (result: any, status: any) => {
            if (status === kakao.maps.services.Status.OK) {
              const address = result[0].road_address?.address_name || result[0].address.address_name;
              setSelectedAddress(address);
            } else {
              setSelectedAddress('현재 위치');
            }
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('지도 초기화 실패');
        setMapLoading(false);
      }
    };

    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, [isOpen, initialLat, initialLng]);

  const handleConfirm = () => {
    if (selectedAddress && 
        selectedAddress !== '위치를 가져오는 중...' && 
        !selectedAddress.includes('로드할 수 없습니다') &&
        !selectedAddress.includes('초기화 실패')) {
      onSelectLocation(selectedAddress, selectedLat, selectedLng);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">위치 선택</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 주소 검색 입력창 */}
          <div className="relative">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="주소나 장소를 검색하세요"
                className="w-full px-4 py-3 pl-11 text-sm border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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

            {/* 검색 결과 드롭다운 */}
            {showSearchResults && (searchQuery || searchResults.length > 0) && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSearchResults(false)}
                />
                
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-black mb-2"></div>
                      <p>검색 중...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSearchResult(result)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900 text-sm mb-1">
                            {result.place_name || result.road_address_name || result.address_name}
                          </div>
                          {result.place_name && (result.road_address_name || result.address_name) && (
                            <div className="text-xs text-gray-500">
                              {result.road_address_name || result.address_name}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      검색 결과가 없습니다
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      2자 이상 입력해주세요
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative" style={{ height: '400px' }}>
          <div 
            ref={mapRef} 
            className="w-full h-full bg-gray-100"
            style={{ minHeight: '400px' }}
          />
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mb-4"></div>
                <p className="text-gray-600">지도를 불러오는 중...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center p-6">
                <p className="text-red-600 font-semibold mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  페이지 새로고침
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Address Display */}
        <div className="p-6 border-t bg-gray-50">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선택된 위치
            </label>
            <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm">
              {selectedAddress}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-black text-black rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedAddress || selectedAddress === '위치를 가져오는 중...' || !!error}
              className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              확인
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            💡 주소를 검색하거나 지도를 클릭하여 위치를 선택할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
