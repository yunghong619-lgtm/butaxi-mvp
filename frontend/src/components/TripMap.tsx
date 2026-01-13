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
    kakao: any;
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
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Kakao Maps SDK 로딩 대기
  useEffect(() => {
    const checkKakaoMaps = () => {
      if (window.kakao && window.kakao.maps) {
        setIsKakaoLoaded(true);
        return true;
      }
      return false;
    };

    // 즉시 체크
    if (checkKakaoMaps()) return;

    // 최대 5초 동안 0.5초마다 체크
    let attempts = 0;
    const maxAttempts = 10;
    
    const interval = setInterval(() => {
      attempts++;
      
      if (checkKakaoMaps()) {
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
    if (!mapRef.current || !isKakaoLoaded || !window.kakao?.maps) return;

    try {
      const kakao = window.kakao;

      // 첫 번째 정거장을 중심으로 설정
      const center = stops.length > 0 && stops[0].latitude && stops[0].longitude
        ? new kakao.maps.LatLng(stops[0].latitude, stops[0].longitude)
        : new kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청 기본값

      const mapOption = {
        center,
        level: 7,
      };

      const mapInstance = new kakao.maps.Map(mapRef.current, mapOption);
      setMap(mapInstance);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
      setLoadError(true);
    }
  }, [isKakaoLoaded, stops]);

  // 마커 및 경로 그리기
  useEffect(() => {
    if (!map || !isKakaoLoaded || !window.kakao?.maps) return;

    try {
      const kakao = window.kakao;

      // 기존 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      if (polyline) polyline.setMap(null);

      const newMarkers: any[] = [];
      const path: any[] = [];

      // 정거장 마커 생성
      stops.forEach((stop, index) => {
        if (!stop.latitude || !stop.longitude) return;

        const position = new kakao.maps.LatLng(stop.latitude, stop.longitude);
        path.push(position);

        const markerImage = new kakao.maps.MarkerImage(
          `https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_${
            stop.stopType === 'PICKUP' ? 'blue' : 'red'
          }.png`,
          new kakao.maps.Size(36, 37)
        );

        const marker = new kakao.maps.Marker({
          position,
          image: markerImage,
          map,
        });

        // 인포윈도우
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${index + 1}. ${stop.address}</div>`,
        });

        kakao.maps.event.addListener(marker, 'mouseover', () => {
          infowindow.open(map, marker);
        });

        kakao.maps.event.addListener(marker, 'mouseout', () => {
          infowindow.close();
        });

        newMarkers.push(marker);
      });

      // 경로 그리기
      if (showRoute && path.length > 1) {
        const newPolyline = new kakao.maps.Polyline({
          path,
          strokeWeight: 5,
          strokeColor: '#000000',
          strokeOpacity: 0.7,
          strokeStyle: 'solid',
        });

        newPolyline.setMap(map);
        setPolyline(newPolyline);
      }

      // 현재 위치 마커
      if (currentLocation && currentLocation.lat && currentLocation.lng) {
        if (currentMarker) currentMarker.setMap(null);

        const position = new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);

        const vehicleMarker = new kakao.maps.Marker({
          position,
          map,
          image: new kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            new kakao.maps.Size(24, 35)
          ),
        });

        setCurrentMarker(vehicleMarker);
        map.setCenter(position);
      }

      setMarkers(newMarkers);

      // 지도 범위 자동 조정
      if (path.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        path.forEach((position) => bounds.extend(position));
        map.setBounds(bounds);
      }
    } catch (error) {
      console.error('마커 생성 실패:', error);
    }
  }, [map, stops, currentLocation, showRoute, isKakaoLoaded]);

  // 로딩 중
  if (!isKakaoLoaded && !loadError) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-gray-100 rounded-2xl"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black mb-3"></div>
          <p className="text-gray-600 text-sm">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로딩 실패
  if (loadError) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-gray-200"
      >
        <div className="text-center px-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 font-medium mb-1">지도를 불러올 수 없습니다</p>
          <p className="text-sm text-gray-500">Kakao Maps API 설정을 확인해주세요</p>
        </div>
      </div>
    );
  }

  // 정상 렌더링
  return <div ref={mapRef} style={{ width: '100%', height }} className="rounded-2xl" />;
}
