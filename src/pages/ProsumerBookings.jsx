import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Search,
  Battery,
  Clock,
  XCircle,
  Zap,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL, transferAPI } from '../services/api';
import { fetchStations, fetchSlots } from '../services/MicrogridService';
import { updateReservation } from '../services/reservationApi';
import BookingQrModal from '../components/BookingQrModal';
import TransferStatusBar, { fetchTransferStatuses } from '../components/TransferStatusBar';

const ProsumerBookings = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [stationsMap, setStationsMap] = useState({});
  const [qr, setQr] = useState(null);
  const [transferStatus, setTransferStatus] = useState({});

  // Modify Modal State
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [modifyError, setModifyError] = useState('');
  const [modifySuccess, setModifySuccess] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedModifyDate, setSelectedModifyDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [energyAmount, setEnergyAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);

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
          stationsData.forEach(s => { map[s.stationId || s.id] = s.name; });
          setStationsMap(map);
        }

        if (bookingsRes.data && bookingsRes.data.success !== false) {
          const list = bookingsRes.data.data || [];
          setBookings(list);
          if (fetchTransferStatuses) {
            try {
              const statuses = await fetchTransferStatuses(list);
              setTransferStatus(statuses || {});
            } catch (te) {
              console.error('Error fetching transfer statuses:', te);
            }
          }
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

  const showQr = async (id) => {
    try {
      const response = await transferAPI.getConfirmation(id);
      setQr(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'The QR is not ready yet. It appears after the grid operator approves the booking.');
    }
  };

  const getHoursUntilBooking = (booking) => {
    try {
      const d = new Date(booking.reservationDate);
      if (booking.startTime) {
        const match = booking.startTime.match(/(\d+):(\d+)/);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          if (/pm/i.test(booking.startTime) && h < 12) h += 12;
          if (/am/i.test(booking.startTime) && h === 12) h = 0;
          d.setHours(h, m, 0, 0);
        }
      }
      return (d.getTime() - Date.now()) / (1000 * 60 * 60);
    } catch (e) {
      return 0;
    }
  };

  // 12-hour rule: modifiable ONLY if Pending and at least 12 hours remaining
  const isModifiable = (booking) => {
    if (booking.status !== 'Pending') return false;
    const diffHours = getHoursUntilBooking(booking);
    return diffHours >= 12;
  };

  const is12HourRuleApplied = (booking) => {
    const diffHours = getHoursUntilBooking(booking);
    return diffHours < 12;
  };

  const isCancellable = (booking) => {
    if (booking.status !== 'Pending' && booking.status !== 'Approved') return false;
    const diffHours = getHoursUntilBooking(booking);
    return diffHours >= 12;
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await axios.put(`${API_BASE_URL}/reservations/${id}/cancel`, {}, {
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

  const handleOpenModifyModal = async (booking) => {
    setSelectedBooking(booking);
    setModifyError('');
    setModifySuccess('');
    setEnergyAmount(booking.energyAmountKwh?.toString() || '');
    setNotes(booking.notes || '');
    setModifyModalOpen(true);
    setSlotsLoading(true);

    try {
      const rawStationId = booking.stationId;
      const slotsData = await fetchSlots(rawStationId, '', 'available');
      const slots = slotsData.data || slotsData || [];

      let allSlots = [...slots];
      if (booking.slotId && !allSlots.some(s => (s.slotId || s.id) === booking.slotId)) {
        allSlots.push({
          slotId: booking.slotId,
          id: booking.slotId,
          date: booking.reservationDate,
          startTime: booking.startTime || '08:00',
          endTime: booking.endTime || '09:00',
          capacity: booking.energyAmountKwh,
          availableCapacity: 0,
          status: 'Current Slot',
          isCurrentBookingSlot: true
        });
      }

      setAvailableSlots(allSlots);

      const bDate = new Date(booking.reservationDate);
      const bookingDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;

      const dates = [...new Set([
        bookingDateStr,
        ...allSlots.map(s => {
          const d = new Date(s.date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
      ])].filter(dStr => {
        const dObj = new Date(dStr + 'T23:59:59');
        const now = new Date();
        const maxDate = new Date();
        maxDate.setDate(now.getDate() + 7);
        return dObj >= now && dObj <= maxDate;
      }).sort();

      setAvailableDates(dates);
      setSelectedModifyDate(bookingDateStr);
      setSelectedSlotId(booking.slotId);
    } catch (err) {
      console.error('Error loading slots for modification:', err);
      setModifyError('Failed to load slots for this station.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlotId || !energyAmount) {
      setModifyError('Please select a slot and enter energy amount.');
      return;
    }

    const energyVal = parseFloat(energyAmount);
    if (isNaN(energyVal) || energyVal <= 0) {
      setModifyError('Energy amount must be greater than 0.');
      return;
    }

    setModifyLoading(true);
    setModifyError('');
    setModifySuccess('');

    try {
      const payload = {
        reservationDate: selectedModifyDate,
        slotId: selectedSlotId,
        energyAmountKwh: energyVal,
        notes: notes
      };

      const response = await updateReservation(selectedBooking.id, payload);
      if (response && response.success !== false) {
        const updatedReservation = response.data || {
          ...selectedBooking,
          reservationDate: selectedModifyDate,
          slotId: selectedSlotId,
          energyAmountKwh: energyVal,
          notes: notes
        };

        setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, ...updatedReservation } : b));
        setModifySuccess('Reservation updated successfully in database!');

        setTimeout(() => {
          setModifyModalOpen(false);
          setSelectedBooking(null);
        }, 1200);
      } else {
        setModifyError(response?.message || 'Failed to update reservation.');
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      setModifyError(err.response?.data?.message || err.message || 'Failed to update reservation.');
    } finally {
      setModifyLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter !== 'All' && b.status !== filter) return false;

    if (selectedDate) {
      const d = new Date(b.reservationDate);
      const bDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (bDateStr !== selectedDate) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const stationName = (stationsMap[b.stationId] || b.stationName || '').toLowerCase();
      const id = (b.id || '').toLowerCase();
      if (!stationName.includes(q) && !id.includes(q)) return false;
    }

    return true;
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth + 1 - 1, 1).getDay();
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

  const slotsForSelectedDate = availableSlots.filter(s => {
    const sDate = new Date(s.date);
    const sDateStr = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, '0')}-${String(sDate.getDate()).padStart(2, '0')}`;
    return sDateStr === selectedModifyDate;
  });

  const selectedSlotObj = availableSlots.find(s => (s.slotId || s.id) === selectedSlotId);
  const effectiveMaxCapacity = selectedSlotObj
    ? (selectedSlotObj.availableCapacity + (selectedSlotObj.slotId === selectedBooking?.slotId ? (selectedBooking?.energyAmountKwh || 0) : 0))
    : 0;

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full w-full pb-8 overflow-y-auto custom-scrollbar">

      {/* QR Code Modal for Approved Bookings */}
      {qr && <BookingQrModal qr={qr} onClose={() => setQr(null)} />}

      {/* Left Sidebar - Calendar Filter */}
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
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500 cursor-pointer">&lt;</button>
              <span className="text-[11px] font-bold text-charcoal-900 uppercase tracking-widest w-24 text-center">
                {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
              </span>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500 cursor-pointer">&gt;</button>
            </div>
          </div>

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

          <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-lime-400"></div> Approved</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-yellow-300"></div> Pending</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200"></div> Other</div>
          </div>

          {selectedDate && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onClick={() => setSelectedDate(null)}
              className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-charcoal-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> Clear Date Filter
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Main Content - Bookings List */}
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
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${filter === status ? 'bg-white text-charcoal-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-charcoal-900'}`}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by station or ID..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-charcoal-900 placeholder:text-gray-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium text-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading your bookings...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                <Calendar className="w-12 h-12 text-gray-200" />
                <span className="font-medium text-sm">No bookings found for the selected filter.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredBookings.map((booking, idx) => {
                  const modifiable = isModifiable(booking);
                  const cancellable = isCancellable(booking);
                  const is12hLock = is12HourRuleApplied(booking);

                  return (
                    <div
                      key={booking.id || idx}
                      className="border border-gray-100 rounded-2xl p-4 hover:border-lime-200 hover:shadow-sm transition-all flex flex-col gap-4 bg-white relative"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Station Info */}
                        <div className="flex items-center gap-3 w-full md:w-1/4 md:min-w-[140px]">
                          <div className="w-8 h-8 rounded-lg bg-lime-50 border border-lime-100 flex items-center justify-center shrink-0">
                            <Battery className="w-4 h-4 text-lime-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[13px] font-bold text-charcoal-900 truncate">
                              {stationsMap[booking.stationId] || booking.stationName || `Station ${booking.stationId?.substring(0, 6)}`}
                            </h3>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex flex-col gap-0.5 w-full md:w-1/4 md:border-l border-gray-100 md:pl-4">
                          <span className="text-[11px] font-bold text-charcoal-900">
                            {new Date(booking.reservationDate).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500">
                            {booking.startTime && booking.endTime
                              ? `${booking.startTime} - ${booking.endTime}`
                              : new Date(booking.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Energy Amount */}
                        <div className="flex flex-col gap-0.5 w-full md:w-1/5 md:border-l border-gray-100 md:pl-4">
                          <span className="text-[11px] font-bold text-charcoal-900">{booking.energyAmountKwh} kWh</span>
                          <span className="text-[9px] font-semibold text-gray-400 uppercase">Requested</span>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center md:justify-end gap-3 w-full md:flex-1 md:border-l border-gray-100 md:pl-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider shrink-0 ${
                              booking.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>

                            {/* 12-Hour Lock Badge for Pending bookings */}
                            {booking.status === 'Pending' && is12hLock && (
                              <span
                                className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider flex items-center gap-1 shrink-0"
                                title="12-hour rule applies: cannot modify within 12 hours of scheduled slot"
                              >
                                <Clock className="w-2.5 h-2.5" /> 12h Locked
                              </span>
                            )}
                          </div>

                          {/* View QR Button for Approved Bookings */}
                          {booking.status === 'Approved' && (
                            <button
                              type="button"
                              onClick={() => showQr(booking.id)}
                              className="px-3 py-1.5 bg-lime-100 hover:bg-lime-200 text-lime-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              View QR
                            </button>
                          )}

                          {/* Action Buttons */}
                          {(booking.status === 'Pending' || booking.status === 'Approved') && (
                            <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-2">
                              {/* Modify Button */}
                              {booking.status === 'Pending' ? (
                                <button
                                  onClick={() => handleOpenModifyModal(booking)}
                                  disabled={!modifiable}
                                  title={
                                    !modifiable
                                      ? "Cannot modify: 12-hour rule applies (less than 12 hours remaining before scheduled slot)"
                                      : "Modify pending reservation"
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    modifiable
                                      ? "text-gray-500 hover:text-lime-600 hover:bg-lime-50 cursor-pointer"
                                      : "text-gray-300 opacity-40 cursor-not-allowed"
                                  }`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  disabled
                                  title="Cannot modify: Booking already approved by Grid Operator"
                                  className="p-2 text-gray-300 opacity-40 cursor-not-allowed rounded-lg"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}

                              {/* Cancel Button */}
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={!cancellable}
                                title={
                                  !cancellable
                                    ? "Cannot cancel within 12 hours of scheduled slot"
                                    : "Cancel booking"
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  cancellable
                                    ? "text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                    : "text-gray-300 opacity-40 cursor-not-allowed"
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Transfer Status Bar */}
                      {TransferStatusBar && (
                        <div className="border-t border-gray-100 pt-3">
                          <TransferStatusBar status={booking.status} transferStatus={transferStatus[booking.id]} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modify Reservation Modal */}
      {modifyModalOpen && selectedBooking && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh] my-auto border border-gray-100"
          >
            <div className="relative z-10 p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
              {/* Close Button */}
              <button
                onClick={() => setModifyModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-yellow-100 text-yellow-800 tracking-wider">
                    Pending Approval
                  </span>
                  <span className="text-xs text-gray-400 font-bold">
                    ID: {selectedBooking.id?.substring(0, 10)}...
                  </span>
                </div>
                <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">Modify Pending Reservation</h2>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 text-lime-600 shrink-0" />
                  <span>{stationsMap[selectedBooking.stationId] || selectedBooking.stationName || 'Charging Station'}</span>
                </div>
              </div>

              {/* Policy Banner */}
              <div className="bg-amber-50 text-amber-800 text-xs p-4 rounded-2xl mb-6 border border-amber-200 font-medium flex gap-3 items-start shadow-sm">
                <span className="shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </span>
                <p>
                  <strong className="font-bold">Reservation Policy:</strong> Pending reservations can be modified before Grid Operator approval, provided there are at least 12 hours remaining before the scheduled slot. Slot capacity and database records will be automatically updated.
                </p>
              </div>

              {/* Feedback Alerts */}
              {modifyError && (
                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl mb-6 border border-red-100 font-bold flex gap-3 items-start shadow-sm">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{modifyError}</span>
                </div>
              )}

              {modifySuccess && (
                <div className="bg-lime-50 text-lime-700 text-sm p-4 rounded-2xl mb-6 border border-lime-100 font-bold flex gap-3 items-start shadow-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{modifySuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleUpdateBooking} className="flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                  {/* Date Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Date</label>
                    {slotsLoading ? (
                      <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading dates...
                      </div>
                    ) : availableDates.length === 0 ? (
                      <div className="w-full bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                        No available dates within the 7-day scheduling window.
                      </div>
                    ) : (
                      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {availableDates.map(date => {
                          const dateObj = new Date(date + 'T00:00:00');
                          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                          const dayNum = dateObj.getDate();
                          const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                          const isSelected = selectedModifyDate === date;

                          return (
                            <div
                              key={date}
                              onClick={() => {
                                setSelectedModifyDate(date);
                                const firstSlot = availableSlots.find(s => {
                                  const d = new Date(s.date);
                                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === date;
                                });
                                if (firstSlot) {
                                  setSelectedSlotId(firstSlot.slotId || firstSlot.id);
                                }
                              }}
                              className={`flex flex-col items-center justify-center min-w-[70px] py-2 rounded-xl cursor-pointer transition-all border-2 shrink-0 ${
                                isSelected ? 'border-lime-400 bg-lime-50 shadow-sm' : 'border-gray-100 bg-white hover:border-lime-200'
                              }`}
                            >
                              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-lime-700' : 'text-gray-400'}`}>{dayName}</span>
                              <span className={`text-xl font-black ${isSelected ? 'text-charcoal-900' : 'text-gray-700'}`}>{dayNum}</span>
                              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-lime-700' : 'text-gray-400'}`}>{month}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Slot Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Available Operating Slot</label>
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                      required
                      disabled={slotsLoading || slotsForSelectedDate.length === 0}
                    >
                      <option value="">Select a time slot</option>
                      {slotsForSelectedDate.map(slot => {
                        const sid = slot.slotId || slot.id;
                        const isCurrent = sid === selectedBooking.slotId;
                        const avail = slot.availableCapacity + (isCurrent ? selectedBooking.energyAmountKwh : 0);
                        return (
                          <option key={sid} value={sid}>
                            {slot.startTime} – {slot.endTime} (Available: {avail} kWh) {isCurrent ? '• Current Slot' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Energy Amount */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase">Energy Amount (kWh)</label>
                      {effectiveMaxCapacity > 0 && (
                        <span className="text-[11px] font-semibold text-gray-500">
                          Max available: <strong className="text-lime-700">{effectiveMaxCapacity} kWh</strong>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max={effectiveMaxCapacity > 0 ? effectiveMaxCapacity : undefined}
                        value={energyAmount}
                        onChange={(e) => setEnergyAmount(e.target.value)}
                        placeholder="e.g. 25.0"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-16 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">kWh</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Notes & Instructions (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions or notes for the operator..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all resize-none h-20 custom-scrollbar"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-gray-100 pt-6 mt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModifyModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-charcoal-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modifyLoading || !selectedSlotId || !energyAmount}
                    className="bg-lime-400 hover:bg-lime-300 text-charcoal-900 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {modifyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      'Save & Update Reservation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProsumerBookings;
