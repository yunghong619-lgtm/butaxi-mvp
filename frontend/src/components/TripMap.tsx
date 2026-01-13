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

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;

    const kakao = window.kakao;

    // 첫 번째 정거장을 중심으로 설정
    const center = stops.length > 0
      ? new kakao.maps.LatLng(stops[0].latitude, stops[0].longitude)
      : new kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청 기본값

    const mapOption = {
      center,
      level: 7,
    };

    const mapInstance = new kakao.maps.Map(mapRef.current, mapOption);
    setMap(mapInstance);
  }, []);

  // 마커 및 경로 그리기
  useEffect(() => {
    if (!map || !window.kakao || stops.length === 0) return;

    const kakao = window.kakao;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));
    if (polyline) polyline.setMap(null);

    // 새 마커 생성
    const newMarkers = stops.map((stop, index) => {
      const position = new kakao.maps.LatLng(stop.latitude, stop.longitude);
      
      // 마커 색상 결정
      let markerColor = '#999'; // 기본 (예정)
      if (stop.actualTime) {
        markerColor = '#10B981'; // 완료 (초록색)
      } else if (index === 0 || (index > 0 && stops[index - 1].actualTime)) {
        markerColor = '#3B82F6'; // 현재/다음 (파란색)
      }

      // 커스텀 마커 생성
      const markerContent = `
        <div style="
          background: ${markerColor};
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${stop.sequence}
        </div>
      `;

      const customOverlay = new kakao.maps.CustomOverlay({
        position,
        content: markerContent,
        yAnchor: 1,
      });

      customOverlay.setMap(map);

      // 인포윈도우
      const infoWindow = new kakao.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 150px;">
            <div style="font-weight: bold; margin-bottom: 5px;">
              ${stop.stopType === 'PICKUP' ? '🚌 픽업' : '🏁 하차'}
            </div>
            <div style="font-size: 13px; color: #666;">
              ${stop.address}
            </div>
            ${stop.actualTime ? `
              <div style="margin-top: 5px; color: #10B981; font-size: 12px;">
                ✅ 완료
              </div>
            ` : ''}
          </div>
        `,
      });

      // 클릭 이벤트
      kakao.maps.event.addListener(customOverlay, 'click', () => {
        infoWindow.open(map, customOverlay);
      });

      return customOverlay;
    });

    setMarkers(newMarkers);

    // 경로 그리기
    if (showRoute && stops.length > 1) {
      const linePath = stops.map(
        (stop) => new kakao.maps.LatLng(stop.latitude, stop.longitude)
      );

      const newPolyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.7,
        strokeStyle: 'solid',
      });

      newPolyline.setMap(map);
      setPolyline(newPolyline);
    }

    // 지도 범위 조정
    const bounds = new kakao.maps.LatLngBounds();
    stops.forEach((stop) => {
      bounds.extend(new kakao.maps.LatLng(stop.latitude, stop.longitude));
    });
    if (currentLocation) {
      bounds.extend(new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng));
    }
    map.setBounds(bounds);
  }, [map, stops, showRoute]);

  // 현재 위치 마커
  useEffect(() => {
    if (!map || !window.kakao || !currentLocation) return;

    const kakao = window.kakao;

    // 기존 현재 위치 마커 제거
    if (currentMarker) currentMarker.setMap(null);

    // 차량 마커 생성
    const position = new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
    
    const vehicleMarkerContent = `
      <div style="
        background: #EF4444;
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(239,68,68,0.5);
        animation: pulse 2s infinite;
      ">
        🚗
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `;

    const vehicleOverlay = new kakao.maps.CustomOverlay({
      position,
      content: vehicleMarkerContent,
      yAnchor: 1,
    });

    vehicleOverlay.setMap(map);
    setCurrentMarker(vehicleOverlay);

    // 현재 위치로 이동
    map.setCenter(position);
  }, [map, currentLocation]);

  return (
    <div className="relative">
      <div ref={mapRef} style={{ width: '100%', height }} className="rounded-lg shadow-lg" />
      
      {/* 범례 */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          <span>완료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
          <span>현재/다음</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
          <span>예정</span>
        </div>
        {currentLocation && (
          <div className="flex items-center gap-2">
            <div className="text-2xl">🚗</div>
            <span>차량</span>
          </div>
        )}
      </div>
    </div>
  );
}
