import coolsms from 'coolsms-node-sdk';

export class SMSService {
  private messageService: any | null = null;
  private from: string;

  constructor() {
    this.from = '';
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.SOLAPI_API_KEY;
    const apiSecret = process.env.SOLAPI_API_SECRET;
    this.from = process.env.SOLAPI_FROM || '';

    if (apiKey && apiSecret) {
      try {
        this.messageService = new coolsms(apiKey, apiSecret);
        console.log('✅ SOLAPI SMS 서비스 초기화 완료');
        console.log(`   발신번호: ${this.from}`);
      } catch (error) {
        console.error('❌ SOLAPI 초기화 실패:', error);
      }
    } else {
      console.warn('⚠️  SOLAPI API 키가 설정되지 않았습니다. SMS 발송이 비활성화됩니다.');
    }
  }

  /**
   * SMS 발송
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.messageService) {
      console.log('📱 SMS 미설정 - 콘솔 출력:', { to, message });
      return false;
    }

    try {
      // 하이픈 제거 및 국가 코드 처리
      const phoneNumber = to.replace(/-/g, '');

      const result = await this.messageService.sendOne({
        to: phoneNumber,
        from: this.from,
        text: message,
      });

      console.log('✅ SMS 발송 성공:', {
        to: phoneNumber,
        messageId: result.messageId,
        statusCode: result.statusCode,
      });

      return true;
    } catch (error: any) {
      console.error('❌ SMS 발송 실패:', error.message || error);
      return false;
    }
  }

  /**
   * 제안 도착 알림
   */
  async sendProposalNotification(
    phone: string,
    customerName: string,
    pickupTime: string,
    price: number
  ): Promise<boolean> {
    const message = `[RETURN] ${customerName}님, 새로운 운행 제안이 도착했습니다!
픽업시간: ${pickupTime}
예상요금: ${price.toLocaleString()}원
15분 내 수락해주세요!`;

    return this.sendSMS(phone, message);
  }

  /**
   * 예약 확정 알림
   */
  async sendBookingConfirmation(
    phone: string,
    customerName: string,
    pickupTime: string
  ): Promise<boolean> {
    const message = `[RETURN] ${customerName}님, 예약이 확정되었습니다!
픽업시간: ${pickupTime}
30분 전 다시 알려드리겠습니다.`;

    return this.sendSMS(phone, message);
  }

  /**
   * 픽업 임박 알림
   */
  async sendPickupReminder(
    phone: string,
    customerName: string,
    pickupTime: string,
    pickupAddress: string
  ): Promise<boolean> {
    const message = `[RETURN] ${customerName}님, 곧 픽업 예정입니다!
시간: ${pickupTime}
장소: ${pickupAddress}
준비해주세요!`;

    return this.sendSMS(phone, message);
  }
}

export const smsService = new SMSService();
