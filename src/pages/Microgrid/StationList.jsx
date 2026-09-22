import React, { useEffect, useState } from 'react';
import { fetchStations, updateStationStatus } from '../../services/MicrogridService';
import { Link } from 'react-router-dom';

export default function StationList() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await updateStationStatus(id, newStatus);
      loadStations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8">Loading stations...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Microgrid Stations</h1>
        <Link to="/stations/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Station
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 border-b">Station Name</th>
              <th className="p-4 border-b">Location</th>
              <th className="p-4 border-b">Capacity</th>
              <th className="p-4 border-b">Storage Slots</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(station => (
              <tr key={station.stationId} className="hover:bg-gray-50">
                <td className="p-4 border-b">{station.name}</td>
                <td className="p-4 border-b">{station.address}</td>
                <td className="p-4 border-b">{station.capacity} kW</td>
                <td className="p-4 border-b">{station.availableStorage}</td>
                <td className="p-4 border-b">
                  <span className={`px-2 py-1 rounded text-sm ${station.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {station.status}
                  </span>
                </td>
                <td className="p-4 border-b">
                  <Link to={`/stations/${station.stationId}`} className="text-blue-600 hover:underline mr-4">
                    View
                  </Link>
                  <Link to={`/stations/${station.stationId}/edit`} className="text-blue-600 hover:underline mr-4">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleToggleStatus(station.stationId, station.status)}
                    className="text-gray-600 hover:underline"
                  >
                    {station.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {stations.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No stations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
