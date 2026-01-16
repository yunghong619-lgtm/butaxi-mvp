import axios from 'axios';

// 환경에 따라 백엔드 URL 설정
const getBaseURL = (): string => {
  // 브라우저 환경에서 호스트명으로 판단
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Render 배포 환경
    if (hostname.includes('onrender.com') || hostname.includes('butaxi')) {
      return 'https://butaxi-backend.onrender.com/api';
    }
  }
  // 개발 환경
  return 'http://localhost:3000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // Render 무료 플랜은 콜드 스타트에 시간이 걸림
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // TODO: 인증 토큰 추가
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ========== Ride Request API ==========
export const rideApi = {
  createRequest: (data: any) => api.post('/rides/requests', data),
  getCustomerRequests: (customerId: string) => api.get(`/rides/requests/customer/${customerId}`),
  getRequestDetail: (requestId: string) => api.get(`/rides/requests/${requestId}`),
  cancelRequest: (requestId: string) => api.delete(`/rides/requests/${requestId}`),
};

// ========== Proposal API ==========
export const proposalApi = {
  getCustomerProposals: (customerId: string) => api.get(`/proposals/customer/${customerId}`),
  getProposalDetail: (proposalId: string) => api.get(`/proposals/${proposalId}`),
  acceptProposal: (proposalId: string) => api.post(`/proposals/${proposalId}/accept`),
  rejectProposal: (proposalId: string) => api.post(`/proposals/${proposalId}/reject`),
};

// ========== Booking API ==========
export const bookingApi = {
  getCustomerBookings: (customerId: string) => api.get(`/bookings/customer/${customerId}`),
  getBookingDetail: (bookingId: string) => api.get(`/bookings/${bookingId}`),
  cancelBooking: (bookingId: string) => api.post(`/bookings/${bookingId}/cancel`),
};

// ========== Trip API ==========
export const tripApi = {
  getDriverTrips: (driverId: string) => api.get(`/trips/driver/${driverId}`),
  getTripDetail: (tripId: string) => api.get(`/trips/${tripId}`),
  updateTripStatus: (tripId: string, status: string) =>
    api.patch(`/trips/${tripId}/status`, { status }),
  checkInStop: (stopId: string) => api.post(`/trips/stops/${stopId}/checkin`),
  updateDriverLocation: (tripId: string, location: { latitude: number; longitude: number }) =>
    api.patch(`/trips/${tripId}/location`, location),
};

// ========== Customer API ==========
export const customerApi = {
  findOrCreate: (data: { name: string; phone: string; email?: string }) =>
    api.post('/customers', data),
  getByPhone: (phone: string) => api.get(`/customers/phone/${phone}`),
  getDataByPhone: (phone: string) => api.get(`/customers/phone/${phone}/data`),
};

// ========== Review API ==========
export const reviewApi = {
  createReview: (data: { bookingId: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),
  getDriverReviews: (driverId: string) => api.get(`/reviews/driver/${driverId}`),
  getBookingReview: (bookingId: string) => api.get(`/reviews/booking/${bookingId}`),
};

// ========== Referral API ==========
export const referralApi = {
  getMyReferralCode: (customerId: string) => api.get(`/referral/${customerId}`),
  applyReferralCode: (data: { customerId: string; referralCode: string }) =>
    api.post('/referral/apply', data),
};

export default api;
