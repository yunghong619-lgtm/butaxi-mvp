import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { kakaoService } from '../services/kakao.service';
import { matchingService } from '../services/matching.service';

const prisma = new PrismaClient();

export class RideController {
  /**
   * 예약 요청 생성
   */
  async createRequest(req: Request, res: Response) {
    try {
      const {
        customerId,
        customerName,
        customerPhone,
        pickupAddress,
        pickupLat,
        pickupLng,
        desiredPickupTime,
        dropoffAddress,
        dropoffLat,
        dropoffLng,
        returnAddress,
        returnLat,
        returnLng,
        desiredReturnTime,
        homeAddress,
        homeLat,
        homeLng,
        passengerCount,
        specialRequests,
      } = req.body;

      // customerId로 User 조회 또는 생성
      let user = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!user) {
        // User가 없으면 새로 생성
        user = await prisma.user.create({
          data: {
            id: customerId,
            name: customerName || '고객',
            phone: customerPhone || '010-0000-0000',
            email: `${customerId}@temp.butaxi.com`,
            role: 'CUSTOMER',
          },
        });
        console.log(`👤 새 고객 생성: ${user.id}`);
      }

      // 프론트엔드에서 좌표를 보내면 사용, 없으면 Kakao API로 조회
      let finalPickupLat = pickupLat;
      let finalPickupLng = pickupLng;
      let finalPickupAddress = pickupAddress;

      let finalDropoffLat = dropoffLat;
      let finalDropoffLng = dropoffLng;
      let finalDropoffAddress = dropoffAddress;

      let finalReturnLat = returnLat;
      let finalReturnLng = returnLng;
      let finalReturnAddress = returnAddress;

      let finalHomeLat = homeLat;
      let finalHomeLng = homeLng;
      let finalHomeAddress = homeAddress;

      // 좌표가 없는 경우에만 Kakao API 호출
      if (!finalPickupLat || !finalPickupLng) {
        const pickupLocation = await kakaoService.searchAddress(pickupAddress);
        if (pickupLocation) {
          finalPickupLat = pickupLocation.lat;
          finalPickupLng = pickupLocation.lng;
          finalPickupAddress = pickupLocation.address;
        }
      }

      if (!finalDropoffLat || !finalDropoffLng) {
        const dropoffLocation = await kakaoService.searchAddress(dropoffAddress);
        if (dropoffLocation) {
          finalDropoffLat = dropoffLocation.lat;
          finalDropoffLng = dropoffLocation.lng;
          finalDropoffAddress = dropoffLocation.address;
        }
      }

      if (!finalReturnLat || !finalReturnLng) {
        const returnLocation = await kakaoService.searchAddress(returnAddress);
        if (returnLocation) {
          finalReturnLat = returnLocation.lat;
          finalReturnLng = returnLocation.lng;
          finalReturnAddress = returnLocation.address;
        }
      }

      if (!finalHomeLat || !finalHomeLng) {
        const homeLocation = await kakaoService.searchAddress(homeAddress);
        if (homeLocation) {
          finalHomeLat = homeLocation.lat;
          finalHomeLng = homeLocation.lng;
          finalHomeAddress = homeLocation.address;
        }
      }

      // 디버깅 로그
      console.log('📍 주소 및 좌표 정보:');
      console.log('  - Pickup:', finalPickupAddress, `(${finalPickupLat}, ${finalPickupLng})`);
      console.log('  - Dropoff:', finalDropoffAddress, `(${finalDropoffLat}, ${finalDropoffLng})`);
      console.log('  - Return:', finalReturnAddress, `(${finalReturnLat}, ${finalReturnLng})`);
      console.log('  - Home:', finalHomeAddress, `(${finalHomeLat}, ${finalHomeLng})`);

      // 최소한 주소는 있어야 함
      if (!finalPickupAddress || !finalDropoffAddress || !finalReturnAddress || !finalHomeAddress) {
        console.error('❌ 주소 누락:', {
          pickup: !!finalPickupAddress,
          dropoff: !!finalDropoffAddress,
          return: !!finalReturnAddress,
          home: !!finalHomeAddress
        });
        return res.status(400).json({
          success: false,
          error: '주소 정보가 필요합니다. 모든 주소를 입력해주세요.',
        });
      }

      // RideRequest 생성
      const request = await prisma.rideRequest.create({
        data: {
          customerId: user.id,
          pickupAddress: finalPickupAddress,
          pickupLat: finalPickupLat || 0,
          pickupLng: finalPickupLng || 0,
          desiredPickupTime: new Date(desiredPickupTime),
          dropoffAddress: finalDropoffAddress,
          dropoffLat: finalDropoffLat || 0,
          dropoffLng: finalDropoffLng || 0,
          returnAddress: finalReturnAddress,
          returnLat: finalReturnLat || 0,
          returnLng: finalReturnLng || 0,
          desiredReturnTime: new Date(desiredReturnTime),
          homeAddress: finalHomeAddress,
          homeLat: finalHomeLat || 0,
          homeLng: finalHomeLng || 0,
          passengerCount: passengerCount || 1,
          specialRequests,
          status: 'REQUESTED',
        },
      });

      console.log(`✅ 예약 요청 생성: ${request.id}`);

      // 즉시 매칭 실행 (테스트용 - 1명이라도 바로 매칭)
      setTimeout(async () => {
        try {
          await matchingService.runMatchingBatch();
          console.log('📨 자동 매칭 완료');
        } catch (error) {
          console.error('자동 매칭 실패:', error);
        }
      }, 1000);

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
