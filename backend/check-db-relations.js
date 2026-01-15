const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const drivers = await prisma.user.findMany({ where: { role: 'DRIVER' } });
  console.log('=== Drivers ===');
  drivers.forEach(d => console.log('- ID:', d.id, 'Name:', d.name));

  const trips = await prisma.trip.findMany({
    include: { 
      bookings: { select: { id: true, status: true, customerId: true } },
      driver: { select: { id: true, name: true } }
    }
  });
  console.log('\n=== Trips with Bookings ===');
  trips.forEach(t => {
    console.log('Trip:', t.id.slice(0,8), 'Driver:', t.driver?.name || 'None', 'Bookings:', t.bookings.length);
    t.bookings.forEach(b => console.log('  - Booking:', b.id.slice(0,8), 'Status:', b.status));
  });

  await prisma.$disconnect();
}
check();
