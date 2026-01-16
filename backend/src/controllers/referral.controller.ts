import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 추천인 포인트 보상
const REFERRAL_POINTS = 3000;
const REFERRED_POINTS = 2000;

export class ReferralController {
  /**
   * 내 초대 코드 조회 (없으면 생성)
   */
  async getMyReferralCode(req: Request, res: Response) {
    try {
      const { customerId } = req.params;

      let user = await prisma.user.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          name: true,
          referralCode: true,
          points: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.',
        });
      }

      // 초대 코드가 없으면 생성
      if (!user.referralCode) {
        const referralCode = this.generateReferralCode(user.name);
        user = await prisma.user.update({
          where: { id: customerId },
          data: { referralCode },
          select: {
            id: true,
            name: true,
            referralCode: true,
            points: true,
          },
        });
      }

      // 내가 초대한 친구 수
      const referredCount = await prisma.user.count({
        where: { referredBy: customerId },
      });

      res.json({
        success: true,
        data: {
          referralCode: user.referralCode,
          points: user.points,
          referredCount,
          rewards: {
            referrer: REFERRAL_POINTS,
            referred: REFERRED_POINTS,
          },
        },
      });
    } catch (error) {
      console.error('초대 코드 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '초대 코드 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 초대 코드 적용 (친구 등록 시)
   */
  async applyReferralCode(req: Request, res: Response) {
    try {
      const { customerId, referralCode } = req.body;

      if (!customerId || !referralCode) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID와 초대 코드가 필요합니다.',
        });
      }

      // 초대 코드 소유자 찾기
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        return res.status(404).json({
          success: false,
          error: '유효하지 않은 초대 코드입니다.',
        });
      }

      // 자기 자신의 코드인지 확인
      if (referrer.id === customerId) {
        return res.status(400).json({
          success: false,
          error: '자신의 초대 코드는 사용할 수 없습니다.',
        });
      }

      // 현재 사용자 정보
      const user = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.',
        });
      }

      // 이미 초대 코드를 적용했는지 확인
      if (user.referredBy) {
        return res.status(400).json({
          success: false,
          error: '이미 초대 코드를 적용하셨습니다.',
        });
      }

      // 트랜잭션으로 포인트 지급
      await prisma.$transaction([
        // 피추천인 업데이트
        prisma.user.update({
          where: { id: customerId },
          data: {
            referredBy: referrer.id,
            points: { increment: REFERRED_POINTS },
          },
        }),
        // 추천인 포인트 지급
        prisma.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: REFERRAL_POINTS },
          },
        }),
      ]);

      res.json({
        success: true,
        message: `초대 코드가 적용되었습니다! ${REFERRED_POINTS.toLocaleString()}P가 지급되었습니다.`,
        data: {
          referrerName: referrer.name,
          pointsReceived: REFERRED_POINTS,
        },
      });
    } catch (error) {
      console.error('초대 코드 적용 실패:', error);
      res.status(500).json({
        success: false,
        error: '초대 코드 적용 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 초대 코드 생성
   */
  private generateReferralCode(name: string): string {
    const prefix = name.slice(0, 2).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${random}`;
  }
}

export const referralController = new ReferralController();
