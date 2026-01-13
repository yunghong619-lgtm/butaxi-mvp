import nodemailer from 'nodemailer';
import { config } from '../config';
import type { CustomerSchedule } from '../../../shared/types';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
      console.log('✅ 이메일 서비스 초기화 완료');
    } else {
      console.warn('⚠️  이메일 설정이 없습니다. 콘솔에만 출력됩니다.');
    }
  }

  /**
   * 제안 도착 알림
   */
  async sendProposalNotification(
    customerEmail: string,
    customerName: string,
    proposalId: string,
    schedule: CustomerSchedule,
    price: number
  ): Promise<boolean> {
    const subject = '[RETURN] 🚖 새로운 운행 제안이 도착했습니다!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">안녕하세요, ${customerName}님!</h2>
        <p>요청하신 운행에 대한 제안이 도착했습니다.</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📅 운행 일정</h3>
          <p><strong>가는 편:</strong></p>
          <ul>
            <li>픽업: ${new Date(schedule.pickupTime).toLocaleString('ko-KR')}</li>
            <li>도착: ${new Date(schedule.dropoffTime).toLocaleString('ko-KR')}</li>
          </ul>
          
          <p><strong>귀가 편:</strong></p>
          <ul>
            <li>픽업: ${new Date(schedule.returnPickupTime).toLocaleString('ko-KR')}</li>
            <li>도착: ${new Date(schedule.returnDropoffTime).toLocaleString('ko-KR')}</li>
          </ul>
          
          <p style="font-size: 24px; color: #4F46E5; margin: 10px 0;">
            <strong>예상 요금: ${price.toLocaleString()}원</strong>
          </p>
        </div>
        
        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
          <p style="margin: 0;"><strong>⏰ 15분 내에 수락해주세요!</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            시간이 지나면 제안이 자동으로 만료됩니다.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontend.url}/proposal/${proposalId}" 
             style="background: #4F46E5; color: white; padding: 15px 40px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            제안 확인하기
          </a>
        </div>
        
        <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
          RETURN - 함께 가는 즐거운 여정
        </p>
      </div>
    `;

    return this.sendEmail(customerEmail, subject, html);
  }

  /**
   * 예약 확정 알림
   */
  async sendBookingConfirmation(
    customerEmail: string,
    customerName: string,
    bookingId: string,
    schedule: CustomerSchedule
  ): Promise<boolean> {
    const subject = '[RETURN] ✅ 예약이 확정되었습니다!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">예약 확정 완료!</h2>
        <p>안녕하세요, ${customerName}님! 예약이 성공적으로 확정되었습니다.</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>예약 번호:</strong> ${bookingId}</p>
          <p><strong>픽업 시간:</strong> ${new Date(schedule.pickupTime).toLocaleString('ko-KR')}</p>
        </div>
        
        <p>운행 30분 전에 다시 알림을 드리겠습니다.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontend.url}/booking/${bookingId}" 
             style="background: #10B981; color: white; padding: 15px 40px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            예약 상세보기
          </a>
        </div>
      </div>
    `;

    return this.sendEmail(customerEmail, subject, html);
  }

  /**
   * 픽업 임박 알림
   */
  async sendPickupReminder(
    customerEmail: string,
    customerName: string,
    pickupTime: Date,
    pickupAddress: string
  ): Promise<boolean> {
    const subject = '[RETURN] 🚗 곧 픽업 예정입니다!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">픽업 30분 전 알림</h2>
        <p>안녕하세요, ${customerName}님!</p>
        <p>곧 픽업 시간입니다. 미리 준비해주세요.</p>
        
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>픽업 시간:</strong> ${pickupTime.toLocaleString('ko-KR')}</p>
          <p><strong>픽업 장소:</strong> ${pickupAddress}</p>
        </div>
        
        <p>기사님이 도착하면 다시 알려드리겠습니다.</p>
      </div>
    `;

    return this.sendEmail(customerEmail, subject, html);
  }

  /**
   * 실제 이메일 발송 (또는 콘솔 출력)
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"RETURN" <${config.email.user}>`,
          to,
          subject,
          html,
        });
        console.log(`✅ 이메일 발송 완료: ${to} - ${subject}`);
        return true;
      } catch (error) {
        console.error('❌ 이메일 발송 실패:', error);
        return false;
      }
    } else {
      // 이메일 설정 없을 때 콘솔 출력
      console.log('\n========== [이메일 미리보기] ==========');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('---');
      console.log(html.replace(/<[^>]*>/g, '')); // HTML 태그 제거
      console.log('=======================================\n');
      return true;
    }
  }
}

export const emailService = new EmailService();
