import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStationById, fetchSlots, createSlot, updateStationStatus, updateSlotStatus, deleteSlot } from '../../services/MicrogridService';
import { MapPin, Battery, Zap, Clock, Calendar, Plus, X, ArrowLeft, User, Activity, Trash2, History, ListChecks, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function StationDetails() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const { user, isGridOperator, isProsumer } = useAuth();

  // Tab state: 'active' | 'history'
  const [activeTab, setActiveTab] = useState('active');

  // New Slot Form State
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotData, setSlotData] = useState({
    date: '',
    startTime: '08:00',
    endTime: '09:00',
    capacity: ''
  });

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // slot object to delete
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    try {
      const stationData = await fetchStationById(id);
      if (isGridOperator() && user && stationData) {
        const opName = (stationData.gridOperatorName || '').toLowerCase().trim();
        const userEmail = (user.email || '').toLowerCase().trim();
        const userName = (user.name || '').toLowerCase().trim();
        const userStationId = user.stationId;

        const isMine =
          (userEmail && opName === userEmail) ||
          (userName && opName === userName) ||
          (userStationId && (stationData.stationId === userStationId || stationData.id === userStationId)) ||
          (opName && userEmail && opName.includes(userEmail)) ||
          (opName && userName && opName.includes(userName));

        if (!isMine) {
          setUnauthorized(true);
          return;
        }
      }
      setStation(stationData);
      
      const slotsData = await fetchSlots(id);
      setSlots(Array.isArray(slotsData) ? slotsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Derived: split slots by status
  const activeSlots = slots.filter(s => s.status !== 'Deleted');
  const deletedSlots = slots.filter(s => s.status === 'Deleted');

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSlot(id, slotData);
      setShowAddSlot(false);
      setSlotData({ ...slotData, capacity: '' });
      loadData();
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

  // Open confirmation dialog
  const handleDeleteClick = (slot) => {
    setDeleteTarget(slot);
  };

  // Confirmed: perform soft delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSlot(deleteTarget.slotId);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="py-24 flex justify-center text-gray-400 font-medium">Loading station details...</div>;
  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-red-500 font-bold text-lg">Access Denied</div>
        <p className="text-gray-500 text-sm">Grid Operators can only view their own assigned station.</p>
        <Link to="/stations" className="text-lime-600 font-semibold hover:underline text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Stations
        </Link>
      </div>
    );
  }
  if (!station) return <div className="py-24 flex justify-center text-gray-400 font-medium">Station not found</div>;

  return (
    <div className="text-charcoal-900 w-full flex flex-col pb-12">

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>

              <h3 className="text-xl font-black text-charcoal-900 text-center mb-2">Delete Time Slot?</h3>
              <p className="text-sm text-gray-500 text-center mb-2">
                Are you sure you want to delete this time slot?
              </p>
              {/* Slot summary */}
              <div className="bg-gray-50 rounded-xl p-3 mb-6 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Slot Details</p>
                <p className="text-sm font-black text-charcoal-900">
                  {new Date(deleteTarget.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm font-bold text-gray-600">
                  {deleteTarget.startTime} → {deleteTarget.endTime}
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1">{deleteTarget.capacity} kW capacity</p>
              </div>

              <p className="text-xs text-gray-400 text-center mb-6">
                This slot will be moved to <span className="font-bold text-charcoal-900">History</span> and will no longer be available for booking.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-charcoal-900 font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Deleting...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Yes, Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Premium Hero Header ── */}
      <div className="relative w-full bg-charcoal-900 overflow-hidden px-8 py-12 lg:px-16 lg:py-16 rounded-b-[3rem] shadow-2xl mb-10 border-b-4 border-lime-400 shrink-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <Link to="/stations" className="text-gray-400 hover:text-lime-400 transition-colors font-semibold text-sm flex items-center gap-2 w-fit mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Stations
            </Link>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{station.name}</h1>
                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 ${
                  station.status === 'Active' 
                    ? 'bg-lime-400 text-charcoal-900 border border-lime-400' 
                    : 'bg-red-500 text-white border border-red-500'
                }`}>
                  <Activity className="w-3 h-3" /> {station.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-2">
                <p className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-lime-400" /> {station.address}
                </p>
                {station.gridOperatorName && (
                  <p className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-lime-400" /> Operator: <span className="text-white font-bold">{station.gridOperatorName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {!isProsumer() && (
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                to={`/stations/${station.stationId}/edit`}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl"
              >
                Edit Config
              </Link>
              <button 
                onClick={handleToggleStatus}
                className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-xl border ${
                  station.status === 'Active' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500' 
                    : 'bg-lime-400 border-lime-400 text-charcoal-900 hover:bg-lime-500 hover:border-lime-500'
                }`}
              >
                {station.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex-1 space-y-8 px-4 md:px-8">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100 hover:border-lime-200 hover:-translate-y-1 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-lime-50 transition-colors">
              <MapPin className="w-5 h-5 text-gray-400 group-hover:text-lime-500" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Coordinates</p>
            <p className="font-bold text-charcoal-900 leading-tight">{station.latitude.toFixed(4)}<br/>{station.longitude.toFixed(4)}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100 hover:border-lime-200 hover:-translate-y-1 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-lime-50 transition-colors">
              <Zap className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Capacity</p>
            <p className="font-black text-charcoal-900 text-3xl">{station.capacity}<span className="text-sm text-gray-500 font-bold ml-1">kW</span></p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100 hover:border-lime-200 hover:-translate-y-1 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-lime-50 transition-colors">
              <Battery className="w-5 h-5 text-gray-400 group-hover:text-lime-500" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Battery Size</p>
            <p className="font-black text-charcoal-900 text-3xl">{station.batteryCapacity}<span className="text-sm text-gray-500 font-bold ml-1">kWh</span></p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100 hover:border-lime-200 hover:-translate-y-1 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-lime-50 transition-colors">
              <Battery className="w-5 h-5 text-gray-400 group-hover:text-lime-500" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Storage</p>
            <p className="font-black text-charcoal-900 text-3xl">{station.availableStorage}<span className="text-sm text-gray-500 font-bold ml-1">slots</span></p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100 hover:border-lime-200 hover:-translate-y-1 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-lime-50 transition-colors">
              <Clock className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hours</p>
            <p className="font-bold text-charcoal-900">{station.openingTime}<br/><span className="text-gray-400 text-sm">to</span> {station.closingTime}</p>
          </motion.div>
        </div>

        {/* ── Energy Slots Section ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/30">
            <div>
              <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">Energy Slots</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {isProsumer() ? 'Available energy transfer slots for booking' : 'Manage energy transfer availability for this station'}
              </p>
            </div>
            {!showAddSlot && !isProsumer() && activeTab === 'active' && (
              <button 
                onClick={() => setShowAddSlot(true)}
                className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-lime-400/30 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" /> Add New Slot
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="px-8 pt-5 flex items-center gap-1 border-b border-gray-100">
            <button
              onClick={() => { setActiveTab('active'); setShowAddSlot(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'active'
                  ? 'bg-lime-400 text-charcoal-900 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              Active Slots
              {activeSlots.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'active' ? 'bg-charcoal-900/10' : 'bg-gray-200'}`}>
                  {activeSlots.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('history'); setShowAddSlot(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              History
              {deletedSlots.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {deletedSlots.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Add Slot Form ── */}
          {showAddSlot && activeTab === 'active' && (
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
                      type="date" required value={slotData.date} 
                      onChange={e => setSlotData({...slotData, date: e.target.value})} 
                      className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-lime-400 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-2">Start Time</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-charcoal-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="time" required value={slotData.startTime} 
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
                        type="time" required value={slotData.endTime} 
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
                        type="number" min="0.1" step="any" required value={slotData.capacity} 
                        onChange={e => setSlotData({...slotData, capacity: Number(e.target.value)})} 
                        className="w-full pl-10 pr-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-lime-400 transition-colors" 
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button 
                    type="submit" disabled={isSubmitting}
                    className="bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-charcoal-900 px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-lime-400/10"
                  >
                    {isSubmitting ? 'Creating...' : 'Confirm & Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Active Slots Tab ── */}
          {activeTab === 'active' && (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate" style={{ borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Date</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Window</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacity</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSlots.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl">
                        No energy slots have been configured for this station yet.
                      </td>
                    </tr>
                  ) : (
                    activeSlots.map(slot => (
                      <tr key={slot.slotId} className="bg-white hover:bg-gray-50 transition-colors shadow-sm border border-gray-100 rounded-2xl group">
                        <td className="px-6 py-5 whitespace-nowrap pl-8 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-lime-200 transition-colors">
                          <div className="text-sm font-black text-charcoal-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                              <Calendar className="w-4 h-4 text-gray-500 group-hover:text-lime-600" />
                            </div>
                            {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap border-y border-gray-100 group-hover:border-y-lime-200 transition-colors">
                          <div className="text-[13px] font-bold text-charcoal-700 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {slot.startTime} &rarr; {slot.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap border-y border-gray-100 group-hover:border-y-lime-200 transition-colors">
                          <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-gray-400">Available</span>
                              <span className="text-charcoal-900">{slot.availableCapacity}/{slot.capacity} kW</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-lime-400 rounded-full" 
                                style={{ width: `${(slot.availableCapacity / slot.capacity) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap border-y border-gray-100 group-hover:border-y-lime-200 transition-colors">
                          <span className={`px-3 py-1.5 text-[11px] font-black tracking-wide rounded-lg uppercase ${
                            slot.status === 'Available' 
                              ? 'bg-lime-100 text-lime-700' 
                              : slot.status === 'Full' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            {slot.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right pr-8 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-lime-200 transition-colors">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Available/Full */}
                            {!isProsumer() && (
                              <button 
                                onClick={() => handleToggleSlotStatus(slot.slotId, slot.status)}
                                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${
                                  slot.status === 'Available'
                                    ? 'bg-white border border-gray-200 text-charcoal-900 hover:bg-gray-50'
                                    : 'bg-lime-50 border border-lime-200 text-lime-700 hover:bg-lime-100'
                                }`}
                              >
                                {slot.status === 'Available' ? 'Mark Full' : 'Mark Available'}
                              </button>
                            )}
                            {/* Delete button — grid operator only */}
                            {!isProsumer() && (
                              <button
                                onClick={() => handleDeleteClick(slot)}
                                title="Delete this slot"
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-500 text-red-400 hover:text-white border border-red-100 hover:border-red-500 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── History Tab ── */}
          {activeTab === 'history' && (
            <div className="overflow-x-auto p-4">
              {deletedSlots.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <History className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="font-semibold text-sm">No deleted slots yet</p>
                  <p className="text-xs text-gray-300 text-center max-w-xs">Slots you delete from the Active tab will appear here as a record.</p>
                </div>
              ) : (
                <table className="w-full text-left border-separate" style={{ borderSpacing: '0 8px' }}>
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-8">Date</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Window</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Original Capacity</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedSlots.map(slot => (
                      <tr key={slot.slotId} className="bg-gray-50/60 rounded-2xl opacity-75 group">
                        <td className="px-6 py-4 whitespace-nowrap pl-8 rounded-l-2xl border-y border-l border-gray-100 transition-colors">
                          <div className="text-sm font-black text-gray-500 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-y border-gray-100">
                          <div className="text-[13px] font-bold text-gray-400 flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg w-fit line-through">
                            <Clock className="w-3.5 h-3.5 text-gray-300" />
                            {slot.startTime} → {slot.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-y border-gray-100">
                          <span className="text-sm font-bold text-gray-400">{slot.capacity} kW</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-y border-r border-gray-100 rounded-r-2xl">
                          <span className="px-3 py-1.5 text-[11px] font-black tracking-wide rounded-lg uppercase bg-red-50 text-red-400">
                            Deleted
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
