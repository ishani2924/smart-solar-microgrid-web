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
import AboutSection from './components/AboutSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesSection from './components/FeaturesSection';
import UserRolesSection from './components/UserRolesSection';
import PlatformSection from './components/PlatformSection';
import WhySolarGridSection from './components/WhySolarGridSection';
import CallToAction from './components/CallToAction';
import OperatorDashboard from './pages/OperatorDashboard';
import Analysis from './pages/Analysis';
import Support from './pages/Support';
// Microgrid Pages
import StationList from './pages/Microgrid/StationList';
import CreateStation from './pages/Microgrid/CreateStation';
import StationDetails from './pages/Microgrid/StationDetails';
import EditStation from './pages/Microgrid/EditStation';

function Home() {
  return (
    <div className="min-h-screen font-sans antialiased bg-white text-charcoal-900">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PlatformSection />
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
        <div className="min-h-screen bg-navy-900 text-slate-50 font-sans antialiased selection:bg-teal-500/30 selection:text-white">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={
              <>
                <Navbar />
                <main>
                  <HeroSection />
                  <Statistics />
                  <HowItWorks />
                  <Features />
                  <UserRoles />
                  <EnergyFlow />
                  <CallToAction />
                </main>
                <Footer />
              </>
            } />
            
            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Prosumer Routes */}
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="Prosumer">
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Backoffice Routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="Backoffice">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/prosumers" element={
              <ProtectedRoute requiredRole="Backoffice">
                <AdminProsumers />
              </ProtectedRoute>
            } />
            <Route path="/admin/deactivation-requests" element={
              <ProtectedRoute requiredRole="Backoffice">
                <AdminDeactivationRequests />
              </ProtectedRoute>
            } />
            
            {/* Grid Operator Routes */}
            <Route path="/operator/dashboard" element={
              <ProtectedRoute requiredRole="GridOperator">
                <OperatorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
