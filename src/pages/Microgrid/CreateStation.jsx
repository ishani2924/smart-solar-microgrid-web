import React, { useState } from 'react';
import { createStation } from '../../services/MicrogridService';
import { useNavigate } from 'react-router-dom';

export default function CreateStation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    capacity: 0,
    batteryCapacity: 0,
    availableStorage: 0,
    openingTime: '08:00',
    closingTime: '18:00'
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStation(formData);
      navigate('/stations');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">Create New Station</h1>
          <p className="text-gray-500 text-sm font-medium">Add a new microgrid station to the network</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Station Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
                placeholder="e.g. Colombo South Station"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
                placeholder="Full address of the station"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Latitude</label>
              <input 
                type="number" 
                step="any" 
                name="latitude" 
                required 
                value={formData.latitude} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
              />
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Capacity (kW)</label>
              <input 
                type="number" 
                min="0" 
                name="capacity" 
                required 
                value={formData.capacity} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Battery (kWh)</label>
              <input 
                type="number" 
                min="0" 
                name="batteryCapacity" 
                required 
                value={formData.batteryCapacity} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Available Storage Slots</label>
              <input 
                type="number" 
                min="0" 
                name="availableStorage" 
                required 
                value={formData.availableStorage} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opening Time</label>
              <input 
                type="time" 
                name="openingTime" 
                required 
                value={formData.openingTime} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow" 
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/stations')} 
              className="px-8 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 font-semibold rounded-xl transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-semibold rounded-xl transition-colors shadow-sm"
            >
              Create Station
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
