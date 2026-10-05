import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, MapPin, Battery, Clock, Filter, CheckCircle, XCircle, Zap, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import { fetchStations } from '../services/MicrogridService';

const ProsumerBookings = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [stationsMap, setStationsMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const nic = user?.nic || user?.nIC || user?.NIC;
      if (!nic) {
        setLoading(false);
        return;
      }
      try {
        const [bookingsRes, stationsData] = await Promise.all([
          axios.get(`${API_BASE_URL}/reservations/prosumer/${nic}`, {
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
          setBookings(bookingsRes.data.data || []);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await axios.put(`http://localhost:5059/api/reservations/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        alert("Booking cancelled successfully.");
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || "Failed to cancel booking. The 12-hour rule might apply.");
    }
  };

  const isModifiable = (booking) => {
    if (booking.status !== 'Pending' && booking.status !== 'Approved') return false;
    try {
      const bookingDateTime = new Date(booking.reservationDate);
      const differenceInHours = (bookingDateTime - new Date()) / (1000 * 60 * 60);
      return differenceInHours >= 12;
    } catch (e) {
      return false;
    }
  };


  const filteredBookings = bookings.filter(b => {
    // 1. Check status filter
    if (filter !== 'All' && b.status !== filter) return false;

    // 2. Check date filter
    if (selectedDate) {
      const d = new Date(b.reservationDate);
      const bDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (bDateStr !== selectedDate) return false;
    }
    return true;
  });

  // --- Calendar Logic ---
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const bookingDatesMap = bookings.reduce((acc, booking) => {
    const d = new Date(booking.reservationDate);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(booking);
    return acc;
  }, {});

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full w-full pb-8 overflow-y-auto custom-scrollbar">
      {/* ── Left Column: Calendar Panel ── */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6 shrink-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 tracking-tight">Calendar</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Filter by booking date</p>
            </div>
            <div className="flex gap-2 items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500">&lt;</button>
              <span className="text-[11px] font-bold text-charcoal-900 uppercase tracking-widest w-24 text-center">
                {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
              </span>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500">&gt;</button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{d}</div>
            ))}
            {paddingDays.map(d => <div key={`pad-${d}`} className="aspect-square" />)}

            {days.map(day => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayBookings = bookingDatesMap[dateStr] || [];
              const hasBookings = dayBookings.length > 0;
              const isSelected = selectedDate === dateStr;

              let bgColor = "bg-white border border-gray-100 hover:border-lime-200 hover:shadow-sm";
              let textColor = "text-gray-600";

              if (hasBookings) {
                const hasApproved = dayBookings.some(b => b.status === 'Approved');
                const hasPending = dayBookings.some(b => b.status === 'Pending');

                if (isSelected) {
                  bgColor = "bg-charcoal-900 border-charcoal-900";
                  textColor = "text-white";
                } else if (hasApproved) {
                  bgColor = "bg-lime-400 border-lime-400 shadow-sm shadow-lime-400/20";
                  textColor = "text-charcoal-900";
                } else if (hasPending) {
                  bgColor = "bg-yellow-300 border-yellow-300 shadow-sm shadow-yellow-300/20";
                  textColor = "text-charcoal-900";
                } else {
                  bgColor = "bg-blue-100 border-blue-200";
                  textColor = "text-blue-700";
                }
              } else if (isSelected) {
                bgColor = "bg-gray-800 border-gray-800";
                textColor = "text-white";
              }

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all relative ${bgColor} ${textColor} ${isSelected ? 'scale-105 shadow-md ring-2 ring-lime-400 ring-offset-2' : ''}`}
                >
                  {String(day).padStart(2, '0')}
                  {hasBookings && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[7px] font-black text-charcoal-900">
                      {dayBookings.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-lime-400"></div> Approved</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-yellow-300"></div> Pending</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200"></div> Other</div>
          </div>

          {/* Clear Filter Button */}
          {selectedDate && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onClick={() => setSelectedDate(null)}
              className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-charcoal-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Clear Date Filter
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* ── Right Column: Booking List ── */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
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
              <div className="flex flex-col gap-3">
                {filteredBookings.map((booking, idx) => (
                  <div key={booking.id || idx} className="border border-gray-100 rounded-2xl p-4 hover:border-lime-200 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white relative">
                    {/* Station */}
                    <div className="flex items-center gap-3 w-full md:w-1/4 md:min-w-[140px]">
                      <div className="w-8 h-8 rounded-lg bg-lime-50 border border-lime-100 flex items-center justify-center shrink-0">
                        <Battery className="w-4 h-4 text-lime-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-bold text-charcoal-900 truncate">
                          {stationsMap[booking.stationId] || booking.stationName || `Station ${booking.stationId.substring(0, 6)}`}
                        </h3>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex flex-col gap-0.5 w-full md:w-1/4 md:border-l border-gray-100 md:pl-4">
                      <span className="text-[11px] font-bold text-charcoal-900">{new Date(booking.reservationDate).toLocaleDateString()}</span>
                      <span className="text-[10px] font-semibold text-gray-500">{new Date(booking.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Requested kWh */}
                    <div className="flex flex-col gap-0.5 w-full md:w-1/5 md:border-l border-gray-100 md:pl-4">
                      <span className="text-[11px] font-bold text-charcoal-900">{booking.energyAmountKwh} kWh</span>
                      <span className="text-[9px] font-semibold text-gray-400 uppercase">Requested</span>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center md:justify-end gap-3 w-full md:flex-1 md:border-l border-gray-100 md:pl-4">
                      <span className={`px-2 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider shrink-0 ${
                          booking.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {booking.status}
                      </span>

                      {(booking.status === 'Pending' || booking.status === 'Approved') && (
                        <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-2">
                           <button 
                             disabled={!isModifiable(booking)}
                             title={!isModifiable(booking) ? "Cannot modify within 12 hours" : "Modify booking"}
                             className="p-2 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleCancelBooking(booking.id)}
                             disabled={!isModifiable(booking)}
                             title={!isModifiable(booking) ? "Cannot cancel within 12 hours" : "Cancel booking"}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProsumerBookings;
