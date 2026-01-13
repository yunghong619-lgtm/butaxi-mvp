import { config } from '../config';

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  paidAt: Date;
  isMock: boolean;
  message?: string;
}

export class PaymentService {
  /**
   * 결제 처리 (MVP: Mock 결제)
   */
  async processPayment(amount: number, bookingId: string): Promise<PaymentResult> {
    if (config.payment.useReal) {
      // TODO: 실제 PG 연동 (토스페이먼츠 등)
      throw new Error('실제 결제는 아직 구현되지 않았습니다.');
    }

    // Mock 결제 시뮬레이션
    console.log(`💳 Mock 결제 처리 중...`);
    console.log(`   금액: ${amount.toLocaleString()}원`);
    console.log(`   예약 ID: ${bookingId}`);

    // 2초 대기 (실제 결제 처리 시뮬레이션)
    await this.delay(2000);

    const transactionId = `MOCK_${Date.now()}_${bookingId}`;

    console.log(`✅ Mock 결제 완료! 거래 ID: ${transactionId}`);

    return {
      success: true,
      transactionId,
      amount,
      paidAt: new Date(),
      isMock: true,
      message: 'Mock 결제가 완료되었습니다.',
    };
  }

  /**
   * 환불 처리 (MVP: Mock 환불)
   */
  async refund(transactionId: string, amount: number, reason?: string): Promise<PaymentResult> {
    if (config.payment.useReal) {
      throw new Error('실제 환불은 아직 구현되지 않았습니다.');
    }

    console.log(`💰 Mock 환불 처리 중...`);
    console.log(`   거래 ID: ${transactionId}`);
    console.log(`   금액: ${amount.toLocaleString()}원`);
    console.log(`   사유: ${reason || '고객 요청'}`);

    await this.delay(1000);

    const refundTransactionId = `REFUND_${Date.now()}_${transactionId}`;

    console.log(`✅ Mock 환불 완료!`);

    return {
      success: true,
      transactionId: refundTransactionId,
      amount,
      paidAt: new Date(),
      isMock: true,
      message: 'Mock 환불이 완료되었습니다.',
    };
  }

  /**
   * 취소 수수료 계산
   */
  calculateCancellationFee(
    totalPrice: number,
    pickupTime: Date,
    cancelTime: Date = new Date()
  ): number {
    const hoursUntilPickup = (pickupTime.getTime() - cancelTime.getTime()) / (1000 * 60 * 60);

    if (hoursUntilPickup > 6) {
      // 6시간 전: 10%
      return totalPrice * 0.1;
    } else if (hoursUntilPickup > 2) {
      // 2시간 전: 30%
      return totalPrice * 0.3;
    } else if (hoursUntilPickup > 0.5) {
      // 30분 전: 50%
      return totalPrice * 0.5;
    } else {
      // 30분 이내 / 노쇼: 100%
      return totalPrice;
    }
  }

  /**
   * 거리 기반 요금 계산 (MVP 간소화 버전)
   */
  calculatePrice(distanceKm: number, passengerCount: number = 1): number {
    // 기본 요금: 5,000원
    const basePrice = 5000;

    // 거리당 요금: km당 800원
    const distancePrice = distanceKm * 800;

    // 인원당 추가: 1인당 2,000원 (첫 번째 인원 제외)
    const passengerPrice = (passengerCount - 1) * 2000;

    const totalPrice = basePrice + distancePrice + passengerPrice;

    // 100원 단위 절사
    return Math.floor(totalPrice / 100) * 100;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const paymentService = new PaymentService();
