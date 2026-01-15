const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('=== DB 상태 분석 ===\n');

  // RideRequest 상태
  const requests = await prisma.rideRequest.findMany();
  const statusCount = {};
  requests.forEach(r => { statusCount[r.status] = (statusCount[r.status] || 0) + 1; });
  console.log('📋 RideRequest:');
  Object.entries(statusCount).forEach(([k,v]) => console.log('   ' + k + ': ' + v + '개'));
  console.log('   총: ' + requests.length + '개');

  // Proposal 상태
  const proposals = await prisma.proposal.findMany({
    include: { request: { select: { customerId: true } } }
  });
  const propStatusCount = {};
  proposals.forEach(p => { propStatusCount[p.status] = (propStatusCount[p.status] || 0) + 1; });
  console.log('\n💌 Proposal:');
  Object.entries(propStatusCount).forEach(([k,v]) => console.log('   ' + k + ': ' + v + '개'));

  const now = new Date();
  const activeValid = proposals.filter(p => p.status === 'ACTIVE' && new Date(p.expiresAt) > now);
  console.log('   유효한 ACTIVE: ' + activeValid.length + '개');

  // ACTIVE Proposal 상세
  if (activeValid.length > 0) {
    console.log('\n✨ 유효한 ACTIVE Proposal:');
    activeValid.forEach(p => {
      console.log('   - ID: ' + p.id.slice(0,12) + '...');
      console.log('     customerId: ' + (p.request?.customerId || 'N/A'));
      console.log('     expiresAt: ' + new Date(p.expiresAt).toLocaleString('ko-KR'));
    });
  }

  // Customer
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
  console.log('\n👤 Customer: ' + customers.length + '명');
  customers.forEach(c => console.log('   - ' + c.name + ' / ' + c.phone + ' / ' + c.id.slice(0,12) + '...'));

  // Trip
  const trips = await prisma.trip.count();
  console.log('\n🚗 Trip: ' + trips + '개');

  await prisma.$disconnect();
}
check().catch(console.error);
