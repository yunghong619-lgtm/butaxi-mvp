import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { kakaoService } from '../services/kakao.service';

const prisma = new PrismaClient();

export class RideController {
  /**
   * 예약 요청 생성
   */
  async createRequest(req: Request, res: Response) {
    try {
      const {
        customerId,
        pickupAddress,
        desiredPickupTime,
        dropoffAddress,
        returnAddress,
        desiredReturnTime,
        homeAddress,
        passengerCount,
        specialRequests,
      } = req.body;

      // User 자동 생성 (없는 경우)
      const existingUser = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!existingUser) {
        console.log(`👤 새 사용자 자동 생성: ${customerId}`);
        await prisma.user.create({
          data: {
            id: customerId,
            name: `고객${customerId.slice(0, 6)}`,
            phoneNumber: '010-0000-0000',
            role: 'CUSTOMER',
            email: `customer${customerId.slice(0, 6)}@butaxi.com`,
          },
        });
      }

      // 주소를 좌표로 변환
      const pickupLocation = await kakaoService.searchAddress(pickupAddress);
      const dropoffLocation = await kakaoService.searchAddress(dropoffAddress);
      const returnLocation = await kakaoService.searchAddress(returnAddress);
      const homeLocation = await kakaoService.searchAddress(homeAddress);

      if (!pickupLocation || !dropoffLocation || !returnLocation || !homeLocation) {
        return res.status(400).json({
          success: false,
          error: '주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.',
        });
      }

      // RideRequest 생성
      const request = await prisma.rideRequest.create({
        data: {
          customerId,
          pickupAddress: pickupLocation.address,
          pickupLat: pickupLocation.latitude,
          pickupLng: pickupLocation.longitude,
          desiredPickupTime: new Date(desiredPickupTime),
          dropoffAddress: dropoffLocation.address,
          dropoffLat: dropoffLocation.latitude,
          dropoffLng: dropoffLocation.longitude,
          returnAddress: returnLocation.address,
          returnLat: returnLocation.latitude,
          returnLng: returnLocation.longitude,
          desiredReturnTime: new Date(desiredReturnTime),
          homeAddress: homeLocation.address,
          homeLat: homeLocation.latitude,
          homeLng: homeLocation.longitude,
          passengerCount: passengerCount || 1,
          specialRequests,
          status: 'REQUESTED',
        },
      });

      console.log(`✅ 예약 요청 생성: ${request.id}`);

      res.json({
        success: true,
        data: request,
        message: '예약 요청이 접수되었습니다. 곧 제안을 보내드리겠습니다.',
      });
    } catch (error) {
      console.error('예약 요청 생성 실패:', error);
      res.status(500).json({
        success: false,
        error: '예약 요청 처리 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 고객의 예약 요청 목록 조회
   */
  async getCustomerRequests(req: Request, res: Response) {
    try {
      const { customerId } = req.params;

      const requests = await prisma.rideRequest.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error('예약 요청 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 예약 요청 상세 조회
   */
  async getRequestDetail(req: Request, res: Response) {
    try {
      const { requestId } = req.params;

      const request = await prisma.rideRequest.findUnique({
        where: { id: requestId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          proposals: true,
          bookings: true,
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: '예약 요청을 찾을 수 없습니다.',
        });
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error('예약 요청 상세 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 예약 요청 취소
   */
  async cancelRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;

      const request = await prisma.rideRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELLED' },
      });

      res.json({
        success: true,
        data: request,
        message: '예약 요청이 취소되었습니다.',
      });
    } catch (error) {
      console.error('예약 요청 취소 실패:', error);
      res.status(500).json({
        success: false,
        error: '취소 처리 중 오류가 발생했습니다.',
      });
    }
  }
}

export const rideController = new RideController();
