import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { paymentService } from '../services/payment.service';

const prisma = new PrismaClient();

export class BookingController {
  /**
   * 고객의 Booking 목록 조회
   */
  async getCustomerBookings(req: Request, res: Response) {
    try {
      const { customerId } = req.params;

      const bookings = await prisma.booking.findMany({
        where: { customerId },
        include: {
          request: true,
          outboundTrip: {
            include: {
              vehicle: true,
              stops: {
                where: { customerId },
                orderBy: { sequence: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error('Booking 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Booking 상세 조회
   */
  async getBookingDetail(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
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
                orderBy: { sequence: 'asc' },
              },
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking을 찾을 수 없습니다.',
        });
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error('Booking 상세 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Booking 취소
   */
  async cancelBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          outboundTrip: {
            include: {
              stops: {
                where: { stopType: 'PICKUP' },
                orderBy: { sequence: 'asc' },
              },
            },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking을 찾을 수 없습니다.',
        });
      }

      if (booking.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          error: '이미 취소된 예약입니다.',
        });
      }

      // 픽업 시간 가져오기
      const pickupTime = booking.outboundTrip?.stops[0]?.scheduledTime || new Date();

      // 취소 수수료 계산
      const cancellationFee = paymentService.calculateCancellationFee(
        booking.totalPrice,
        pickupTime
      );

      const refundAmount = booking.totalPrice - cancellationFee;

      // 환불 처리 (Mock)
      if (refundAmount > 0 && booking.transactionId) {
        await paymentService.refund(booking.transactionId, refundAmount, '고객 취소');
      }

      // Booking 취소
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationFee,
        },
      });

      // 거래 내역 저장
      if (refundAmount > 0) {
        await prisma.transaction.create({
          data: {
            bookingId,
            amount: refundAmount,
            type: 'REFUND',
            status: 'COMPLETED',
            isMock: true,
          },
        });
      }

      if (cancellationFee > 0) {
        await prisma.transaction.create({
          data: {
            bookingId,
            amount: cancellationFee,
            type: 'CANCELLATION_FEE',
            status: 'COMPLETED',
            isMock: true,
          },
        });
      }

      res.json({
        success: true,
        data: {
          booking: updatedBooking,
          cancellationFee,
          refundAmount,
        },
        message: `예약이 취소되었습니다. 취소 수수료: ${cancellationFee.toLocaleString()}원, 환불 금액: ${refundAmount.toLocaleString()}원`,
      });
    } catch (error) {
      console.error('Booking 취소 실패:', error);
      res.status(500).json({
        success: false,
        error: '취소 처리 중 오류가 발생했습니다.',
      });
    }
  }
}

export const bookingController = new BookingController();
