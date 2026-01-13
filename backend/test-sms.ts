import dotenv from 'dotenv';
import path from 'path';

// .env 파일 로드 (명시적 경로 지정)
dotenv.config({ path: path.join(__dirname, '.env') });

// 환경변수 확인
console.log('🔍 환경변수 확인:');
console.log('API_KEY:', process.env.SOLAPI_API_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('API_SECRET:', process.env.SOLAPI_API_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('FROM:', process.env.SOLAPI_FROM || '❌ 없음');
console.log('');

import { smsService } from './src/services/sms.service';

async function testSMS() {
  console.log('\n🧪 SMS 테스트 시작...\n');

  // 테스트할 번호 (본인 번호로 변경하세요)
  const testPhoneNumber = '010-4922-0573'; // 발신번호와 동일한 번호로 테스트

  console.log(`📱 테스트 대상: ${testPhoneNumber}`);
  console.log('📤 SMS 발송 중...\n');

  const result = await smsService.sendSMS(
    testPhoneNumber,
    '[RETURN] 테스트 메시지입니다! SMS 연동이 정상적으로 작동합니다. 🚖'
  );

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (result) {
    console.log('✅ SMS 테스트 성공!');
    console.log('📱 휴대폰을 확인해보세요!');
  } else {
    console.log('❌ SMS 테스트 실패!');
    console.log('⚠️  API 키 설정을 확인해주세요.');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testSMS()
  .then(() => {
    console.log('테스트 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('테스트 실패:', error);
    process.exit(1);
  });
