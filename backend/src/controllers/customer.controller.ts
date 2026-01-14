import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerController {
  /**
   * 전화번호로 고객 조회
   */
  async getCustomerByPhone(req: Request, res: Response) {
    try {
      const { phone } = req.params;

      // 전화번호 정규화 (하이픈 제거)
      const normalizedPhone = phone.replace(/-/g, '');

      // 고객 조회
      const customer = await prisma.user.findFirst({
        where: {
          phone: {
            contains: normalizedPhone.slice(-8), // 뒤 8자리로 검색
          },
          role: 'CUSTOMER',
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: '해당 전화번호로 등록된 예약이 없습니다.',
        });
      }

      console.log(`📱 전화번호 조회 성공: ${customer.phone} → ${customer.id}`);

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error('고객 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 전화번호로 고객의 모든 데이터 조회 (예약요청, 제안, 예약내역)
   */
  async getCustomerDataByPhone(req: Request, res: Response) {
    try {
      const { phone } = req.params;

      // 전화번호 정규화
      const normalizedPhone = phone.replace(/-/g, '');

      // 고객 조회
      const customer = await prisma.user.findFirst({
        where: {
          phone: {
            contains: normalizedPhone.slice(-8),
          },
          role: 'CUSTOMER',
        },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: '해당 전화번호로 등록된 예약이 없습니다.',
        });
      }

      // 예약 요청 조회
      const requests = await prisma.rideRequest.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
      });

      // 제안 조회
      const proposals = await prisma.proposal.findMany({
        where: {
          request: {
            customerId: customer.id,
          },
          status: 'ACTIVE',
        },
        include: {
          request: true,
          outboundTrip: {
            include: {
              vehicle: true,
              driver: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
          returnTrip: {
            include: {
              vehicle: true,
              driver: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // 예약 내역 조회
      const bookings = await prisma.booking.findMany({
        where: { customerId: customer.id },
        include: {
          request: true,
          outboundTrip: {
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
                where: { customerId: customer.id },
                orderBy: { sequence: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
          },
          requests,
          proposals,
          bookings,
        },
      });
    } catch (error) {
      console.error('고객 데이터 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }
}

export const customerController = new CustomerController();
