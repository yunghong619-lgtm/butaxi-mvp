import axios from 'axios';

interface NaverGeocodingResponse {
  status: string;
  addresses?: Array<{
    roadAddress: string;
    jibunAddress: string;
    x: string; // longitude
    y: string; // latitude
  }>;
  errorMessage?: string;
}

interface NaverReverseGeocodingResponse {
  status: {
    code: number;
    name: string;
    message: string;
  };
  results?: Array<{
    region: {
      area1: { name: string };
      area2: { name: string };
      area3: { name: string };
      area4: { name: string };
    };
    land: {
      number1: string;
      number2: string;
      name: string;
      addition0: {
        value: string;
      };
    };
  }>;
}

interface LocationResult {
  address: string;
  latitude: number;
  longitude: number;
}

export class NaverService {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID || '';
    this.clientSecret = process.env.NAVER_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ Naver API credentials not found in environment variables');
    }
  }

  /**
   * 주소를 좌표로 변환 (Geocoding)
   */
  async searchAddress(address: string): Promise<LocationResult | null> {
    if (!address || !address.trim()) {
      console.error('주소가 비어있습니다');
      return null;
    }

    try {
      const response = await axios.get<NaverGeocodingResponse>(
        'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode',
        {
          params: {
            query: address,
          },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': this.clientId,
            'X-NCP-APIGW-API-KEY': this.clientSecret,
          },
          timeout: 10000,
        }
      );

      if (response.data.status === 'OK' && response.data.addresses && response.data.addresses.length > 0) {
        const location = response.data.addresses[0];
        return {
          address: location.roadAddress || location.jibunAddress,
          latitude: parseFloat(location.y),
          longitude: parseFloat(location.x),
        };
      } else {
        console.warn(`⚠️ Naver Geocoding: 주소를 찾을 수 없습니다 - ${address}`);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Naver Geocoding API 호출 실패:', error.message);
      return null;
    }
  }

  /**
   * 좌표를 주소로 변환 (Reverse Geocoding)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await axios.get<NaverReverseGeocodingResponse>(
        'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc',
        {
          params: {
            coords: `${longitude},${latitude}`,
            orders: 'roadaddr,addr',
            output: 'json',
          },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': this.clientId,
            'X-NCP-APIGW-API-KEY': this.clientSecret,
          },
          timeout: 10000,
        }
      );

      if (response.data.status.code === 0 && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const region = result.region;
        const land = result.land;

        // 도로명 주소 우선
        if (land.addition0?.value) {
          return `${region.area1.name} ${region.area2.name} ${land.addition0.value}`;
        }

        // 지번 주소
        return `${region.area1.name} ${region.area2.name} ${region.area3.name} ${land.name} ${land.number1}${land.number2 ? '-' + land.number2 : ''}`;
      } else {
        console.warn(`⚠️ Naver Reverse Geocoding: 주소를 찾을 수 없습니다 - (${latitude}, ${longitude})`);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Naver Reverse Geocoding API 호출 실패:', error.message);
      return null;
    }
  }

  /**
   * 두 좌표 사이의 거리 계산 (Haversine formula)
   * @returns 거리 (km)
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
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

  /**
   * 반경 내에 있는지 확인
   */
  isWithinRadius(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number },
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(
      point1.lat,
      point1.lng,
      point2.lat,
      point2.lng
    );
    return distance <= radiusKm;
  }

  /**
   * 각도를 라디안으로 변환
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const naverService = new NaverService();
