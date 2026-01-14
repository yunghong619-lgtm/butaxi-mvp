import axios from 'axios';
import { config } from '../config';
import type { Location, RouteInfo } from '../types';

const KAKAO_API_BASE = 'https://dapi.kakao.com';

export class KakaoService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.kakao.restApiKey;
    
    if (!this.apiKey) {
      console.warn('⚠️  Kakao API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
    }
  }

  /**
   * 주소로 좌표 검색
   */
  async searchAddress(address: string): Promise<Location | null> {
    try {
      const response = await axios.get(`${KAKAO_API_BASE}/v2/local/search/address.json`, {
        headers: {
          Authorization: `KakaoAK ${this.apiKey}`,
        },
        params: {
          query: address,
        },
      });

      const data = response.data;
      if (data.documents && data.documents.length > 0) {
        const result = data.documents[0];
        return {
          address: result.address_name,
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
        };
      }

      return null;
    } catch (error) {
      console.error('Kakao 주소 검색 실패:', error);
      return null;
    }
  }

  /**
   * 좌표로 주소 검색 (역지오코딩)
   */
  async getAddressFromCoords(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await axios.get(`${KAKAO_API_BASE}/v2/local/geo/coord2address.json`, {
        headers: {
          Authorization: `KakaoAK ${this.apiKey}`,
        },
        params: {
          x: lng,
          y: lat,
        },
      });

      const data = response.data;
      if (data.documents && data.documents.length > 0) {
        const result = data.documents[0];
        return result.road_address?.address_name || result.address.address_name;
      }

      return null;
    } catch (error) {
      console.error('Kakao 역지오코딩 실패:', error);
      return null;
    }
  }

  /**
   * 두 지점 간 거리 및 이동시간 계산
   */
  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteInfo | null> {
    try {
      // Kakao Directions API (자동차 경로)
      const response = await axios.get(`${KAKAO_API_BASE}/v2/local/geo/transcoord.json`, {
        headers: {
          Authorization: `KakaoAK ${this.apiKey}`,
        },
        params: {
          x: origin.lng,
          y: origin.lat,
          input_coord: 'WGS84',
          output_coord: 'WGS84',
        },
      });

      // MVP: 간단한 직선거리 기반 추정
      // 실제 프로덕션에서는 Kakao Directions API 또는 TMAP API 사용
      const distance = this.calculateDistance(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng
      );

      // 평균 속도 40km/h로 추정
      const duration = (distance / 40) * 60; // 분 단위

      return {
        distance,
        duration: Math.ceil(duration),
        path: [
          { address: '', lat: origin.lat, lng: origin.lng },
          { address: '', lat: destination.lat, lng: destination.lng },
        ],
      };
    } catch (error) {
      console.error('Kakao 경로 계산 실패:', error);
      
      // Fallback: 직선거리 기반 추정
      const distance = this.calculateDistance(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng
      );
      
      return {
        distance,
        duration: Math.ceil((distance / 40) * 60),
        path: [
          { address: '', lat: origin.lat, lng: origin.lng },
          { address: '', lat: destination.lat, lng: destination.lng },
        ],
      };
    }
  }

  /**
   * 여러 지점을 경유하는 최적 경로 계산 (MVP 간소화 버전)
   */
  async calculateMultiStopRoute(stops: Location[]): Promise<RouteInfo> {
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < stops.length - 1; i++) {
      const route = await this.calculateRoute(
        { lat: stops[i].lat, lng: stops[i].lng },
        { lat: stops[i + 1].lat, lng: stops[i + 1].lng }
      );

      if (route) {
        totalDistance += route.distance;
        totalDuration += route.duration;
      }
    }

    return {
      distance: totalDistance,
      duration: totalDuration,
      path: stops,
    };
  }

  /**
   * 두 지점 간 직선거리 계산 (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 두 지점이 특정 반경 내에 있는지 확인
   */
  isWithinRadius(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number },
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);
    return distance <= radiusKm;
  }
}

export const kakaoService = new KakaoService();
