import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default App;
