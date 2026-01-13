// 공통 타입 정의 (프론트엔드/백엔드 공유)

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface RouteInfo {
  distance: number;  // km
  duration: number;  // minutes
  path: Location[];
}

export interface CustomerSchedule {
  pickupTime: Date;
  dropoffTime: Date;
  returnPickupTime: Date;
  returnDropoffTime: Date;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Kakao API 관련
export interface KakaoCoordinate {
  x: string;  // longitude
  y: string;  // latitude
}

export interface KakaoAddress {
  address_name: string;
  road_address?: {
    address_name: string;
  };
  x: string;
  y: string;
}
