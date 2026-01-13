import dotenv from 'dotenv';
import coolsms from 'coolsms-node-sdk';

// .env 파일 로드
dotenv.config();

async function testSMSDirect() {
  console.log('\n🧪 SMS 직접 테스트 시작...\n');

  const API_KEY = process.env.SOLAPI_API_KEY;
  const API_SECRET = process.env.SOLAPI_API_SECRET;
  const FROM = process.env.SOLAPI_FROM;

  console.log('🔍 환경변수 확인:');
  console.log('API_KEY:', API_KEY ? `✅ ${API_KEY}` : '❌ 없음');
  console.log('API_SECRET:', API_SECRET ? `✅ ${API_SECRET.substring(0, 10)}...` : '❌ 없음');
  console.log('FROM:', FROM || '❌ 없음');
  console.log('');

  if (!API_KEY || !API_SECRET || !FROM) {
    console.error('❌ 환경변수가 설정되지 않았습니다!');
    console.log('\n.env 파일을 확인해주세요:');
    console.log('SOLAPI_API_KEY=...');
    console.log('SOLAPI_API_SECRET=...');
    console.log('SOLAPI_FROM=...');
    return;
  }

  try {
    console.log('📡 SOLAPI 서비스 초기화 중...');
    const messageService = new coolsms(API_KEY, API_SECRET);
    console.log('✅ 초기화 완료!\n');

    const testNumber = FROM; // 발신번호로 테스트
    const message = '[RETURN] 테스트 메시지입니다! SMS 연동이 정상적으로 작동합니다. 🚖';

    console.log(`📱 테스트 대상: ${testNumber}`);
    console.log(`📤 메시지: ${message}`);
    console.log('\n발송 중...\n');

    const result = await messageService.sendOne({
      to: testNumber.replace(/-/g, ''),
      from: FROM.replace(/-/g, ''),
      text: message,
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SMS 발송 성공!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 결과:');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Status Code: ${result.statusCode}`);
    console.log(`   Status Message: ${result.statusMessage || 'OK'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📱 휴대폰을 확인해보세요!');
    console.log('💰 SOLAPI 대시보드에서 잔액 및 발송 내역을 확인할 수 있습니다.');
    console.log('   → https://solapi.com\n');

  } catch (error: any) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ SMS 발송 실패!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('오류:', error.message || error);
    
    if (error.response) {
      console.error('응답:', error.response.data);
    }
    
    console.log('\n💡 확인사항:');
    console.log('   1. API Key가 올바른지 확인');
    console.log('   2. SOLAPI 잔액이 충분한지 확인');
    console.log('   3. 발신번호가 인증되었는지 확인');
    console.log('   → https://solapi.com\n');
  }
}

testSMSDirect()
  .then(() => {
    console.log('테스트 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('테스트 실패:', error);
    process.exit(1);
  });
