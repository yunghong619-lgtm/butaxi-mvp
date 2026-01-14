import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { proposalService } from '../services/proposal.service';

const prisma = new PrismaClient();

export class ProposalController {
  /**
   * 고객의 Proposal 목록 조회
   */
  async getCustomerProposals(req: Request, res: Response) {
    try {
      const { customerId } = req.params;

      console.log(`📋 Proposal 조회 요청: customerId=${customerId}`);

      const proposals = await prisma.proposal.findMany({
        where: {
          request: {
            customerId,
          },
          status: 'ACTIVE', // ACTIVE 상태만 조회 (만료된 것 제외)
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
                  email: true,
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
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`✅ Proposal ${proposals.length}개 조회됨`);
      
      // 만료 체크 (추가 필터링)
      const now = new Date();
      const validProposals = proposals.filter(p => new Date(p.expiresAt) > now);

      if (validProposals.length < proposals.length) {
        console.log(`⚠️ 만료된 Proposal ${proposals.length - validProposals.length}개 제외`);
      }

      res.json({
        success: true,
        data: validProposals,
        count: validProposals.length,
      });
    } catch (error) {
      console.error('❌ Proposal 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Proposal 상세 조회
   */
  async getProposalDetail(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;

      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          request: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          outboundTrip: {
            include: {
              vehicle: true,
              driver: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
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
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!proposal) {
        return res.status(404).json({
          success: false,
          error: 'Proposal을 찾을 수 없습니다.',
        });
      }

      res.json({
        success: true,
        data: proposal,
      });
    } catch (error) {
      console.error('Proposal 상세 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Proposal 수락
   */
  async acceptProposal(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;

      const bookingId = await proposalService.acceptProposal(proposalId);

      res.json({
        success: true,
        data: { bookingId },
        message: '예약이 확정되었습니다!',
      });
    } catch (error: any) {
      console.error('Proposal 수락 실패:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Proposal 수락 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Proposal 거부
   */
  async rejectProposal(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;

      const proposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'REJECTED' },
      });

      // Request 상태를 다시 REQUESTED로 변경 (재매칭 가능하도록)
      await prisma.rideRequest.update({
        where: { id: proposal.requestId },
        data: { status: 'REQUESTED' },
      });

      res.json({
        success: true,
        data: proposal,
        message: 'Proposal이 거부되었습니다. 다른 제안을 찾아보겠습니다.',
      });
    } catch (error) {
      console.error('Proposal 거부 실패:', error);
      res.status(500).json({
        success: false,
        error: '거부 처리 중 오류가 발생했습니다.',
      });
    }
  }
}

export const proposalController = new ProposalController();
