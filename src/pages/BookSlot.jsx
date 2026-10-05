import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchSlots } from '../services/MicrogridService';
import { reservationAPI } from '../services/api';

export default function BookSlot() {
  const { id } = useParams();
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [energy, setEnergy] = useState('1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots(id)
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setError('Slots for this station could not be loaded.'));
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    const slot = slots.find((item) => item.slotId === slotId);
    if (!slot) return;
    setError('');
    setMessage('');
    try {
      const response = await reservationAPI.create({
        prosumerNic: user?.nic,
        stationId: id,
        slotId: slot.slotId,
        reservationDate: slot.date,
        energyAmountKwh: Number(energy),
      });
      setMessage(response.message || 'Booking request sent. A grid operator must approve it before the QR is issued.');
    } catch (err) {
      setError(err.response?.data?.message || 'The booking could not be created.');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-charcoal-900">Book a slot</h1>
      <p className="text-sm text-gray-500 mt-2">This creates a pending reservation. The QR is issued only after a grid operator approves it.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">
          Slot
          <select value={slotId} onChange={(event) => setSlotId(event.target.value)} required className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
            <option value="">Select a slot</option>
            {slots.map((slot) => (
              <option key={slot.slotId} value={slot.slotId}>
                {new Date(slot.date).toLocaleDateString()} {slot.startTime}–{slot.endTime} ({slot.availableCapacity} kWh free)
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Energy (kWh)
          <input type="number" min="0.1" step="0.1" value={energy} onChange={(event) => setEnergy(event.target.value)} required className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
        </label>
        <button type="submit" className="w-full py-3 rounded-2xl bg-lime-300 font-bold text-charcoal-900">Request booking</button>
      </form>
      {message && <p className="mt-4 text-sm font-medium text-lime-700">{message}</p>}
      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
