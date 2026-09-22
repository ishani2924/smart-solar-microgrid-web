import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#', active: true },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Team', href: '#team' },
    { name: 'Contact', href: '#contact' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'Prosumer': return '/profile';
      case 'Backoffice': return '/admin/users';
      case 'GridOperator': return '/operator/dashboard';
      default: return '/';
    }
  };

  const handleLogout = () => { logout(); setIsMobileMenuOpen(false); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-6 md:px-12 flex justify-center pointer-events-none">
      <div 
        className="w-full max-w-7xl flex justify-between items-center transition-all duration-300 pointer-events-auto"
        style={isScrolled ? {
          padding: '0.75rem 1rem',
          background: 'rgba(16,16,16,0.95)', // Dark background when scrolled
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        } : {
          padding: '1rem 0'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 font-display font-bold text-xl text-white tracking-tight">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="#C5F849"/>
          </svg>
          SolarGrid
        </div>

        {/* Desktop Nav - Center Pill */}
        <nav className="hidden md:flex items-center">
          <ul className="flex items-center p-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-colors block"
                  style={link.active ? {
                    background: '#C5F849', color: '#101010'
                  } : {
                    color: 'white'
                  }}
                  onMouseEnter={!link.active ? e => e.target.style.color = '#C5F849' : undefined}
                  onMouseLeave={!link.active ? e => e.target.style.color = 'white' : undefined}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="text-sm font-semibold text-white hover:text-lime-400 transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-white hover:text-lime-400 transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.6rem 0.6rem 0.6rem 1.25rem' }}>
                <span className="text-sm">Get Started</span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white pointer-events-auto"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-6 right-6 md:hidden rounded-2xl p-4 shadow-xl pointer-events-auto"
            style={{
              background: 'rgba(28,28,28,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href}
                  className="text-base font-semibold py-3 px-4 rounded-xl transition-colors"
                  style={link.active ? { background: 'rgba(197,248,73,0.1)', color: '#C5F849' } : { color: 'white' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-white/10 my-2" />
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()}
                    className="text-base font-semibold py-3 px-4 text-lime-400"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="text-base font-semibold py-3 px-4 text-left text-white/70">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-base font-semibold py-3 px-4 text-lime-400"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register"
                    className="flex items-center justify-between text-charcoal-900 font-bold py-3 px-4 rounded-xl mt-2 bg-lime-400"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
