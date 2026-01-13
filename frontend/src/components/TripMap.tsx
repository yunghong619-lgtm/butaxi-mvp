import { useEffect, useRef, useState } from 'react';

interface Stop {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  stopType: string;
  sequence: number;
  actualTime: string | null;
  customerId?: string;
}

interface TripMapProps {
  stops: Stop[];
  currentLocation?: { lat: number; lng: number } | null;
  showRoute?: boolean;
  height?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function TripMap({
  stops,
  currentLocation,
  showRoute = true,
  height = '400px',
}: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polyline, setPolyline] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [isNaverLoaded, setIsNaverLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Naver Maps SDK 로딩 대기
  useEffect(() => {
    const checkNaverMaps = () => {
      if (window.naver && window.naver.maps) {
        setIsNaverLoaded(true);
        return true;
      }
      return false;
    };

    // 즉시 체크
    if (checkNaverMaps()) return;

    // 최대 5초 동안 0.5초마다 체크
    let attempts = 0;
    const maxAttempts = 10;
    
    const interval = setInterval(() => {
      attempts++;
      
      if (checkNaverMaps()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setLoadError(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !isNaverLoaded || !window.naver?.maps) return;

    try {
      const naver = window.naver;

      // 첫 번째 정거장을 중심으로 설정
      const center = stops.length > 0 && stops[0].latitude && stops[0].longitude
        ? new naver.maps.LatLng(stops[0].latitude, stops[0].longitude)
        : new naver.maps.LatLng(37.5665, 126.9780); // 서울 시청 기본값

      const mapOptions = {
        center,
        zoom: 13,
        zoomControl: true,
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      };

      const mapInstance = new naver.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
      setLoadError(true);
    }
  }, [isNaverLoaded, stops]);

  // 마커 및 경로 그리기
  useEffect(() => {
    if (!map || !isNaverLoaded || !window.naver?.maps) return;

    const naver = window.naver;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));
    if (polyline) {
      polyline.setMap(null);
    }
    if (currentMarker) {
      currentMarker.setMap(null);
    }

    // 유효한 정거장만 필터링
    const validStops = stops.filter((stop) => stop.latitude && stop.longitude);

    if (validStops.length === 0) {
      setMarkers([]);
      return;
    }

    // 마커 생성
    const newMarkers = validStops.map((stop, index) => {
      const position = new naver.maps.LatLng(stop.latitude, stop.longitude);

      // 마커 색상 설정
      let markerColor = '#3B82F6'; // 파란색 (픽업)
      if (stop.stopType === 'DROPOFF') {
        markerColor = '#10B981'; // 초록색 (하차)
      }
      if (stop.actualTime) {
        markerColor = '#9CA3AF'; // 회색 (완료됨)
      }

      // 마커 생성
      const marker = new naver.maps.Marker({
        position,
        map,
        title: `${index + 1}. ${stop.address}`,
        icon: {
          content: `
            <div style="
              background-color: ${markerColor};
              color: white;
              padding: 8px 12px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
            ">
              ${index + 1}. ${stop.stopType === 'PICKUP' ? '🚶' : '🏁'}
            </div>
          `,
          size: new naver.maps.Size(50, 36),
          anchor: new naver.maps.Point(25, 36),
        },
      });

      // 정보창 추가
      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <strong style="display: block; margin-bottom: 5px;">
              ${stop.stopType === 'PICKUP' ? '🚶 픽업' : '🏁 하차'} #${index + 1}
            </strong>
            <div style="font-size: 12px; color: #666;">
              ${stop.address}
            </div>
            ${stop.actualTime ? `
              <div style="margin-top: 5px; font-size: 11px; color: #10B981;">
                ✓ 완료됨
              </div>
            ` : ''}
          </div>
        `,
      });

      // 마커 클릭 이벤트
      naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // 경로 그리기
    if (showRoute && validStops.length >= 2) {
      const path = validStops.map(
        (stop) => new naver.maps.LatLng(stop.latitude, stop.longitude)
      );

      const newPolyline = new naver.maps.Polyline({
        map,
        path,
        strokeColor: '#3B82F6',
        strokeWeight: 4,
        strokeOpacity: 0.7,
        strokeStyle: 'solid',
      });

      setPolyline(newPolyline);
    }

    // 현재 위치 마커
    if (currentLocation) {
      const currentPos = new naver.maps.LatLng(currentLocation.lat, currentLocation.lng);

      const newCurrentMarker = new naver.maps.Marker({
        position: currentPos,
        map,
        icon: {
          content: `
            <div style="
              background-color: #EF4444;
              color: white;
              padding: 10px;
              border-radius: 50%;
              font-size: 16px;
              box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
              animation: pulse 2s infinite;
            ">
              🚗
            </div>
          `,
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 20),
        },
        zIndex: 1000,
      });

      setCurrentMarker(newCurrentMarker);

      // 현재 위치로 지도 이동
      map.setCenter(currentPos);
    }

    // 지도 범위 자동 조정
    if (validStops.length > 0) {
      const bounds = new naver.maps.LatLngBounds();

      validStops.forEach((stop) => {
        bounds.extend(new naver.maps.LatLng(stop.latitude, stop.longitude));
      });

      if (currentLocation) {
        bounds.extend(new naver.maps.LatLng(currentLocation.lat, currentLocation.lng));
      }

      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, stops, currentLocation, showRoute, isNaverLoaded]);

  // Fallback UI
  if (loadError || (!isNaverLoaded && stops.length === 0)) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-2xl flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-gray-600 font-medium mb-2">지도를 표시할 수 없습니다</p>
          {loadError ? (
            <p className="text-sm text-gray-500">
              지도 로드에 실패했습니다.<br />
              페이지를 새로고침해주세요.
            </p>
          ) : stops.length === 0 ? (
            <p className="text-sm text-gray-500">
              표시할 정거장이 없습니다.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              지도를 불러오는 중...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden shadow-lg"
        style={{ height }}
      />
      {!isNaverLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mb-4"></div>
            <p className="text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
