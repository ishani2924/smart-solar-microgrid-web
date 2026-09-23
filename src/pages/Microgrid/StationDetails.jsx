import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStationById, fetchSlots, createSlot, updateStationStatus, updateSlotStatus } from '../../services/MicrogridService';

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

  const handleToggleSlotStatus = async (slotId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Full' : 'Available';
      await updateSlotStatus(slotId, newStatus);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="py-24 flex justify-center text-gray-400 font-medium">Loading station details...</div>;
  if (!station) return <div className="py-24 flex justify-center text-gray-400 font-medium">Station not found</div>;

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <Link to="/stations" className="text-lime-600 hover:text-lime-700 transition-colors font-semibold text-sm flex items-center gap-2 mb-2 w-fit">
            &larr; Back to Stations
          </Link>
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">{station.name}</h1>
          <p className="text-gray-500 text-sm font-medium">{station.address}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            station.status === 'Active' 
              ? 'bg-[#E3F8B3] text-[#557711]' 
              : 'bg-red-100 text-red-600'
          }`}>
            {station.status}
          </span>
          <button 
            onClick={handleToggleStatus}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            {station.status === 'Active' ? 'Deactivate Station' : 'Activate Station'}
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex-1 space-y-8">
        {/* Station Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-charcoal-900 mb-6">Station Configuration</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Coordinates</p>
              <p className="font-semibold text-charcoal-900">{station.latitude}, {station.longitude}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Capacity</p>
              <p className="font-semibold text-charcoal-900">{station.capacity} kW</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Battery Capacity</p>
              <p className="font-semibold text-charcoal-900">{station.batteryCapacity} kWh</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Available Storage</p>
              <p className="font-semibold text-charcoal-900">{station.availableStorage} slots</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Operating Hours</p>
              <p className="font-semibold text-charcoal-900">{station.openingTime} - {station.closingTime}</p>
            </div>
          </div>
        </div>

        {/* Energy Slots Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-charcoal-900">Energy Slots</h2>
            <button 
              onClick={() => setShowAddSlot(!showAddSlot)}
              className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
            >
              {showAddSlot ? 'Cancel' : 'Add New Slot'}
            </button>
          </div>

          {showAddSlot && (
            <div className="bg-gray-50/50 p-8 border-b border-gray-100">
              <form onSubmit={handleCreateSlot}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                    <input type="date" required value={slotData.date} onChange={e => setSlotData({...slotData, date: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Time (HH:MM)</label>
                    <input type="time" required value={slotData.startTime} onChange={e => setSlotData({...slotData, startTime: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Time (HH:MM)</label>
                    <input type="time" required value={slotData.endTime} onChange={e => setSlotData({...slotData, endTime: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Capacity (kW)</label>
                    <input type="number" min="0.1" step="any" required value={slotData.capacity} onChange={e => setSlotData({...slotData, capacity: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow shadow-sm" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button type="submit" className="bg-charcoal-900 hover:bg-black text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm">
                    Create Slot
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">DATE</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">TIME</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">CAPACITY</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">STATUS</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-medium">No slots created yet.</td>
                  </tr>
                ) : (
                  slots.map(slot => (
                    <tr key={slot.slotId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-[13px] font-semibold text-charcoal-900">{new Date(slot.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[13px] font-medium text-gray-500">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[13px] font-semibold text-charcoal-900">
                        {slot.availableCapacity} / {slot.capacity} kW
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                          slot.status === 'Available' ? 'bg-[#E3F8B3] text-[#557711]' : 
                          slot.status === 'Full' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {slot.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <button 
                          onClick={() => handleToggleSlotStatus(slot.slotId, slot.status)}
                          className="text-[13px] font-semibold text-lime-600 hover:text-lime-700 transition-colors"
                        >
                          {slot.status === 'Available' ? 'Mark Full' : 'Mark Available'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
