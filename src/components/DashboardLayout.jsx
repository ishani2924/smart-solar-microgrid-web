import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, X, User, Users, Activity, Settings, 
  Zap, LogOut, Search, Bell, BarChart2, ShieldCheck, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
  };

  const getNavLinks = () => {
    // Determine which links to show based on role
    // For now, combining them to match the Sopanel look
    const dashboardLinks = [
      { name: 'Overview', path: '/operator/dashboard', icon: <Activity className="w-4 h-4" /> },
      { name: 'Stations', path: '/stations', icon: <Zap className="w-4 h-4" /> },
      { name: 'Analysis', path: '/analysis', icon: <BarChart2 className="w-4 h-4" /> },
      { name: 'Admin Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { name: 'Admin Prosumers', path: '/admin/prosumers', icon: <ShieldCheck className="w-4 h-4" /> },
    ];

    const settingsLinks = [
      { name: 'My Account', path: '/profile', icon: <User className="w-4 h-4" /> },
      { name: 'Support', path: '/support', icon: <HelpCircle className="w-4 h-4" /> },
    ];

    return { dashboardLinks, settingsLinks };
  };

  const { dashboardLinks, settingsLinks } = getNavLinks();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 text-charcoal-500">
      <div className="flex items-center justify-between p-6 h-20">
        <NavLink to="/" className="flex items-center gap-2 font-display font-bold text-lg text-charcoal-900 tracking-tight">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute left-0 w-4 h-4 rounded-full bg-lime-400 opacity-80 mix-blend-multiply"></div>
            <div className="absolute right-0 w-4 h-4 rounded-full bg-yellow-400 opacity-80 mix-blend-multiply"></div>
          </div>
          SolarGrid
        </NavLink>
        {/* Mobile close button */}
        <button 
          className="md:hidden text-gray-400 hover:text-charcoal-900"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 flex flex-col gap-6">
        
        {/* Dashboard Group */}
        <div>
          <div className="px-8 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dashboard</div>
          <div className="flex flex-col">
            {dashboardLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-8 py-2.5 text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'bg-lime-50/50 text-lime-700'
                      : 'hover:bg-gray-50 text-gray-500 hover:text-charcoal-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-500 rounded-r-md"></div>}
                    <div className={isActive ? 'text-lime-600' : 'text-gray-400'}>{link.icon}</div>
                    {link.name}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Settings Group */}
        <div>
          <div className="px-8 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings</div>
          <div className="flex flex-col">
            {settingsLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-8 py-2.5 text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'bg-lime-50/50 text-lime-700'
                      : 'hover:bg-gray-50 text-gray-500 hover:text-charcoal-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-500 rounded-r-md"></div>}
                    <div className={isActive ? 'text-lime-600' : 'text-gray-400'}>{link.icon}</div>
                    {link.name}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile at bottom */}
      <div className="p-6 mt-auto">
        {user && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-charcoal-900 font-bold overflow-hidden border border-gray-200 shadow-sm">
              <img src="/heroimg.jpg" className="w-full h-full object-cover" alt="User" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">Hi,</span>
              <span className="text-sm font-bold text-charcoal-900 leading-none">{user.firstName} {user.lastName}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-charcoal-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden font-sans antialiased text-charcoal-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal-900/40 z-30 md:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-40 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white flex items-center justify-between px-6 md:px-10 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-500 hover:text-charcoal-900 p-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-500 hidden sm:block">
              {dashboardLinks.find(link => link.path === location.pathname)?.name || settingsLinks.find(link => link.path === location.pathname)?.name || 'Overview'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-charcoal-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-charcoal-900 transition-colors relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">8</div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-0">
          <div className="max-w-[1400px] mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
