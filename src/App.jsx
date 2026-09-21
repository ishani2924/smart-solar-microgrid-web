import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Statistics from './components/Statistics';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import UserRoles from './components/UserRoles';
import EnergyFlow from './components/EnergyFlow';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminProsumers from './pages/AdminProsumers';
import OperatorDashboard from './pages/OperatorDashboard';

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
