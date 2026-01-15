/**
 * 테스트용 고객 ID 확인 스크립트
 *
 * 브라우저 콘솔에서 아래 명령어를 실행하세요:
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showTestCustomers() {
  console.log('\n========================================');
  console.log('🧪 테스트용 고객 정보');
  console.log('========================================\n');

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { id: true, name: true, phone: true }
  });

  console.log('📌 브라우저 개발자 도구 (F12) → Console에서 실행하세요:\n');

  customers.forEach(c => {
    console.log(`// ${c.name} (${c.phone}) 로 로그인:`);
    console.log(`localStorage.setItem('butaxi_customer_id', '${c.id}');`);
    console.log(`location.reload();\n`);
  });

  console.log('========================================\n');

  // 현재 Proposal 상태
  const proposals = await prisma.proposal.findMany({
    where: { status: 'ACTIVE' },
    include: { request: { include: { customer: { select: { name: true } } } } }
  });

  console.log(`✨ 현재 유효한 Proposal: ${proposals.length}개`);
  proposals.forEach(p => {
    console.log(`   - ${p.request.customer.name}: ${p.id.slice(0, 12)}...`);
  });

  await prisma.$disconnect();
}

showTestCustomers();
