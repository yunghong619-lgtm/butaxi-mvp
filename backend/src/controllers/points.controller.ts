import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 운행 완료 시 적립 포인트 (결제 금액의 3%)
const RIDE_REWARD_PERCENT = 0.03;

export class PointsController {
  /**
   * 포인트 잔액 및 내역 조회
   */
  async getPointsBalance(req: Request, res: Response) {
    try {
      const { customerId } = req.params;

      let user = await prisma.user.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          name: true,
          points: true,
        },
      });

      // 사용자가 없으면 자동 생성 (신규 고객)
      if (!user) {
        const newUser = await prisma.user.create({
          data: {
            id: customerId,
            email: `${customerId}@butaxi.com`,
            phone: '010-0000-0000',
            name: '고객',
            role: 'CUSTOMER',
            points: 1000, // 신규 가입 보너스
          },
        });

        // 신규 가입 보너스 포인트 내역 생성
        await prisma.pointHistory.create({
          data: {
            userId: customerId,
            amount: 1000,
            type: 'REFERRAL_BONUS',
            description: '신규 가입 보너스',
          },
        });

        user = {
          id: newUser.id,
          name: newUser.name,
          points: newUser.points,
        };
      }

      // 포인트 내역 조회 (최근 20건)
      const history = await prisma.pointHistory.findMany({
        where: { userId: customerId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      res.json({
        success: true,
        data: {
          balance: user.points,
          history,
        },
      });
    } catch (error) {
      console.error('포인트 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '포인트 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 포인트 사용 (결제 시)
   */
  async usePoints(req: Request, res: Response) {
    try {
      const { customerId, amount, bookingId } = req.body;

      if (!customerId || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: '유효하지 않은 요청입니다.',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.',
        });
      }

      if (user.points < amount) {
        return res.status(400).json({
          success: false,
          error: '포인트가 부족합니다.',
        });
      }

      // 트랜잭션으로 포인트 차감 및 내역 생성
      await prisma.$transaction([
        prisma.user.update({
          where: { id: customerId },
          data: {
            points: { decrement: amount },
          },
        }),
        prisma.pointHistory.create({
          data: {
            userId: customerId,
            amount: -amount,
            type: 'USED',
            description: '운행 요금 결제',
            bookingId,
          },
        }),
      ]);

      const updatedUser = await prisma.user.findUnique({
        where: { id: customerId },
        select: { points: true },
      });

      res.json({
        success: true,
        message: `${amount.toLocaleString()}P가 사용되었습니다.`,
        data: {
          usedAmount: amount,
          remainingBalance: updatedUser?.points || 0,
        },
      });
    } catch (error) {
      console.error('포인트 사용 실패:', error);
      res.status(500).json({
        success: false,
        error: '포인트 사용 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 운행 완료 시 포인트 적립
   */
  async earnRideReward(req: Request, res: Response) {
    try {
      const { customerId, bookingId, paidAmount } = req.body;

      if (!customerId || !paidAmount || paidAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: '유효하지 않은 요청입니다.',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.',
        });
      }

      // 결제 금액의 3% 적립 (최소 100P)
      const earnedPoints = Math.max(100, Math.floor(paidAmount * RIDE_REWARD_PERCENT));

      await prisma.$transaction([
        prisma.user.update({
          where: { id: customerId },
          data: {
            points: { increment: earnedPoints },
          },
        }),
        prisma.pointHistory.create({
          data: {
            userId: customerId,
            amount: earnedPoints,
            type: 'RIDE_REWARD',
            description: `운행 이용 적립 (${paidAmount.toLocaleString()}원의 3%)`,
            bookingId,
          },
        }),
      ]);

      const updatedUser = await prisma.user.findUnique({
        where: { id: customerId },
        select: { points: true },
      });

      res.json({
        success: true,
        message: `${earnedPoints.toLocaleString()}P가 적립되었습니다!`,
        data: {
          earnedPoints,
          newBalance: updatedUser?.points || 0,
        },
      });
    } catch (error) {
      console.error('포인트 적립 실패:', error);
      res.status(500).json({
        success: false,
        error: '포인트 적립 중 오류가 발생했습니다.',
      });
    }
  }
}

export const pointsController = new PointsController();
