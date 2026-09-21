import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStationById, fetchSlots, createSlot, updateStationStatus } from '../../services/MicrogridService';

export default function StationDetails() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Slot Form State
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotData, setSlotData] = useState({
    date: '',
    startTime: '08:00',
    endTime: '09:00',
    capacity: 10
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const stationData = await fetchStationById(id);
      setStation(stationData);
      
      const slotsData = await fetchSlots(id);
      setSlots(slotsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await createSlot(id, slotData);
      setShowAddSlot(false);
      loadData(); // refresh slots
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = station.status === 'Active' ? 'Inactive' : 'Active';
      await updateStationStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!station) return <div className="p-8">Station not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Station Details Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{station.name}</h1>
            <p className="text-gray-500">{station.address}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${station.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {station.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Coordinates</p>
            <p className="font-medium">{station.latitude}, {station.longitude}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Capacity</p>
            <p className="font-medium">{station.capacity} kW</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Battery Capacity</p>
            <p className="font-medium">{station.batteryCapacity} kWh</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Available Storage</p>
            <p className="font-medium">{station.availableStorage} slots</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Operating Hours</p>
            <p className="font-medium">{station.openingTime} - {station.closingTime}</p>
          </div>
        </div>

        <div className="mt-6 flex space-x-4 border-t pt-4">
          <button 
            onClick={handleToggleStatus}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            {station.status === 'Active' ? 'Deactivate Station' : 'Activate Station'}
          </button>
          <Link to="/stations" className="px-4 py-2 text-blue-600 hover:underline flex items-center">
            &larr; Back to Stations
          </Link>
        </div>
      </div>

      {/* Energy Slots Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Energy Slots</h2>
          <button 
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            {showAddSlot ? 'Cancel' : 'Add Slot'}
          </button>
        </div>

        {showAddSlot && (
          <form onSubmit={handleCreateSlot} className="bg-gray-50 p-4 rounded-lg mb-6 border">
            <div className="grid grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium mb-1">Date</label>
                <input type="date" required value={slotData.date} onChange={e => setSlotData({...slotData, date: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Start Time (HH:MM)</label>
                <input type="time" required value={slotData.startTime} onChange={e => setSlotData({...slotData, startTime: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">End Time (HH:MM)</label>
                <input type="time" required value={slotData.endTime} onChange={e => setSlotData({...slotData, endTime: e.target.value})} className="w-full border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Capacity (kW)</label>
                <input type="number" min="0.1" step="any" required value={slotData.capacity} onChange={e => setSlotData({...slotData, capacity: Number(e.target.value)})} className="w-full border p-2 rounded text-sm" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm">Create Slot</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border-b text-sm">Date</th>
                <th className="p-3 border-b text-sm">Time</th>
                <th className="p-3 border-b text-sm">Capacity</th>
                <th className="p-3 border-b text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">No slots created yet.</td>
                </tr>
              ) : (
                slots.map(slot => (
                  <tr key={slot.slotId} className="hover:bg-gray-50">
                    <td className="p-3 border-b text-sm">{new Date(slot.date).toLocaleDateString()}</td>
                    <td className="p-3 border-b text-sm">{slot.startTime} - {slot.endTime}</td>
                    <td className="p-3 border-b text-sm">{slot.availableCapacity} / {slot.capacity} kW</td>
                    <td className="p-3 border-b text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        slot.status === 'Available' ? 'bg-green-100 text-green-800' : 
                        slot.status === 'Full' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {slot.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
