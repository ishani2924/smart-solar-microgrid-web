import React, { useState, useEffect } from 'react';
import { createStation } from '../../services/MicrogridService';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Zap, Clock, Battery, BatteryCharging, ArrowLeft, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationPickerMap from '../../components/LocationPickerMap';

export default function CreateStation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gridOperatorName: user?.email || user?.name || '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    batteryCapacity: 0,
    availableStorage: '',
    openingTime: '08:00',
    closingTime: '18:00'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6))
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createStation(formData);
      navigate('/stations');
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="text-charcoal-900 w-full flex flex-col pb-12">
      {/* Premium Hero Header */}
      <div className="relative w-full bg-charcoal-900 overflow-hidden px-8 py-10 lg:px-16 lg:py-12 rounded-b-[3rem] shadow-2xl mb-10 border-b-4 border-lime-400 shrink-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#a3e635 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-4">
          <Link to="/stations" className="text-gray-400 hover:text-lime-400 transition-colors font-semibold text-sm flex items-center gap-2 w-fit mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Stations
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Create New Station</h1>
            <p className="text-gray-400 text-sm font-medium">Configure a new microgrid station for the network.</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-7xl mx-auto flex-1 px-4 md:px-8">
        <motion.form 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          onSubmit={handleSubmit} 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          
          {/* Left Side: Station Details */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Identity Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lime-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-charcoal-900">Station Identity</h2>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Station Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 font-bold focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all shadow-sm" 
                    placeholder="e.g. Colombo South Solar Hub"
                  />
                </div>
                
              </div>
            </motion.div>

            {/* Capabilities Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lime-500">
                  <Zap className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-charcoal-900">Power & Capabilities</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    <Zap className="w-3.5 h-3.5" /> Total Capacity (kW)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    step="any" 
                    name="capacity" 
                    required 
                    value={formData.capacity} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-bold shadow-sm" 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    <BatteryCharging className="w-3.5 h-3.5" /> Slots
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    name="availableStorage" 
                    required 
                    value={formData.availableStorage} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-bold shadow-sm" 
                  />
                </div>
              </div>
            </motion.div>

            {/* Operating Hours Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-500">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-charcoal-900">Operating Hours</h2>
              </div>
              <div className="p-6 flex gap-5">
                <div className="flex-1">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Opening</label>
                  <input 
                    type="time" 
                    name="openingTime" 
                    required 
                    value={formData.openingTime} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 font-bold focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Closing</label>
                  <input 
                    type="time" 
                    name="closingTime" 
                    required 
                    value={formData.closingTime} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 font-bold focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Location & Map */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col h-full">
              <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lime-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-charcoal-900">Location & Coordinates</h2>
              </div>
              
              <div className="p-8 flex flex-col gap-6 flex-1">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Physical Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all shadow-sm" 
                    placeholder="Full physical address"
                  />
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Latitude</label>
                    <input 
                      type="number" 
                      step="any" 
                      name="latitude" 
                      required 
                      value={formData.latitude} 
                      onChange={handleChange} 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Longitude</label>
                    <input 
                      type="number" 
                      step="any" 
                      name="longitude" 
                      required 
                      value={formData.longitude} 
                      onChange={handleChange} 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                </div>

                <div className="flex-1 min-h-[300px] flex flex-col mt-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Interactive Map</label>
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex-1">
                    <LocationPickerMap 
                      latitude={formData.latitude} 
                      longitude={formData.longitude} 
                      onLocationSelect={handleLocationSelect} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions aligned to bottom right */}
            <motion.div variants={itemVariants} className="flex justify-end gap-4 shrink-0">
              <button 
                type="button" 
                onClick={() => navigate('/stations')} 
                className="px-8 py-4 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-charcoal-900 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-4 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-charcoal-900 font-black rounded-xl transition-all shadow-lg shadow-lime-400/30 flex items-center gap-2 hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Creating...' : 'Create Station'}
              </button>
            </motion.div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
