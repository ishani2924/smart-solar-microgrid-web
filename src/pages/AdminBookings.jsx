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

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-charcoal-900 tracking-tight">Booking Management</h1>
          <p className="text-gray-500 font-medium mt-1">Manage energy transfer reservations for your stations.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-500 max-w-sm">There are currently no energy transfer reservations for your stations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking.id || booking.reservationId} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
              {/* Colored top accent based on status */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                booking.status === 'Pending' ? 'bg-yellow-400' :
                booking.status === 'Approved' ? 'bg-blue-400' :
                booking.status === 'Completed' ? 'bg-lime-400' :
                'bg-red-400'
              }`}></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Prosumer NIC</p>
                  <p className="font-black text-charcoal-900">{booking.prosumerNic}</p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="flex flex-col gap-4 mb-6 flex-1">
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                  <Calendar className="w-4 h-4 text-lime-600 shrink-0" />
                  <span className="font-bold">{new Date(booking.reservationDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-bold">
                    {booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'Unknown Time'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-bold">{booking.station?.name || booking.stationId}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl border border-lime-100">
                  <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                  <span className="font-black text-charcoal-900 text-base">{booking.energyAmountKwh} <span className="text-xs font-bold text-gray-500">kWh</span></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100">
                {booking.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(booking.id, 'approve')}
                      disabled={processingId === booking.id}
                      className="flex-1 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      {processingId === booking.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => handleStatusChange(booking.id, 'cancel')}
                      disabled={processingId === booking.id}
                      className="flex-1 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      {processingId === booking.id ? 'Processing...' : 'Decline'}
                    </button>
                  </div>
                )}

                {booking.status === 'Approved' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(booking.id, 'complete')}
                      disabled={processingId === booking.id}
                      className="flex-1 bg-lime-400 hover:bg-lime-500 text-charcoal-900 py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {processingId === booking.id ? 'Processing...' : 'Mark Completed'}
                    </button>
                    <button 
                      onClick={() => handleStatusChange(booking.id, 'cancel')}
                      disabled={processingId === booking.id}
                      className="flex-[0.5] bg-red-50 hover:bg-red-500 text-red-600 hover:text-white py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center"
                      title="Cancel Booking"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {['Completed', 'Cancelled'].includes(booking.status) && (
                  <div className="text-center py-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-400">
                    No actions available
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
