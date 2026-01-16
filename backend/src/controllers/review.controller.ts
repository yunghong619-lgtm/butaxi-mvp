import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReviewController {
  /**
   * 리뷰 작성
   */
  async createReview(req: Request, res: Response) {
    try {
      const { bookingId, rating, comment } = req.body;

      // 유효성 검사
      if (!bookingId || !rating) {
        return res.status(400).json({
          success: false,
          error: '예약 ID와 별점은 필수입니다.',
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: '별점은 1-5 사이여야 합니다.',
        });
      }

      // 예약 확인
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          outboundTrip: true,
          review: true,
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: '예약을 찾을 수 없습니다.',
        });
      }

      // 이미 리뷰가 있는지 확인
      if (booking.review) {
        return res.status(400).json({
          success: false,
          error: '이미 리뷰를 작성하셨습니다.',
        });
      }

      // 완료된 예약인지 확인
      if (booking.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: '완료된 예약만 리뷰를 작성할 수 있습니다.',
        });
      }

      const driverId = booking.outboundTrip?.driverId;
      if (!driverId) {
        return res.status(400).json({
          success: false,
          error: '기사 정보를 찾을 수 없습니다.',
        });
      }

      // 리뷰 생성
      const review = await prisma.review.create({
        data: {
          bookingId,
          driverId,
          customerId: booking.customerId,
          rating,
          comment: comment || null,
        },
      });

      // 기사 평점 업데이트
      await this.updateDriverRating(driverId);

      res.json({
        success: true,
        data: review,
        message: '리뷰가 등록되었습니다.',
      });
    } catch (error) {
      console.error('리뷰 생성 실패:', error);
      res.status(500).json({
        success: false,
        error: '리뷰 등록 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 기사 리뷰 목록 조회
   */
  async getDriverReviews(req: Request, res: Response) {
    try {
      const { driverId } = req.params;

      const reviews = await prisma.review.findMany({
        where: { driverId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '리뷰 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 예약에 대한 리뷰 조회
   */
  async getBookingReview(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;

      const review = await prisma.review.findUnique({
        where: { bookingId },
      });

      res.json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '리뷰 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 기사 평균 평점 업데이트
   */
  private async updateDriverRating(driverId: string) {
    const reviews = await prisma.review.findMany({
      where: { driverId },
      select: { rating: true },
    });

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.user.update({
      where: { id: driverId },
      data: {
        rating: Math.round(avgRating * 10) / 10, // 소수점 1자리
        totalTrips: { increment: 1 },
      },
    });
  }
}

export const reviewController = new ReviewController();
