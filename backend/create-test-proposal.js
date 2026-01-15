const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestProposal() {
  // REQUESTED 상태인 요청 찾기
  const request = await prisma.rideRequest.findFirst({
    where: { status: 'REQUESTED' },
    orderBy: { createdAt: 'desc' }
  });

  if (!request) {
    console.log('REQUESTED 상태 요청이 없습니다.');
    await prisma.$disconnect();
    return;
  }

  console.log('Request found:', request.id.slice(0,8), 'Customer:', request.customerId.slice(0,8));

  // Trip 찾기 또는 생성
  let trip = await prisma.trip.findFirst({
    where: { direction: 'OUTBOUND' },
    orderBy: { createdAt: 'desc' }
  });

  if (!trip) {
    console.log('Trip이 없습니다.');
    await prisma.$disconnect();
    return;
  }

  console.log('Trip found:', trip.id.slice(0,8));

  // Proposal 생성
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 후 만료
  
  const proposal = await prisma.proposal.create({
    data: {
      requestId: request.id,
      outboundTripId: trip.id,
      status: 'ACTIVE',
      pickupTime: request.desiredPickupTime,
      dropoffTime: new Date(request.desiredPickupTime.getTime() + 30 * 60000),
      returnPickupTime: request.desiredReturnTime,
      returnDropoffTime: new Date(request.desiredReturnTime.getTime() + 30 * 60000),
      estimatedPrice: 15000,
      expiresAt: expiresAt,
    }
  });

  console.log('✅ Proposal 생성:', proposal.id.slice(0,8));

  // Request 상태 업데이트
  await prisma.rideRequest.update({
    where: { id: request.id },
    data: { status: 'PROPOSED' }
  });

  console.log('✅ Request 상태 PROPOSED로 변경');

  await prisma.$disconnect();
}

createTestProposal();
