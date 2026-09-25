import { useState } from 'react';
import { transferAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const BookingConfirmation = () => {
  const { user } = useAuth();
  const [reservationId, setReservationId] = useState('');
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canIssue = user?.role === 'GridOperator' || user?.role === 'Backoffice' || user?.role === 'Admin';

  const loadConfirmation = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setBooking(null);
    try {
      const response = await transferAPI.getConfirmation(reservationId.trim());
      setBooking(response.data);
      setMessage(response.message || response.data?.message || '');
    } catch (err) {
      setError(err.response?.data?.message || 'No confirmation was found for that booking.');
    } finally {
      setLoading(false);
    }
  };

  const issueQr = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await transferAPI.issueQr(reservationId.trim());
      setBooking(response.data);
      setMessage(response.message || response.data?.message || '');
    } catch (err) {
      setError(err.response?.data?.message || 'QR could not be issued. The booking must be Approved.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-2xl font-bold text-charcoal-900">Booking confirmation</h2>
      <p className="text-sm text-gray-500 mt-2">
        After a Grid Operator approves a booking, issue the QR here. The prosumer shows that same QR at the slot time.
      </p>

      <form onSubmit={loadConfirmation} className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          value={reservationId}
          onChange={(event) => setReservationId(event.target.value)}
          placeholder="Reservation id"
          required
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
        />
        <button type="submit" disabled={loading} className="px-5 py-3 rounded-xl bg-charcoal-900 text-white font-semibold">
          View QR
        </button>
        {canIssue && (
          <button type="button" onClick={issueQr} disabled={loading || !reservationId.trim()} className="px-5 py-3 rounded-xl bg-lime-400 text-charcoal-900 font-semibold">
            Issue QR
          </button>
        )}
      </form>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm font-medium text-lime-700">{message}</p>}

      {booking && (
        <div className="mt-8 grid md:grid-cols-2 gap-6 items-center">
          <img
            alt="Booking QR code"
            className="w-56 h-56 border border-gray-100 rounded-2xl"
            src={`data:image/png;base64,${booking.qrImageBase64}`}
          />
          <div className="text-sm space-y-2">
            <p><span className="font-semibold">Status:</span> {booking.transferStatus}</p>
            <p><span className="font-semibold">Station:</span> {booking.stationName || booking.stationId}</p>
            <p><span className="font-semibold">NIC:</span> {booking.prosumerNic}</p>
            <p><span className="font-semibold">Date:</span> {new Date(booking.reservationDate).toLocaleDateString()}</p>
            <p><span className="font-semibold">Time:</span> {booking.startTime} - {booking.endTime}</p>
            <p><span className="font-semibold">Energy:</span> {booking.energyAmountKwh} kWh</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
