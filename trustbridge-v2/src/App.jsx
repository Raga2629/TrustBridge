import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import RoleSelection from './pages/RoleSelection';
import UserSignup from './pages/UserSignup';
import LocationSetup from './pages/LocationSetup';
import MyBookings from './pages/MyBookings';
import CommunityForum from './pages/CommunityForum';
import ForumPostDetail from './pages/ForumPostDetail';
import Profile from './pages/Profile';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import LocalDashboard from './pages/LocalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminServices from './pages/AdminServices';
import AdminComplaints from './pages/AdminComplaints';
import AddService from './pages/AddService';
import ProviderServices from './pages/ProviderServices';
import ProviderBookings from './pages/ProviderBookings';
import ProviderReviews from './pages/ProviderReviews';
import AddReview from './pages/AddReview';
import Chat from './pages/Chat';
import Unauthorized from './pages/Unauthorized';
import LocalResidentSignup from './pages/LocalResidentSignup';
import VerificationPending from './pages/VerificationPending';
import SecureChat from './pages/SecureChat';
import AdminResidentVerification from './pages/AdminResidentVerification';
import AdminServiceVerificationPage from './pages/AdminServiceVerificationPage';
import AdminOCRVerification from './pages/AdminOCRVerification';
import BookingSuccess from './pages/BookingSuccess';
import IdentityVerification from './pages/IdentityVerification';
import PhoneVerification from './pages/PhoneVerification';
import ProviderLocationVerification from './pages/ProviderLocationVerification';
import AdminLocationVerification from './pages/AdminLocationVerification';
import AdminReports from './pages/AdminReports';
import TrustScorePage from './pages/TrustScorePage';
import ProviderVerificationSetup from './pages/ProviderVerificationSetup';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/signup/user" element={<UserSignup />} />
            <Route path="/signup/local-resident" element={<LocalResidentSignup />} />
            <Route path="/verification-pending" element={<VerificationPending />} />
            <Route path="/location-setup" element={<LocationSetup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/phone-verification" element={<PhoneVerification />} />
            <Route
              path="/provider/verify-setup"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderVerificationSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trust-score"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL_RESIDENT', 'PROVIDER']}>
                  <TrustScorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/location-verification"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderLocationVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/location-verification"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLocationVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/identity-verification"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL_RESIDENT', 'PROVIDER']}>
                  <IdentityVerification />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <CommunityForum />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forum"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL_RESIDENT', 'PROVIDER', 'ADMIN']}>
                  <CommunityForum />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forum/posts/:id"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL_RESIDENT', 'PROVIDER', 'ADMIN']}>
                  <ForumPostDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL_RESIDENT', 'PROVIDER', 'ADMIN']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:serviceId"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <AddReview />
                </ProtectedRoute>
              }
            />

            {/* Provider Routes */}
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/add-service"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <AddService />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/services"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/bookings"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/reviews"
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderReviews />
                </ProtectedRoute>
              }
            />

            {/* Local Routes */}
            <Route
              path="/local/dashboard"
              element={
                <ProtectedRoute allowedRoles={['LOCAL']}>
                  <LocalDashboard />
                </ProtectedRoute>
              }
            />

            {/* Local Resident Routes */}
            <Route
              path="/local-resident/dashboard"
              element={
                <ProtectedRoute allowedRoles={['LOCAL_RESIDENT']}>
                  <LocalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/secure-chat"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL_RESIDENT']}>
                  <SecureChat />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUserDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminServices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/residents"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminResidentVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-verification"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminServiceVerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verification/:type/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminOCRVerification />
                </ProtectedRoute>
              }
            />

            {/* Chat Routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL']}>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <ProtectedRoute allowedRoles={['USER', 'LOCAL']}>
                  <Chat />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
