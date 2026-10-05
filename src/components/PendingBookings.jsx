import { useEffect, useState } from 'react';
import { reservationAPI, transferAPI } from '../services/api';

export default function PendingBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const response = await reservationAPI.getPending();
      const list = response.data || response;
      setBookings(Array.isArray(list) ? list : []);
    } catch {
      setError('Pending bookings could not be loaded.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    setError('');
    setMessage('');
    try {
      await reservationAPI.approve(id);
      await transferAPI.issueQr(id);
      setMessage('Booking approved and QR issued.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'The booking could not be approved.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-charcoal-900">Pending bookings</h2>
      <p className="text-sm text-gray-500 mt-1">Approve a booking to issue the prosumer QR.</p>
      {message && <p className="mt-3 text-sm font-medium text-lime-700">{message}</p>}
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-4 flex flex-col gap-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
            <div>
              <p className="font-bold text-sm">{booking.stationName || booking.stationId}</p>
              <p className="text-xs text-gray-500">{booking.prosumerNic} · {new Date(booking.reservationDate).toLocaleDateString()} {booking.startTime}–{booking.endTime}</p>
            </div>
            <button type="button" onClick={() => approve(booking.id)} className="px-4 py-2 rounded-xl bg-lime-300 font-bold text-sm">Approve</button>
          </div>
        ))}
        {bookings.length === 0 && !error && <p className="text-sm text-gray-500">No pending bookings.</p>}
      </div>
    </div>
  );
}
