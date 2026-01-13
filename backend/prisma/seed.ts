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

  const customer3 = await prisma.user.create({
    data: {
      email: 'customer3@test.com',
      name: '박민수',
      phone: '010-3456-7890',
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
      email: 'admin@butaxi.com',
      name: '관리자',
      phone: '010-0000-0000',
      role: 'ADMIN',
    },
  });

  console.log('✅ 사용자 5명 생성 완료\n');

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

  // 3. 데모용 완성된 Trip 생성 (운행 중)
  console.log('🗺️  데모 Trip 생성 중...');

  const now = new Date();
  const tripStart = new Date(now);
  tripStart.setMinutes(now.getMinutes() - 10); // 10분 전 시작
  const tripEnd = new Date(now);
  tripEnd.setMinutes(now.getMinutes() + 30); // 30분 후 종료 예정

  const demoTrip = await prisma.trip.create({
    data: {
      vehicleId: vehicle.id,
      driverId: driver.id,
      direction: 'OUTBOUND',
      status: 'IN_PROGRESS',
      startTime: tripStart,
      endTime: tripEnd,
      totalDistance: 15.5,
      estimatedDuration: 40,
      currentLat: 37.5133, // 강남역 근처
      currentLng: 127.0595,
      lastLocationUpdate: now,
    },
  });

  // 4. Trip 정거장 생성 (서울 주요 지점)
  console.log('📍 정거장 생성 중...');

  await prisma.stop.create({
    data: {
      tripId: demoTrip.id,
      stopType: 'PICKUP',
      sequence: 1,
      address: '서울특별시 중구 세종대로 110 (서울시청)',
      latitude: 37.5665,
      longitude: 126.9780,
      scheduledTime: tripStart,
      actualTime: tripStart,
      customerId: customer1.id,
    },
  });

  await prisma.stop.create({
    data: {
      tripId: demoTrip.id,
      stopType: 'PICKUP',
      sequence: 2,
      address: '서울특별시 강남구 테헤란로 152 (강남역)',
      latitude: 37.4979,
      longitude: 127.0276,
      scheduledTime: new Date(tripStart.getTime() + 10 * 60000),
      actualTime: null,
      customerId: customer2.id,
    },
  });

  await prisma.stop.create({
    data: {
      tripId: demoTrip.id,
      stopType: 'PICKUP',
      sequence: 3,
      address: '서울특별시 송파구 올림픽로 300 (잠실역)',
      latitude: 37.5133,
      longitude: 127.1028,
      scheduledTime: new Date(tripStart.getTime() + 20 * 60000),
      actualTime: null,
      customerId: customer3.id,
    },
  });

  await prisma.stop.create({
    data: {
      tripId: demoTrip.id,
      stopType: 'DROPOFF',
      sequence: 4,
      address: '인천광역시 중구 공항로 272 (인천국제공항)',
      latitude: 37.4602,
      longitude: 126.4407,
      scheduledTime: tripEnd,
      actualTime: null,
    },
  });

  console.log('✅ 정거장 4개 생성 완료\n');

  // 5. 예약 요청 생성
  console.log('📋 예약 요청 생성 중...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const returnTime = new Date(tomorrow);
  returnTime.setHours(18, 0, 0, 0);

  const request1 = await prisma.rideRequest.create({
    data: {
      customerId: customer1.id,
      pickupAddress: '서울특별시 중구 세종대로 110',
      pickupLat: 37.5665,
      pickupLng: 126.9780,
      desiredPickupTime: tomorrow,
      dropoffAddress: '인천광역시 중구 공항로 272',
      dropoffLat: 37.4602,
      dropoffLng: 126.4407,
      returnAddress: '인천광역시 중구 공항로 272',
      returnLat: 37.4602,
      returnLng: 126.4407,
      desiredReturnTime: returnTime,
      homeAddress: '서울특별시 중구 세종대로 110',
      homeLat: 37.5665,
      homeLng: 126.9780,
      passengerCount: 1,
      status: 'CONFIRMED',
    },
  });

  const request2 = await prisma.rideRequest.create({
    data: {
      customerId: customer2.id,
      pickupAddress: '서울특별시 강남구 테헤란로 152',
      pickupLat: 37.4979,
      pickupLng: 127.0276,
      desiredPickupTime: tomorrow,
      dropoffAddress: '인천광역시 중구 공항로 272',
      dropoffLat: 37.4602,
      dropoffLng: 126.4407,
      returnAddress: '인천광역시 중구 공항로 272',
      returnLat: 37.4602,
      returnLng: 126.4407,
      desiredReturnTime: returnTime,
      homeAddress: '서울특별시 강남구 테헤란로 152',
      homeLat: 37.4979,
      homeLng: 127.0276,
      passengerCount: 1,
      status: 'CONFIRMED',
    },
  });

  console.log('✅ 예약 요청 2개 생성 완료\n');

  // 6. Booking 생성
  console.log('🎫 예약 확정 생성 중...');

  await prisma.booking.create({
    data: {
      requestId: request1.id,
      customerId: customer1.id,
      outboundTripId: demoTrip.id,
      status: 'IN_TRIP',
      totalPrice: 25000,
      paidAmount: 25000,
      paymentStatus: 'PAID',
      transactionId: 'DEMO_TX_001',
    },
  });

  await prisma.booking.create({
    data: {
      requestId: request2.id,
      customerId: customer2.id,
      outboundTripId: demoTrip.id,
      status: 'IN_TRIP',
      totalPrice: 23000,
      paidAmount: 23000,
      paymentStatus: 'PAID',
      transactionId: 'DEMO_TX_002',
    },
  });

  console.log('✅ 예약 확정 2개 생성 완료\n');

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║        🎉 시드 데이터 생성 완료!         ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  console.log('📌 테스트 계정:');
  console.log(`   고객 1: ${customer1.email} (${customer1.name})`);
  console.log(`   고객 2: ${customer2.email} (${customer2.name})`);
  console.log(`   고객 3: ${customer3.email} (${customer3.name})`);
  console.log(`   기사: ${driver.email} (${driver.name})`);
  console.log(`   관리자: ${admin.email} (${admin.name})\n`);

  console.log('🚖 차량:');
  console.log(`   ${vehicle.name} (${vehicle.licensePlate}) - 정원 ${vehicle.capacity}명\n`);

  console.log('🗺️  데모 Trip (운행 중):');
  console.log(`   Trip ID: ${demoTrip.id}`);
  console.log(`   상태: 운행 중 (IN_PROGRESS)`);
  console.log(`   경로: 서울시청 → 강남역 → 잠실역 → 인천공항`);
  console.log(`   승객: 2명 (김철수, 이영희)\n`);

  console.log('💡 다음 단계:');
  console.log('   1. 프론트엔드 접속: http://localhost:5173');
  console.log('   2. 고객 페이지 → 예약 내역 확인');
  console.log('   3. 드라이버 페이지 → Trip 상세 보기');
  console.log('   4. 실시간 지도에서 경로 확인! 🗺️\n');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
