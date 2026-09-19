import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Statistics from './components/Statistics';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import UserRoles from './components/UserRoles';
import EnergyFlow from './components/EnergyFlow';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
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
