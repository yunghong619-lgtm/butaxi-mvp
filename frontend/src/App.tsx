import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CustomerHome from './pages/customer/CustomerHome';
import BookingForm from './pages/customer/BookingForm';
import ProposalList from './pages/customer/ProposalList';
import BookingList from './pages/customer/BookingList';
import TripTracking from './pages/customer/TripTracking';
import DriverHome from './pages/driver/DriverHome';
import TripDetail from './pages/driver/TripDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 홈 화면 */}
        <Route path="/" element={<Home />} />

        {/* 고객 페이지 */}
        <Route path="/customer" element={<Layout />}>
          <Route index element={<CustomerHome />} />
          <Route path="booking" element={<BookingForm />} />
          <Route path="proposals" element={<ProposalList />} />
          <Route path="bookings" element={<BookingList />} />
          <Route path="trips/:tripId" element={<TripTracking />} />
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
