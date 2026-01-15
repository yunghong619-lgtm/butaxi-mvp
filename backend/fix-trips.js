const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  // 드라이버 ID 가져오기
  const driver = await prisma.user.findFirst({ where: { role: 'DRIVER' } });
  if (!driver) {
    console.log('No driver found');
    return;
  }
  console.log('Driver:', driver.id, driver.name);

  // 모든 Trip에 드라이버 배정
  const result = await prisma.trip.updateMany({
    where: { driverId: null },
    data: { driverId: driver.id }
  });
  console.log('Updated trips:', result.count);

  // Booking과 Trip 연결 확인
  const bookings = await prisma.booking.findMany({
    where: { status: 'CONFIRMED' },
    include: { request: true }
  });
  
  console.log('\nConfirmed Bookings:', bookings.length);
  
  for (const booking of bookings) {
    if (!booking.outboundTripId) {
      // 적절한 trip 찾기
      const trip = await prisma.trip.findFirst({
        where: { direction: 'OUTBOUND' },
        orderBy: { createdAt: 'desc' }
      });
      if (trip) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { outboundTripId: trip.id }
        });
        console.log('Connected booking', booking.id.slice(0,8), 'to trip', trip.id.slice(0,8));
      }
    }
  }

  await prisma.$disconnect();
  console.log('\nDone!');
}
fix();
