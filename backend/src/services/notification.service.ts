import { emailService } from './email.service';
import { smsService } from './sms.service';
import type { CustomerSchedule } from '../../../shared/types';

export class NotificationService {
  /**
   * 제안 도착 알림 (이메일 + SMS)
   */
  async sendProposalNotification(
    customerEmail: string,
    customerPhone: string,
    customerName: string,
    proposalId: string,
    schedule: CustomerSchedule,
    price: number
  ): Promise<void> {
    console.log(`📢 알림 발송 시작: ${customerName}`);

    // 이메일 발송 (상세 정보)
    const emailSent = await emailService.sendProposalNotification(
      customerEmail,
      customerName,
      proposalId,
      schedule,
      price
    );

    // SMS 발송 (간단 알림)
    const pickupTime = new Date(schedule.pickupTime).toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const smsSent = await smsService.sendProposalNotification(
      customerPhone,
      customerName,
      pickupTime,
      price
    );

    if (emailSent || smsSent) {
      console.log(`✅ 알림 발송 완료: ${customerName} (이메일: ${emailSent}, SMS: ${smsSent})`);
    } else {
      console.log(`⚠️  알림 발송 실패: ${customerName}`);
    }
  }

  /**
   * 예약 확정 알림 (이메일 + SMS)
   */
  async sendBookingConfirmation(
    customerEmail: string,
    customerPhone: string,
    customerName: string,
    bookingId: string,
    schedule: CustomerSchedule
  ): Promise<void> {
    console.log(`📢 예약 확정 알림 발송: ${customerName}`);

    // 이메일
    await emailService.sendBookingConfirmation(
      customerEmail,
      customerName,
      bookingId,
      schedule
    );

    // SMS
    const pickupTime = new Date(schedule.pickupTime).toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await smsService.sendBookingConfirmation(
      customerPhone,
      customerName,
      pickupTime
    );

    console.log(`✅ 예약 확정 알림 완료: ${customerName}`);
  }

  /**
   * 픽업 임박 알림 (이메일 + SMS)
   */
  async sendPickupReminder(
    customerEmail: string,
    customerPhone: string,
    customerName: string,
    pickupTime: Date,
    pickupAddress: string
  ): Promise<void> {
    console.log(`📢 픽업 임박 알림 발송: ${customerName}`);

    // 이메일
    await emailService.sendPickupReminder(
      customerEmail,
      customerName,
      pickupTime,
      pickupAddress
    );

    // SMS
    const timeStr = pickupTime.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await smsService.sendPickupReminder(
      customerPhone,
      customerName,
      timeStr,
      pickupAddress
    );

    console.log(`✅ 픽업 임박 알림 완료: ${customerName}`);
  }
}

export const notificationService = new NotificationService();
