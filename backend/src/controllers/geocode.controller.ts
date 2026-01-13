import { Request, Response } from 'express';
import { naverService } from '../services/naver.service';

export class GeocodeController {
  /**
   * 주소 검색 (Geocoding)
   */
  async searchAddress(req: Request, res: Response) {
    try {
      const { query } = req.body;

      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          error: '검색어를 입력해주세요.',
        });
      }

      const result = await naverService.searchAddress(query);

      if (result) {
        // 배열 형태로 반환 (여러 결과 시뮬레이션)
        res.json({
          success: true,
          data: [{
            roadAddress: result.address,
            jibunAddress: result.address,
            x: result.longitude.toString(),
            y: result.latitude.toString(),
          }],
        });
      } else {
        res.json({
          success: true,
          data: [],
        });
      }
    } catch (error) {
      console.error('주소 검색 실패:', error);
      res.status(500).json({
        success: false,
        error: '주소 검색 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 좌표를 주소로 변환 (Reverse Geocoding)
   */
  async reverseGeocode(req: Request, res: Response) {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: '좌표 정보가 필요합니다.',
        });
      }

      const address = await naverService.reverseGeocode(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      if (address) {
        res.json({
          success: true,
          data: address,
        });
      } else {
        res.json({
          success: false,
          error: '주소를 찾을 수 없습니다.',
        });
      }
    } catch (error) {
      console.error('Reverse Geocoding 실패:', error);
      res.status(500).json({
        success: false,
        error: '주소 변환 중 오류가 발생했습니다.',
      });
    }
  }
}

export const geocodeController = new GeocodeController();
