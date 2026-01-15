const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  // 현재 요청 상태 확인
  const requests = await prisma.rideRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('=== Recent Requests ===');
  requests.forEach(r => console.log('- ID:', r.id.slice(0,8), 'Status:', r.status, 'CustomerId:', r.customerId.slice(0,8)));

  // Proposal 상태 확인
  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { request: true }
  });
  console.log('\n=== Recent Proposals ===');
  proposals.forEach(p => {
    console.log('- ID:', p.id.slice(0,8), 'Status:', p.status, 'RequestId:', p.requestId.slice(0,8), 'Expires:', p.expiresAt);
  });

  // customerId 확인
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, take: 3 });
  console.log('\n=== Customers ===');
  customers.forEach(c => console.log('- ID:', c.id.slice(0,8), 'Name:', c.name));

  await prisma.$disconnect();
}
check();
