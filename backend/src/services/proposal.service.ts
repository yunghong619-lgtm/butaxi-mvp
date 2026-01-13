import { PrismaClient } from '@prisma/client';
import { addMinutes } from 'date-fns';
import { config } from '../config';
import { notificationService } from './notification.service';
import { paymentService } from './payment.service';

const prisma = new PrismaClient();

export class ProposalService {
  /**
   * Trip 기반으로 Proposal 생성
   */
  async createProposalsForTrip(tripId: string): Promise<string[]> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip을 찾을 수 없습니다.');
    }

    const proposalIds: string[] = [];

    // 각 고객별로 Proposal 생성
    const customerIds = new Set(trip.stops.map((s) => s.customerId).filter(Boolean));

    for (const customerId of customerIds) {
      if (!customerId) continue;

      try {
        const proposal = await this.generateProposal(customerId, trip.id, trip.direction);
        proposalIds.push(proposal.id);

        // 고객에게 알림 발송 (이메일 + SMS)
        const customer = await prisma.user.findUnique({ where: { id: customerId } });
        const request = await prisma.rideRequest.findFirst({
          where: { customerId, status: 'REQUESTED' },
        });

        if (customer && request) {
          await notificationService.sendProposalNotification(
            customer.email,
            customer.phone,
            customer.name,
            proposal.id,
            {
              pickupTime: proposal.pickupTime,
              dropoffTime: proposal.dropoffTime,
              returnPickupTime: proposal.returnPickupTime,
              returnDropoffTime: proposal.returnDropoffTime,
            },
            proposal.estimatedPrice
          );

          // Request 상태 업데이트
          await prisma.rideRequest.update({
            where: { id: request.id },
            data: { status: 'PROPOSED' },
          });
        }
      } catch (error) {
        console.error(`Proposal 생성 실패 (고객 ${customerId}):`, error);
      }
    }

    return proposalIds;
  }

  /**
   * 개별 Proposal 생성
   */
  private async generateProposal(customerId: string, tripId: string, direction: string) {
    // 해당 고객의 Stop 정보 가져오기
    const pickupStop = await prisma.stop.findFirst({
      where: {
        tripId,
        customerId,
        stopType: 'PICKUP',
      },
    });

    const dropoffStop = await prisma.stop.findFirst({
      where: {
        tripId,
        customerId,
        stopType: 'DROPOFF',
      },
    });

    if (!pickupStop || !dropoffStop) {
      throw new Error('Stop 정보를 찾을 수 없습니다.');
    }

    // 요금 계산 (거리 기반)
    const distance = 10; // TODO: 실제 거리 계산
    const price = paymentService.calculatePrice(distance, 1);

    // Proposal 생성
    const proposal = await prisma.proposal.create({
      data: {
        requestId: customerId, // TODO: 실제 RideRequest ID 사용
        status: 'ACTIVE',
        outboundTripId: direction === 'OUTBOUND' ? tripId : null,
        returnTripId: direction === 'RETURN' ? tripId : null,
        pickupTime: pickupStop.scheduledTime,
        dropoffTime: dropoffStop.scheduledTime,
        returnPickupTime: pickupStop.scheduledTime, // TODO: 실제 귀가편 시간
        returnDropoffTime: dropoffStop.scheduledTime,
        estimatedPrice: price,
        expiresAt: addMinutes(new Date(), config.policy.proposalExpiryMinutes),
      },
    });

    console.log(`✅ Proposal 생성: ${proposal.id} (고객: ${customerId})`);

    return proposal;
  }

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
