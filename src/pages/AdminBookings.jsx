import React, { useEffect, useState } from 'react';
import { reservationAPI } from '../services/api';
import { fetchStationById, fetchSlots } from '../services/MicrogridService';
import { Calendar, Clock, MapPin, Zap, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Pending');
  
  const { user } = useAuth();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await reservationAPI.getAllReservations();
      if (response.success) {
        // Hydrate bookings with station and slot data
        const bookingsData = response.data || [];
        const hydratedBookings = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const station = await fetchStationById(booking.stationId);
              const slotsData = await fetchSlots(booking.stationId);
              const slot = slotsData.find(s => s.slotId === booking.slotId || s.id === booking.slotId);
              return { ...booking, station, slot };
            } catch (e) {
              return booking;
            }
          })
        );
        // Sort by date descending
        hydratedBookings.sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));
        setBookings(hydratedBookings);
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action) => {
    setProcessingId(id);
    try {
      let response;
      if (action === 'approve') {
        response = await reservationAPI.approveReservation(id);
      } else if (action === 'complete') {
        response = await reservationAPI.completeReservation(id);
      } else if (action === 'cancel') {
        response = await reservationAPI.cancelReservation(id);
      }

      if (response && response.success) {
        await loadBookings();
      } else {
        alert(response?.message || `Failed to ${action} reservation`);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Pending</span>;
      case 'Approved':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Approved</span>;
      case 'Completed':
        return <span className="px-3 py-1 bg-lime-100 text-lime-700 text-xs font-bold rounded-full">Completed</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
        <p className="font-medium">Loading bookings...</p>
      </div>
    );
  }

  const filteredBookings = statusFilter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-charcoal-900 tracking-tight">Booking Management</h1>
          <p className="text-gray-500 font-medium mt-1">Manage energy transfer reservations for your stations.</p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['Pending', 'Approved', 'Completed', 'Cancelled', 'All'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                statusFilter === status 
                  ? 'bg-white text-charcoal-900 shadow-sm' 
                  : 'text-gray-500 hover:text-charcoal-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {filteredBookings.length === 0 && !error ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-900 mb-2">No {statusFilter !== 'All' ? statusFilter : ''} Bookings Found</h3>
          <p className="text-gray-500 max-w-sm">There are currently no {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} energy transfer reservations for your stations.</p>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
            <div className="w-[15%] pl-2">PROSUMER NIC</div>
            <div className="w-[20%]">STATION</div>
            <div className="w-[15%]">DATE & TIME</div>
            <div className="w-[15%]">ENERGY</div>
            <div className="w-[15%]">STATUS</div>
            <div className="w-[20%] text-right pr-4">ACTIONS</div>
          </div>

          {/* List */}
          <div className="flex flex-col gap-3">
            {filteredBookings.map(booking => (
              <div key={booking.id || booking.reservationId} className="flex items-center px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-lime-200 hover:shadow-md transition-all relative overflow-hidden group">
                {/* Colored left accent based on status */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                  booking.status === 'Pending' ? 'bg-yellow-400' :
                  booking.status === 'Approved' ? 'bg-blue-400' :
                  booking.status === 'Completed' ? 'bg-lime-400' :
                  'bg-red-400'
                }`}></div>

                {/* Prosumer NIC */}
                <div className="w-[15%] pl-2">
                  <span className="font-bold text-charcoal-900 text-sm">{booking.prosumerNic}</span>
                </div>

                {/* Station */}
                <div className="w-[20%] flex items-center gap-2 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-bold text-sm text-gray-700 truncate">{booking.station?.name || booking.stationId}</span>
                </div>

                {/* Date & Time */}
                <div className="w-[15%] flex flex-col justify-center">
                  <span className="font-bold text-sm text-gray-700">{new Date(booking.reservationDate).toLocaleDateString()}</span>
                  <span className="text-xs font-semibold text-gray-400">{booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'Unknown'}</span>
                </div>

                {/* Energy */}
                <div className="w-[15%] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-black text-charcoal-900 text-sm">{booking.energyAmountKwh} <span className="text-[10px] font-bold text-gray-500">kWh</span></span>
                </div>

                {/* Status */}
                <div className="w-[15%]">
                  {getStatusBadge(booking.status)}
                </div>

                {/* Actions */}
                <div className="w-[20%] flex items-center justify-end gap-2 pr-4">
                  {booking.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'approve')}
                        disabled={processingId === booking.id}
                        className="px-3 py-1.5 flex items-center gap-1.5 bg-lime-100 text-lime-700 hover:bg-lime-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'cancel')}
                        disabled={processingId === booking.id}
                        className="px-3 py-1.5 flex items-center gap-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </>
                  )}

                  {booking.status === 'Approved' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'complete')}
                        disabled={processingId === booking.id}
                        className="px-3 py-1.5 flex items-center gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'cancel')}
                        disabled={processingId === booking.id}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {['Completed', 'Cancelled'].includes(booking.status) && (
                    <span className="text-xs font-bold text-gray-300">No actions</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
