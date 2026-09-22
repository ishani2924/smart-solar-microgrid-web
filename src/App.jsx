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

// Microgrid Pages
import StationList from './pages/Microgrid/StationList';
import CreateStation from './pages/Microgrid/CreateStation';
import StationDetails from './pages/Microgrid/StationDetails';
import EditStation from './pages/Microgrid/EditStation';

function Home() {
  return (
    <div className="min-h-screen bg-navy-900 text-slate-50 font-sans antialiased selection:bg-teal-500/30 selection:text-white">
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
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRoles={['Admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/prosumers" element={<ProtectedRoute requiredRoles={['Admin']}><AdminProsumers /></ProtectedRoute>} />
          <Route path="/operator/dashboard" element={<ProtectedRoute requiredRoles={['GridOperator']}><OperatorDashboard /></ProtectedRoute>} />
          
          <Route path="/stations" element={<StationList />} />
          <Route path="/stations/create" element={<CreateStation />} />
          <Route path="/stations/:id" element={<StationDetails />} />
          <Route path="/stations/:id/edit" element={<EditStation />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
