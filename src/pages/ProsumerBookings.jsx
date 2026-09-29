import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, MapPin, Battery, Clock, Filter, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ProsumerBookings = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      const nic = user?.nic || user?.nIC || user?.NIC;
      if (!nic) {
         setLoading(false);
         return;
      }
      try {
        const response = await axios.get(`http://localhost:5059/api/reservations/prosumer/${nic}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          setBookings(response.data.data || []);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user, token]);

  const filteredBookings = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="flex flex-col gap-6 h-full w-full pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight">My Bookings</h1>
          <p className="text-sm font-medium text-gray-500">Manage your charging station reservations</p>
        </div>
        
        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto w-full md:w-auto custom-scrollbar">
           {['All', 'Pending', 'Approved', 'Completed', 'Cancelled'].map(status => (
             <button 
               key={status}
               onClick={() => setFilter(status)}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === status ? 'bg-white text-charcoal-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-charcoal-900'}`}
             >
               {status}
             </button>
           ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by station or ID..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-charcoal-900 placeholder:text-gray-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium text-sm">
              Loading your bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
               <Calendar className="w-12 h-12 text-gray-200" />
               <span className="font-medium text-sm">No bookings found for the selected filter.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredBookings.map((booking, idx) => (
                <div key={booking.id || idx} className="border border-gray-100 rounded-2xl p-5 hover:border-lime-200 hover:shadow-md transition-all flex flex-col gap-4 bg-white relative overflow-hidden group">
                   
                   <div className="flex justify-between items-start z-10">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center">
                            <Battery className="w-5 h-5 text-lime-600" />
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-charcoal-900">{booking.stationName || `Station ${booking.stationId.substring(0,6)}`}</h3>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{booking.id.substring(0,8)}</span>
                         </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
                        booking.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                         {booking.status}
                      </span>
                   </div>
                   
                   <div className="h-px bg-gray-50 w-full z-10"></div>
                   
                   <div className="grid grid-cols-2 gap-y-3 gap-x-2 z-10">
                      <div className="flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-gray-400" />
                         <span className="text-xs font-semibold text-charcoal-900">
                           {new Date(booking.reservationDate).toLocaleDateString()}
                         </span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4 text-gray-400" />
                         <span className="text-xs font-semibold text-charcoal-900">
                           {new Date(booking.reservationDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                         <Zap className="w-4 h-4 text-gray-400" />
                         <span className="text-xs font-semibold text-charcoal-900">
                           {booking.energyAmount} kWh requested
                         </span>
                      </div>
                   </div>
                   
                   {booking.status === 'Pending' && (
                     <div className="mt-2 flex gap-2 z-10">
                        <button className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold py-2.5 rounded-xl transition-colors">
                           Cancel Booking
                        </button>
                        <button className="flex-1 bg-lime-400 hover:bg-lime-500 text-charcoal-900 text-xs font-bold py-2.5 rounded-xl transition-colors">
                           Modify
                        </button>
                     </div>
                   )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProsumerBookings;
