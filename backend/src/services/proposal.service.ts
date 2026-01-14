import { PrismaClient } from '@prisma/client';
import { addMinutes } from 'date-fns';
import { config } from '../config';
import { notificationService } from './notification.service';
import { paymentService } from './payment.service';

const prisma = new PrismaClient();

export class ProposalService {
  /**
   * ⚠️ 참고: 실제 Proposal 생성은 matching.service.ts에서 처리됩니다.
   * 이 서비스는 Proposal 관리 기능(수락, 만료 정리 등)만 담당합니다.
   */

  /**
   * Proposal 수락 처리
   */
  async acceptProposal(proposalId: string): Promise<string> {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        request: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new Error('Proposal을 찾을 수 없습니다.');
    }

    if (proposal.status !== 'ACTIVE') {
      throw new Error('이미 처리된 Proposal입니다.');
    }

    if (new Date() > proposal.expiresAt) {
      throw new Error('만료된 Proposal입니다.');
    }

    // Proposal 수락
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'ACCEPTED' },
    });

    // Booking 생성
    const booking = await prisma.booking.create({
      data: {
        requestId: proposal.requestId,
        customerId: proposal.request.customerId,
        outboundTripId: proposal.outboundTripId,
        returnTripId: proposal.returnTripId,
        status: 'CONFIRMED',
        totalPrice: proposal.estimatedPrice,
        paymentStatus: 'PENDING',
      },
    });

    // Mock 결제 처리
    const paymentResult = await paymentService.processPayment(proposal.estimatedPrice, booking.id);

    if (paymentResult.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paidAmount: proposal.estimatedPrice,
          paymentStatus: 'PAID',
          transactionId: paymentResult.transactionId,
        },
      });

      // 거래 내역 저장
      await prisma.transaction.create({
        data: {
          bookingId: booking.id,
          amount: proposal.estimatedPrice,
          type: 'PAYMENT',
          status: 'COMPLETED',
          isMock: paymentResult.isMock,
          mockReference: paymentResult.transactionId,
        },
      });
    }

    // Request 상태 업데이트
    await prisma.rideRequest.update({
      where: { id: proposal.requestId },
      data: { status: 'CONFIRMED' },
    });

    // 확정 알림 발송 (이메일 + SMS)
    await notificationService.sendBookingConfirmation(
      proposal.request.customer.email,
      proposal.request.customer.phone,
      proposal.request.customer.name,
      booking.id,
      {
        pickupTime: proposal.pickupTime,
        dropoffTime: proposal.dropoffTime,
        returnPickupTime: proposal.returnPickupTime,
        returnDropoffTime: proposal.returnDropoffTime,
      }
    );

    console.log(`✅ Booking 확정: ${booking.id}`);

    return booking.id;
  }

  /**
   * 만료된 Proposal 정리
   */
  async cleanupExpiredProposals(): Promise<number> {
    const result = await prisma.proposal.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    if (result.count > 0) {
      console.log(`🧹 만료된 Proposal ${result.count}개 정리`);
    }

    return result.count;
  }
}

export const proposalService = new ProposalService();
