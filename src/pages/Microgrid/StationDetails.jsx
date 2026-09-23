import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStationById, fetchSlots, createSlot, updateStationStatus, updateSlotStatus } from '../../services/MicrogridService';
import { MapPin, Battery, Zap, Clock, Calendar, Plus, X, ArrowLeft } from 'lucide-react';

export default function StationDetails() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Slot Form State
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotData, setSlotData] = useState({
    date: '',
    startTime: '08:00',
    endTime: '09:00',
    capacity: ''
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
    setIsSubmitting(true);
    try {
      await createSlot(id, slotData);
      setShowAddSlot(false);
      setSlotData({ ...slotData, capacity: '' }); // reset capacity
      loadData(); // refresh slots
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
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
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-12">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <Link to="/stations" className="text-lime-600 hover:text-lime-700 transition-colors font-semibold text-sm flex items-center gap-2 mb-2 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Stations
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">{station.name}</h1>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
              station.status === 'Active' 
                ? 'bg-[#E3F8B3] text-[#557711] border border-[#d2f38d]' 
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {station.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" /> {station.address}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to={`/stations/${station.stationId}/edit`}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
          >
            Edit Configuration
          </Link>
          <button 
            onClick={handleToggleStatus}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm border ${
              station.status === 'Active' 
                ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' 
                : 'bg-charcoal-900 text-white hover:bg-black border-transparent'
            }`}
          >
            {station.status === 'Active' ? 'Deactivate Station' : 'Activate Station'}
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex-1 space-y-8">
        {/* Station Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-lime-600">
                <MapPin className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Coordinates</p>
              </div>
              <p className="font-bold text-charcoal-900">{station.latitude}<br/>{station.longitude}</p>
            </div>
            
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-lime-600">
                <Zap className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Capacity</p>
              </div>
              <p className="font-bold text-charcoal-900 text-xl">{station.capacity} <span className="text-sm text-gray-500 font-medium">kW</span></p>
            </div>
            
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-lime-600">
                <Battery className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Battery</p>
              </div>
              <p className="font-bold text-charcoal-900 text-xl">{station.batteryCapacity} <span className="text-sm text-gray-500 font-medium">kWh</span></p>
            </div>
            
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-lime-600">
                <Battery className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Storage</p>
              </div>
              <p className="font-bold text-charcoal-900 text-xl">{station.availableStorage} <span className="text-sm text-gray-500 font-medium">slots</span></p>
            </div>
            
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-lime-600">
                <Clock className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Hours</p>
              </div>
              <p className="font-bold text-charcoal-900">{station.openingTime} - {station.closingTime}</p>
            </div>
          </div>
        </div>

        {/* Energy Slots Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900">Energy Slots</h2>
              <p className="text-sm text-gray-500 mt-1">Manage energy transfer availability for this station</p>
            </div>
            {!showAddSlot && (
              <button 
                onClick={() => setShowAddSlot(true)}
                className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-3 rounded-xl font-bold transition-all shadow-sm shadow-lime-400/20 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add New Slot
              </button>
            )}
          </div>

          {showAddSlot && (
            <div className="bg-charcoal-900 p-8 border-b border-charcoal-800 text-white relative">
              <button 
                onClick={() => setShowAddSlot(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-charcoal-800 hover:bg-charcoal-700 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-lime-400" /> Create Availability Slot
                </h3>
                <p className="text-charcoal-400 text-sm mt-1">Configure date, time, and capacity constraints for prosumers to book.</p>
              </div>

              <form onSubmit={handleCreateSlot}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-2">Date</label>
                    <input 
                      type="date" 
                      required 
                      value={slotData.date} 
                      onChange={e => setSlotData({...slotData, date: e.target.value})} 
                      className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-lime-400 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-2">Start Time</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-charcoal-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="time" 
                        required 
                        value={slotData.startTime} 
                        onChange={e => setSlotData({...slotData, startTime: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-lime-400 transition-colors" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-2">End Time</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-charcoal-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="time" 
                        required 
                        value={slotData.endTime} 
                        onChange={e => setSlotData({...slotData, endTime: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-lime-400 transition-colors" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-2">Capacity (kW)</label>
                    <div className="relative">
                      <Zap className="w-4 h-4 text-charcoal-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="number" 
                        min="0.1" 
                        step="any" 
                        required 
                        value={slotData.capacity} 
                        onChange={e => setSlotData({...slotData, capacity: Number(e.target.value)})} 
                        className="w-full pl-10 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-lime-400 transition-colors" 
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-charcoal-900 px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-lime-400/10"
                  >
                    {isSubmitting ? 'Creating...' : 'Confirm & Create Slot'}
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
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">TIME (24H)</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">CAPACITY REMAINING</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">STATUS</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-medium">
                      No energy slots have been configured for this station yet.
                    </td>
                  </tr>
                ) : (
                  slots.map(slot => (
                    <tr key={slot.slotId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-[13px] font-bold text-charcoal-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {slot.startTime} &rarr; {slot.endTime}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[120px] h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-lime-400" 
                              style={{ width: `${(slot.availableCapacity / slot.capacity) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-[13px] font-bold text-charcoal-900">
                            {slot.availableCapacity}<span className="text-gray-400 font-medium">/{slot.capacity} kW</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                          slot.status === 'Available' 
                            ? 'bg-[#E3F8B3] text-[#557711] border-[#d2f38d]' 
                            : slot.status === 'Full' 
                              ? 'bg-orange-50 text-orange-700 border-orange-200' 
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {slot.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleToggleSlotStatus(slot.slotId, slot.status)}
                          className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
                            slot.status === 'Available'
                              ? 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'
                              : 'bg-white border-lime-200 text-lime-700 hover:bg-[#F2FBE0]'
                          }`}
                        >
                          {slot.status === 'Available' ? 'Mark as Full' : 'Mark Available'}
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
