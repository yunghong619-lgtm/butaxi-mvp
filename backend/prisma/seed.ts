import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 시작...\n');

  // 기존 데이터 삭제
  await prisma.transaction.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.rideRequest.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // 1. 사용자 생성
  console.log('👤 사용자 생성 중...');
  
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@test.com',
      name: '김철수',
      phone: '010-1234-5678',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@test.com',
      name: '이영희',
      phone: '010-2345-6789',
      role: 'CUSTOMER',
    },
  });

  const driver = await prisma.user.create({
    data: {
      email: 'driver@test.com',
      name: '박기사',
      phone: '010-9999-0000',
      role: 'DRIVER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@return.com',
      name: '관리자',
      phone: '010-0000-0000',
      role: 'ADMIN',
    },
  });

  console.log('✅ 사용자 4명 생성 완료\n');

  // 2. 차량 생성
  console.log('🚐 차량 생성 중...');

  const vehicle = await prisma.vehicle.create({
    data: {
      name: '스타리아 1호',
      licensePlate: '12가3456',
      capacity: 7,
      isActive: true,
    },
  });

  console.log('✅ 차량 1대 생성 완료\n');

  // 3. 테스트 예약 요청 생성
  console.log('📋 예약 요청 생성 중...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const returnTime = new Date(tomorrow);
  returnTime.setHours(18, 0, 0, 0);

  const request1 = await prisma.rideRequest.create({
    data: {
      customerId: customer1.id,
      pickupAddress: '서울특별시 강남구 역삼동 123',
      pickupLat: 37.5012767241426,
      pickupLng: 127.03959110814313,
      desiredPickupTime: tomorrow,
      dropoffAddress: '서울특별시 서초구 서초동 456',
      dropoffLat: 37.4954071,
      dropoffLng: 127.0266136,
      returnAddress: '서울특별시 서초구 서초동 456',
      returnLat: 37.4954071,
      returnLng: 127.0266136,
      desiredReturnTime: returnTime,
      homeAddress: '서울특별시 강남구 역삼동 123',
      homeLat: 37.5012767241426,
      homeLng: 127.03959110814313,
      passengerCount: 1,
      status: 'REQUESTED',
    },
  });

  const request2 = await prisma.rideRequest.create({
    data: {
      customerId: customer2.id,
      pickupAddress: '서울특별시 강남구 삼성동 789',
      pickupLat: 37.5085,
      pickupLng: 127.0633,
      desiredPickupTime: tomorrow,
      dropoffAddress: '서울특별시 서초구 양재동 101',
      dropoffLat: 37.4844,
      dropoffLng: 127.0343,
      returnAddress: '서울특별시 서초구 양재동 101',
      returnLat: 37.4844,
      returnLng: 127.0343,
      desiredReturnTime: returnTime,
      homeAddress: '서울특별시 강남구 삼성동 789',
      homeLat: 37.5085,
      homeLng: 127.0633,
      passengerCount: 1,
      status: 'REQUESTED',
    },
  });

  console.log('✅ 예약 요청 2개 생성 완료\n');

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║          시드 데이터 생성 완료!          ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  console.log('📌 테스트 계정:');
  console.log(`   고객 1: ${customer1.email} (${customer1.name})`);
  console.log(`   고객 2: ${customer2.email} (${customer2.name})`);
  console.log(`   기사: ${driver.email} (${driver.name})`);
  console.log(`   관리자: ${admin.email} (${admin.name})\n`);

  console.log('🚖 차량:');
  console.log(`   ${vehicle.name} (${vehicle.licensePlate}) - 정원 ${vehicle.capacity}명\n`);

  console.log('📋 예약 요청:');
  console.log(`   Request 1: ${request1.id} (${customer1.name})`);
  console.log(`   Request 2: ${request2.id} (${customer2.name})\n`);

  console.log('💡 다음 단계:');
  console.log('   1. 서버 실행: npm run dev');
  console.log('   2. 매칭 테스트를 위해 10분 대기 (또는 수동 매칭 API 호출)');
  console.log('   3. 프론트엔드에서 테스트 계정으로 로그인\n');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
