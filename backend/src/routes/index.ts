import { Router } from 'express';
import { rideController } from '../controllers/ride.controller';
import { proposalController } from '../controllers/proposal.controller';
import { bookingController } from '../controllers/booking.controller';
import { tripController } from '../controllers/trip.controller';
import { customerController } from '../controllers/customer.controller';
import { reviewController } from '../controllers/review.controller';
import { referralController } from '../controllers/referral.controller';
import { pointsController } from '../controllers/points.controller';

const router = Router();

// ========== Ride Request Routes ==========
router.post('/rides/requests', rideController.createRequest.bind(rideController));
router.get('/rides/requests/customer/:customerId', rideController.getCustomerRequests.bind(rideController));
router.get('/rides/requests/:requestId', rideController.getRequestDetail.bind(rideController));
router.delete('/rides/requests/:requestId', rideController.cancelRequest.bind(rideController));

// ========== Proposal Routes ==========
router.get('/proposals/customer/:customerId', proposalController.getCustomerProposals.bind(proposalController));
router.get('/proposals/:proposalId', proposalController.getProposalDetail.bind(proposalController));
router.post('/proposals/:proposalId/accept', proposalController.acceptProposal.bind(proposalController));
router.post('/proposals/:proposalId/reject', proposalController.rejectProposal.bind(proposalController));

// ========== Booking Routes ==========
router.get('/bookings/customer/:customerId', bookingController.getCustomerBookings.bind(bookingController));
router.get('/bookings/:bookingId', bookingController.getBookingDetail.bind(bookingController));
router.post('/bookings/:bookingId/cancel', bookingController.cancelBooking.bind(bookingController));

// ========== Trip Routes (기사용) ==========
router.get('/trips/driver/:driverId', tripController.getDriverTrips.bind(tripController));
router.get('/trips/:tripId', tripController.getTripDetail.bind(tripController));
router.patch('/trips/:tripId/status', tripController.updateTripStatus.bind(tripController));
router.patch('/trips/:tripId/location', tripController.updateDriverLocation.bind(tripController));
router.post('/trips/stops/:stopId/checkin', tripController.checkInStop.bind(tripController));

// ========== Customer Routes ==========
router.post('/customers', customerController.findOrCreateCustomer.bind(customerController));
router.get('/customers/phone/:phone', customerController.getCustomerByPhone.bind(customerController));
router.get('/customers/phone/:phone/data', customerController.getCustomerDataByPhone.bind(customerController));

// ========== Review Routes ==========
router.post('/reviews', reviewController.createReview.bind(reviewController));
router.get('/reviews/driver/:driverId', reviewController.getDriverReviews.bind(reviewController));
router.get('/reviews/booking/:bookingId', reviewController.getBookingReview.bind(reviewController));

// ========== Referral Routes ==========
router.get('/referral/:customerId', referralController.getMyReferralCode.bind(referralController));
router.post('/referral/apply', referralController.applyReferralCode.bind(referralController));

// ========== Points Routes ==========
router.get('/points/:customerId', pointsController.getPointsBalance.bind(pointsController));
router.post('/points/use', pointsController.usePoints.bind(pointsController));
router.post('/points/earn', pointsController.earnRideReward.bind(pointsController));

// ========== Debug Routes ==========
router.get('/debug/drivers', async (req, res) => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const drivers = await prisma.user.findMany({ where: { role: 'DRIVER' } });
  const trips = await prisma.trip.findMany({ include: { driver: true, bookings: true } });
  res.json({ drivers, trips });
});

router.post('/debug/fix-trips', async (req, res) => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  // 첫 번째 드라이버 찾기
  const driver = await prisma.user.findFirst({ where: { role: 'DRIVER' } });

  if (!driver) {
    return res.status(404).json({ success: false, error: '드라이버를 찾을 수 없습니다.' });
  }

  // driverId가 null인 모든 Trip을 업데이트
  const result = await prisma.trip.updateMany({
    where: { driverId: null },
    data: { driverId: driver.id }
  });

  res.json({
    success: true,
    message: `${result.count}개의 Trip이 ${driver.name}에게 배정되었습니다.`,
    driverId: driver.id,
    count: result.count
  });
});

// ========== Health Check ==========
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BUTAXI Backend is running!',
    timestamp: new Date().toISOString(),
  });
});

export default router;
