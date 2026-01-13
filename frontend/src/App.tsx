import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerHome from './pages/customer/CustomerHome';
import BookingForm from './pages/customer/BookingForm';
import ProposalList from './pages/customer/ProposalList';
import BookingList from './pages/customer/BookingList';
import DriverHome from './pages/driver/DriverHome';
import TripDetail from './pages/driver/TripDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 고객 페이지 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/customer" replace />} />
          <Route path="customer" element={<CustomerHome />} />
          <Route path="customer/booking" element={<BookingForm />} />
          <Route path="customer/proposals" element={<ProposalList />} />
          <Route path="customer/bookings" element={<BookingList />} />
        </Route>

        {/* 기사 페이지 */}
        <Route path="/driver" element={<Layout />}>
          <Route index element={<DriverHome />} />
          <Route path="trips/:tripId" element={<TripDetail />} />
        </Route>

        {/* 관리자 페이지 */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
