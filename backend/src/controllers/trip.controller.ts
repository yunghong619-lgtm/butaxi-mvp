import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TripController {
  /**
   * 기사의 Trip 목록 조회
   */
  async getDriverTrips(req: Request, res: Response) {
    try {
      const { driverId } = req.params;

      const trips = await prisma.trip.findMany({
        where: {
          driverId,
          status: {
            in: ['PLANNED', 'READY', 'IN_PROGRESS'],
          },
        },
        include: {
          vehicle: true,
          stops: {
            orderBy: { sequence: 'asc' },
          },
          bookings: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'asc' },
      });

      res.json({
        success: true,
        data: trips,
      });
    } catch (error) {
      console.error('Trip 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Trip 상세 조회
   */
  async getTripDetail(req: Request, res: Response) {
    try {
      const { tripId } = req.params;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          vehicle: true,
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          stops: {
            orderBy: { sequence: 'asc' },
          },
          bookings: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
              request: true,
            },
          },
        },
      });

      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip을 찾을 수 없습니다.',
        });
      }

      res.json({
        success: true,
        data: trip,
      });
    } catch (error) {
      console.error('Trip 상세 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Trip 상태 업데이트
   */
  async updateTripStatus(req: Request, res: Response) {
    try {
      const { tripId } = req.params;
      const { status } = req.body;

      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: { status },
      });

      // Trip 시작 시 관련 Booking 상태도 업데이트
      if (status === 'IN_PROGRESS') {
        await prisma.booking.updateMany({
          where: { outboundTripId: tripId },
          data: { status: 'IN_TRIP' },
        });
      }

      // Trip 완료 시 관련 Booking 상태도 업데이트
      if (status === 'COMPLETED') {
        await prisma.booking.updateMany({
          where: { outboundTripId: tripId },
          data: { status: 'COMPLETED' },
        });
      }

      res.json({
        success: true,
        data: trip,
        message: 'Trip 상태가 업데이트되었습니다.',
      });
    } catch (error) {
      console.error('Trip 상태 업데이트 실패:', error);
      res.status(500).json({
        success: false,
        error: '상태 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Stop 체크인 (픽업/하차 확인)
   */
  async checkInStop(req: Request, res: Response) {
    try {
      const { stopId } = req.params;

      const stop = await prisma.stop.update({
        where: { id: stopId },
        data: {
          actualTime: new Date(),
        },
      });

      res.json({
        success: true,
        data: stop,
        message: '체크인이 완료되었습니다.',
      });
    } catch (error) {
      console.error('Stop 체크인 실패:', error);
      res.status(500).json({
        success: false,
        error: '체크인 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 드라이버 현재 위치 업데이트
   */
  async updateDriverLocation(req: Request, res: Response) {
    try {
      const { tripId } = req.params;
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: '위도와 경도가 필요합니다.',
        });
      }

      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          currentLat: latitude,
          currentLng: longitude,
          lastLocationUpdate: new Date(),
        },
      });

      res.json({
        success: true,
        data: {
          tripId: trip.id,
          currentLat: trip.currentLat,
          currentLng: trip.currentLng,
          lastLocationUpdate: trip.lastLocationUpdate,
        },
        message: '위치가 업데이트되었습니다.',
      });
    } catch (error) {
      console.error('위치 업데이트 실패:', error);
      res.status(500).json({
        success: false,
        error: '위치 업데이트 중 오류가 발생했습니다.',
      });
    }
  }
}

export const tripController = new TripController();
