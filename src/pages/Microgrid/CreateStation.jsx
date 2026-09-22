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
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Microgrid Station</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Station Name</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input type="number" step="any" name="latitude" required value={formData.latitude} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input type="number" step="any" name="longitude" required value={formData.longitude} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Capacity (kW)</label>
            <input type="number" min="0" name="capacity" required value={formData.capacity} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Battery (kWh)</label>
            <input type="number" min="0" name="batteryCapacity" required value={formData.batteryCapacity} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Storage Slots</label>
            <input type="number" min="0" name="availableStorage" required value={formData.availableStorage} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Opening Time</label>
            <input type="time" name="openingTime" required value={formData.openingTime} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Closing Time</label>
            <input type="time" name="closingTime" required value={formData.closingTime} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/stations')} className="px-4 py-2 text-gray-600 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create Station</button>
        </div>
      </form>
    </div>
  );
}
