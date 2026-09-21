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

// Microgrid Pages
import StationList from './pages/Microgrid/StationList';
import CreateStation from './pages/Microgrid/CreateStation';
import StationDetails from './pages/Microgrid/StationDetails';

function Home() {
  return (
    <>
      <HeroSection />
      <Statistics />
      <HowItWorks />
      <Features />
      <UserRoles />
      <EnergyFlow />
      <CallToAction />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-navy-900 text-slate-50 font-sans antialiased selection:bg-teal-500/30 selection:text-white">
        <Navbar />
        <main className="bg-slate-50 text-slate-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stations" element={<StationList />} />
            <Route path="/stations/create" element={<CreateStation />} />
            <Route path="/stations/:id" element={<StationDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
