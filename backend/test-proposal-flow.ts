/**
 * Proposal 플로우 테스트 스크립트
 * 
 * 목적: 예약 요청부터 제안 조회까지 전체 플로우 검증
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProposalFlow() {
  console.log('\n🧪 Proposal 플로우 테스트 시작...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. 테스트 고객 찾기 또는 생성
    console.log('1️⃣ 테스트 고객 확인...');
    let customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          id: `test-customer-${Date.now()}`,
          name: '테스트 고객',
          email: `test-${Date.now()}@example.com`,
          phone: '010-1234-5678',
          role: 'CUSTOMER',
        },
      });
      console.log(`   ✅ 테스트 고객 생성: ${customer.id}`);
    } else {
      console.log(`   ✅ 기존 고객 사용: ${customer.id} (${customer.name})`);
    }

    // 2. RideRequest 조회
    console.log('\n2️⃣ RideRequest 조회...');
    const requests = await prisma.rideRequest.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`   ✅ 총 ${requests.length}개의 요청 발견`);
    
    if (requests.length > 0) {
      console.log('\n   최근 요청:');
      requests.forEach((req, idx) => {
        console.log(`   ${idx + 1}. ${req.id.slice(0, 12)}... - ${req.status}`);
      });
    } else {
      console.log('   ⚠️  요청이 없습니다. 웹에서 예약 요청을 먼저 생성해주세요.');
    }

    // 3. Proposal 조회
    console.log('\n3️⃣ Proposal 조회...');
    const proposals = await prisma.proposal.findMany({
      where: {
        request: {
          customerId: customer.id,
        },
      },
      include: {
        request: true,
        outboundTrip: {
          include: {
            vehicle: true,
            driver: true,
          },
        },
        returnTrip: {
          include: {
            vehicle: true,
            driver: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`   ✅ 총 ${proposals.length}개의 제안 발견`);

    if (proposals.length > 0) {
      console.log('\n   제안 상세:');
      proposals.forEach((prop, idx) => {
        const now = new Date();
        const isExpired = new Date(prop.expiresAt) < now;
        const statusIcon = prop.status === 'ACTIVE' ? '🟢' : 
                          prop.status === 'ACCEPTED' ? '✅' : 
                          prop.status === 'REJECTED' ? '❌' : '⚪';
        
        console.log(`\n   ${idx + 1}. ${statusIcon} Proposal ${prop.id.slice(0, 12)}...`);
        console.log(`      상태: ${prop.status}${isExpired ? ' (만료됨)' : ''}`);
        console.log(`      가격: ${prop.estimatedPrice.toLocaleString()}원`);
        console.log(`      요청: ${prop.requestId.slice(0, 12)}...`);
        
        if (prop.outboundTrip) {
          console.log(`      가는 편 Trip: ${prop.outboundTrip.id.slice(0, 12)}...`);
          if (prop.outboundTrip.vehicle) {
            console.log(`      차량: ${prop.outboundTrip.vehicle.name} (${prop.outboundTrip.vehicle.licensePlate})`);
          }
          if (prop.outboundTrip.driver) {
            console.log(`      기사: ${prop.outboundTrip.driver.name} (${prop.outboundTrip.driver.phone})`);
          }
        }
      });

      // ACTIVE 상태 필터링
      const activeProposals = proposals.filter(p => 
        p.status === 'ACTIVE' && new Date(p.expiresAt) > new Date()
      );
      
      console.log(`\n   📊 통계:`);
      console.log(`      전체: ${proposals.length}개`);
      console.log(`      활성: ${activeProposals.length}개`);
      console.log(`      수락됨: ${proposals.filter(p => p.status === 'ACCEPTED').length}개`);
      console.log(`      거부됨: ${proposals.filter(p => p.status === 'REJECTED').length}개`);
      console.log(`      만료됨: ${proposals.filter(p => p.status === 'EXPIRED').length}개`);

    } else {
      console.log('   ⚠️  제안이 없습니다.');
      console.log('   💡 예약 요청 후 10분 대기하거나 수동 매칭을 실행하세요.');
    }

    // 4. Trip 조회
    console.log('\n4️⃣ Trip 조회...');
    const trips = await prisma.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    console.log(`   ✅ 총 ${trips.length}개의 Trip 발견`);
    
    if (trips.length > 0) {
      trips.forEach((trip, idx) => {
        console.log(`\n   ${idx + 1}. Trip ${trip.id.slice(0, 12)}... (${trip.direction})`);
        console.log(`      상태: ${trip.status}`);
        console.log(`      차량: ${trip.vehicle?.name || 'N/A'}`);
        console.log(`      기사: ${trip.driver?.name || 'N/A'}`);
        console.log(`      정거장: ${trip.stops.length}개`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 테스트 완료!\n');

    // 5. 요약 및 권장사항
    console.log('📋 요약:');
    console.log(`   고객 ID: ${customer.id}`);
    console.log(`   요청: ${requests.length}개`);
    console.log(`   제안: ${proposals.length}개`);
    console.log(`   Trip: ${trips.length}개`);

    if (proposals.length === 0 && requests.length > 0) {
      console.log('\n💡 권장사항:');
      console.log('   제안이 없습니다. 다음을 시도해보세요:');
      console.log('   1. 백엔드 서버 재시작 (자동 매칭 활성화)');
      console.log('   2. 10분 대기 (자동 매칭 실행)');
      console.log('   3. 새로운 예약 요청 생성 (즉시 매칭 실행)');
    }

    if (proposals.length > 0) {
      const activeCount = proposals.filter(p => 
        p.status === 'ACTIVE' && new Date(p.expiresAt) > new Date()
      ).length;
      
      if (activeCount > 0) {
        console.log('\n✨ 활성 제안이 있습니다!');
        console.log(`   웹에서 확인: http://localhost:5173/customer/proposals`);
      }
    }

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
testProposalFlow();
