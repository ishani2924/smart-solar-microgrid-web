import React, { useState, useEffect } from 'react';
import { fetchStationById, updateStation } from '../../services/MicrogridService';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapPin, Zap, Clock, Battery, BatteryCharging, ArrowLeft } from 'lucide-react';
import LocationPickerMap from '../../components/LocationPickerMap';

export default function EditStation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    batteryCapacity: '',
    availableStorage: '',
    openingTime: '08:00',
    closingTime: '18:00'
  });

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6))
    }));
  };

  useEffect(() => {
    loadStation();
  }, [id]);

  const loadStation = async () => {
    try {
      const stationData = await fetchStationById(id);
      setFormData({
        name: stationData.name,
        address: stationData.address,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        capacity: stationData.capacity,
        batteryCapacity: stationData.batteryCapacity,
        availableStorage: stationData.availableStorage,
        openingTime: stationData.openingTime,
        closingTime: stationData.closingTime
      });
    } catch (err) {
      console.error(err);
      alert('Failed to load station details');
    } finally {
      setLoading(false);
    }
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
      await updateStation(id, formData);
      navigate('/stations');
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="py-24 flex justify-center text-gray-400 font-medium">Loading station data...</div>;

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-12">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-1">
          <Link to="/stations" className="text-lime-600 hover:text-lime-700 transition-colors font-semibold text-sm flex items-center gap-2 mb-2 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Stations
          </Link>
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">Edit Station</h1>
          <p className="text-gray-500 text-sm font-medium">Update the details of the selected microgrid station</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General & Location Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lime-500">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-charcoal-900">Station Identity & Location</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Station Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location Map</label>
                <LocationPickerMap 
                  latitude={formData.latitude} 
                  longitude={formData.longitude} 
                  onLocationSelect={handleLocationSelect} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Latitude</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="any" 
                    name="latitude" 
                    required 
                    value={formData.latitude} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Longitude</label>
                <input 
                  type="number" 
                  step="any" 
                  name="longitude" 
                  required 
                  value={formData.longitude} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Capabilities Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lime-500">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-charcoal-900">Power & Capabilities</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-semibold" 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Battery className="w-3.5 h-3.5" /> Battery Capacity (kWh)
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="any" 
                  name="batteryCapacity" 
                  required 
                  value={formData.batteryCapacity} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-semibold" 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <BatteryCharging className="w-3.5 h-3.5" /> Storage Slots
                </label>
                <input 
                  type="number" 
                  min="0" 
                  name="availableStorage" 
                  required 
                  value={formData.availableStorage} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-semibold" 
                />
              </div>
            </div>
          </div>

          {/* Operating Hours Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lime-500">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-charcoal-900">Operating Hours</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opening Time</label>
                <input 
                  type="time" 
                  name="openingTime" 
                  required 
                  value={formData.openingTime} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-semibold" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Closing Time</label>
                <input 
                  type="time" 
                  name="closingTime" 
                  required 
                  value={formData.closingTime} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-semibold" 
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/stations')} 
              className="px-8 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 font-bold rounded-xl transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-charcoal-900 font-bold rounded-xl transition-colors shadow-lg shadow-lime-400/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
