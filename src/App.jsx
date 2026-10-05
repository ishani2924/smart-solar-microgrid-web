import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminProsumers from './pages/AdminProsumers';
import AdminDeactivationRequests from './pages/AdminDeactivationRequests';
import AdminBookings from './pages/AdminBookings';
import AboutSection from './components/AboutSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesSection from './components/FeaturesSection';
import UserRolesSection from './components/UserRolesSection';
import PlatformSection from './components/PlatformSection';
import WhySolarGridSection from './components/WhySolarGridSection';
import CallToAction from './components/CallToAction';
import Statistics from './components/Statistics';
import EnergyFlow from './components/EnergyFlow';
import OperatorDashboard from './pages/OperatorDashboard';
import Analysis from './pages/Analysis';
import Support from './pages/Support';
import TabPermissions from './pages/TabPermissions';

import StationList from './pages/Microgrid/StationList';
import CreateStation from './pages/Microgrid/CreateStation';
import StationDetails from './pages/Microgrid/StationDetails';
import EditStation from './pages/Microgrid/EditStation';
import ProsumerDashboard from './pages/ProsumerDashboard';
import ProsumerBookings from './pages/ProsumerBookings';
import ProsumerStations from './pages/ProsumerStations';
import BookingConfirmation from './pages/BookingConfirmation';
import OperatorScan from './pages/OperatorScan';
import OperatorStationMap from './pages/OperatorStationMap';
import BookSlot from './pages/BookSlot';

function Home() {
  return (
    <div className="min-h-screen font-sans antialiased bg-white text-charcoal-900">
      <Navbar />
      <main>
        <HeroSection />
        <Statistics />
        <AboutSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PlatformSection />
        <EnergyFlow />
        <UserRolesSection />
        <WhySolarGridSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<DashboardLayout />}>
            <Route path="/prosumer/dashboard" element={<ProtectedRoute requiredRole="Prosumer"><ProsumerDashboard /></ProtectedRoute>} />
            <Route path="/prosumer/bookings" element={<ProtectedRoute requiredRole="Prosumer"><ProsumerBookings /></ProtectedRoute>} />
            <Route path="/prosumer/stations" element={<ProtectedRoute requiredRole="Prosumer"><ProsumerStations /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requiredRole="Prosumer"><Profile /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRoles={['Admin', 'Backoffice']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/prosumers" element={<ProtectedRoute requiredRoles={['Admin', 'Backoffice']}><AdminProsumers /></ProtectedRoute>} />
            <Route path="/admin/deactivation-requests" element={<ProtectedRoute requiredRoles={['Admin', 'Backoffice']}><AdminDeactivationRequests /></ProtectedRoute>} />
            <Route path="/admin/tab-permissions" element={<ProtectedRoute requiredRoles={['Admin', 'Backoffice']}><TabPermissions /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute requiredRoles={['Admin', 'Backoffice', 'GridOperator']}><AdminBookings /></ProtectedRoute>} />
            <Route path="/operator/dashboard" element={<ProtectedRoute requiredRoles={['GridOperator', 'Backoffice', 'Admin']}><OperatorDashboard /></ProtectedRoute>} />
            <Route path="/operator/scan" element={<ProtectedRoute requiredRoles={['GridOperator', 'Backoffice', 'Admin']}><OperatorScan /></ProtectedRoute>} />
            <Route path="/operator/map" element={<ProtectedRoute requiredRoles={['Prosumer', 'GridOperator', 'Backoffice', 'Admin']}><OperatorStationMap /></ProtectedRoute>} />
            <Route path="/booking/confirmation" element={<ProtectedRoute requiredRoles={['Prosumer', 'GridOperator', 'Backoffice', 'Admin']}><BookingConfirmation /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

            <Route path="/stations" element={<ProtectedRoute><StationList /></ProtectedRoute>} />
            <Route path="/stations/create" element={<ProtectedRoute requiredRoles={['Backoffice', 'GridOperator', 'Admin']}><CreateStation /></ProtectedRoute>} />
            <Route path="/stations/:id/book" element={<ProtectedRoute requiredRoles={['Prosumer', 'GridOperator', 'Backoffice', 'Admin']}><BookSlot /></ProtectedRoute>} />
            <Route path="/stations/:id" element={<ProtectedRoute><StationDetails /></ProtectedRoute>} />
            <Route path="/stations/:id/edit" element={<ProtectedRoute requiredRoles={['Backoffice', 'GridOperator', 'Admin']}><EditStation /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
