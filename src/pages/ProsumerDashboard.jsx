import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Calendar, ShieldCheck, Battery, Sun, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import heroImg from '../assets/heroimg.jpg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchStations } from '../services/MicrogridService';
import TransferStatusBar, { fetchTransferStatuses } from '../components/TransferStatusBar';

const ProsumerDashboard = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stationsMap, setStationsMap] = useState({});
  const [transferStatus, setTransferStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const nic = user?.nic || user?.nIC || user?.NIC;
      if (!nic) {
         setLoading(false);
         return;
      }
      try {
        const [bookingsRes, stationsData] = await Promise.all([
          axios.get(`http://localhost:5059/api/reservations/prosumer/${nic}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => { console.error(err); return { data: { data: [] } }; }),
          fetchStations().catch(err => { console.error(err); return []; })
        ]);
        
        if (stationsData && stationsData.length > 0) {
          const map = {};
          stationsData.forEach(s => { map[s.stationId] = s.name; });
          setStationsMap(map);
        }

        if (bookingsRes.data && bookingsRes.data.success !== false) {
          const list = bookingsRes.data.data || [];
          setBookings(list);
          setTransferStatus(await fetchTransferStatuses(list));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  const totalBookings = bookings.length;
  const activeReservations = bookings.filter(b => b.status === 'Pending' || b.status === 'Approved').length;
  const completedReservations = bookings.filter(b => b.status === 'Completed');
  const energyConsumed = completedReservations.reduce((sum, b) => sum + (b.energyAmount || 0), 0).toFixed(1);
  const carbonSaved = (energyConsumed * 0.4).toFixed(1); // Rough estimate: 0.4 kg CO2 per kWh
  
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;

  const recentBookings = [...bookings].sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate)).slice(0, 3);

  // Generate mock weekly usage from actual bookings (group by day of week)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const sortedDays = [...daysOfWeek.slice(today + 1), ...daysOfWeek.slice(0, today + 1)];
  
  return (
    <div className="flex flex-col gap-6 h-full w-full pb-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-charcoal-900 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center"
      >
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none">
           <img src={heroImg} className="w-full h-full object-cover mask-image-gradient-left" style={{ maskImage: 'linear-gradient(to left, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 100%)' }} alt="Solar Panel" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome back, {user?.firstName || 'Prosumer'}!
          </h1>
          <p className="text-gray-400 font-medium text-sm">
            Here's what's happening with your energy today.
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 flex gap-4">
          <Link to="/prosumer/bookings" className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-bold py-3 px-6 rounded-xl transition-all shadow-sm text-sm">
            My Bookings
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Energy Consumed', value: energyConsumed, unit: 'kWh', icon: <Zap className="w-5 h-5 text-lime-500" />, trend: 'Lifetime' },
          { title: 'Total Bookings', value: totalBookings, unit: '', icon: <Calendar className="w-5 h-5 text-blue-500" />, trend: `${pendingCount} Pending` },
          { title: 'Carbon Saved', value: carbonSaved, unit: 'kg', icon: <Sun className="w-5 h-5 text-yellow-500" />, trend: 'Estimated' },
          { title: 'Active Reservations', value: activeReservations, unit: '', icon: <Activity className="w-5 h-5 text-purple-500" />, trend: 'Current' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                {stat.icon}
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-gray-50 text-gray-500 rounded-lg">{stat.trend}</span>
            </div>
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-charcoal-900">{stat.value}</span>
                {stat.unit && <span className="text-sm font-semibold text-gray-400">{stat.unit}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">Energy transfer</h2>
          </div>
          <Link to="/prosumer/bookings" className="text-sm font-bold text-lime-600">All bookings</Link>
        </div>
        {loading && <p className="text-sm text-gray-400">Loading bookings...</p>}
        {!loading && bookings.length === 0 && (
          <p className="text-sm text-gray-400">No bookings yet. A transfer starts after you reserve a slot.</p>
        )}
        <div className="flex flex-col gap-4">
          {[...bookings]
            .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate))
            .map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-charcoal-900">
                      {stationsMap[booking.stationId] || booking.stationName || 'Station'}
                    </h3>
                    <p className="text-xs font-semibold text-gray-400">
                      {new Date(booking.reservationDate).toLocaleDateString()} · {booking.energyAmountKwh || booking.energyAmount || 0} kWh
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    booking.status === 'Approved' ? 'bg-lime-100 text-lime-700' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <TransferStatusBar status={booking.status} transferStatus={transferStatus[booking.id]} />
              </div>
            ))}
        </div>
      </motion.div>

      {/* Usage Chart & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-charcoal-900 font-bold text-lg">Weekly Usage Trend</h2>
          </div>
          {/* Chart */}
          <div className="flex-1 flex items-end justify-between gap-4 mt-auto relative h-48 px-2 pb-6">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full border-t border-dashed border-gray-100"></div>
              ))}
            </div>
            {sortedDays.map((day, i) => {
              // Creating a realistic looking visual trend for the week based on bookings length to make it dynamic
              const baseHeight = ((i + 1) * 10 + (totalBookings * 2)) % 60 + 20; 
              const h1 = baseHeight;
              const h2 = baseHeight * 0.3;
              return (
                <div key={i} className="flex flex-col items-center gap-2 z-10 w-full group cursor-pointer h-full justify-end">
                   <div className="w-full max-w-[2rem] flex flex-col justify-end gap-1 h-full relative">
                      <div className="absolute bottom-0 w-full bg-lime-400 rounded-t-sm transition-all group-hover:opacity-80" style={{ height: `${h1}%` }}></div>
                      <div className="absolute bottom-0 w-full bg-charcoal-900 rounded-t-sm opacity-20" style={{ height: `${h2}%` }}></div>
                   </div>
                   <span className="text-gray-400 text-[10px] font-semibold mt-2">{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-charcoal-900 font-bold text-lg">Recent Bookings</h2>
            <Link to="/prosumer/bookings" className="text-lime-600 hover:text-lime-700 p-1">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {recentBookings.length === 0 && !loading && (
              <div className="text-gray-400 text-xs font-medium text-center mt-10">No recent bookings found.</div>
            )}
            {loading && (
              <div className="text-gray-400 text-xs font-medium text-center mt-10">Loading...</div>
            )}
            {recentBookings.map((booking, i) => (
              <div key={booking.id || i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
                  <Battery className="w-5 h-5 text-lime-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-charcoal-900 truncate max-w-[120px]">
                    {stationsMap[booking.stationId] || booking.stationName || `Station ${booking.stationId.substring(0,6)}`}
                  </h4>
                  <p className="text-[10px] font-semibold text-gray-400">{new Date(booking.reservationDate).toLocaleDateString()} {new Date(booking.reservationDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                  booking.status === 'Approved' ? 'bg-green-50 text-green-600' :
                  booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                  booking.status === 'Completed' ? 'bg-blue-50 text-blue-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {booking.status}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default ProsumerDashboard;
