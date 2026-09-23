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

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">Microgrid Stations</h1>
          <p className="text-gray-500 text-sm font-medium">Manage station capacities and status</p>
        </div>
        <Link 
          to="/stations/create" 
          className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm inline-block"
        >
          Add Station
        </Link>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-gray-400 font-medium">Loading stations...</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">STATION NAME</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">LOCATION</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">CAPACITY</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">SLOTS</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">STATUS</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {stations.map(station => (
                  <tr key={station.stationId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-charcoal-900">{station.name}</div>
                      <div className="text-[11px] font-medium text-gray-400 mt-0.5">ID: {station.stationId}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-[13px] font-medium text-gray-500">
                      {station.address}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-[13px] font-semibold text-charcoal-900">
                      {station.capacity} kW
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-[13px] font-medium text-gray-500">
                      {station.availableStorage}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                        station.status === 'Active' 
                          ? 'bg-[#E3F8B3] text-[#557711]' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {station.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <Link to={`/stations/${station.stationId}`} className="text-gray-500 font-semibold hover:text-charcoal-900 text-[13px] transition-colors">
                          View
                        </Link>
                        <Link to={`/stations/${station.stationId}/edit`} className="text-lime-600 font-semibold hover:text-lime-700 text-[13px] transition-colors">
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleToggleStatus(station.stationId, station.status)}
                          className={`text-[13px] font-semibold transition-colors ${
                            station.status === 'Active' ? 'text-red-500 hover:text-red-700' : 'text-lime-600 hover:text-lime-700'
                          }`}
                        >
                          {station.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {stations.length === 0 && (
              <div className="text-center py-16 text-gray-400 font-medium">
                No stations found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
