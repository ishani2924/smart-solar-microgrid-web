import React, { useEffect, useState } from 'react';
import { fetchStations, updateStationStatus } from '../../services/MicrogridService';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, Edit2, PowerOff, Power, Battery, CheckCircle, XCircle } from 'lucide-react';

export default function StationList() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isGridOperator, isProsumer, isBackoffice } = useAuth();

  useEffect(() => {
    loadStations();
  }, [user]);

  const loadStations = async () => {
    try {
      const data = await fetchStations();
      if (isGridOperator() && user) {
        const filtered = data.filter(station => {
          const opName = (station.gridOperatorName || '').toLowerCase().trim();
          const userEmail = (user.email || '').toLowerCase().trim();
          const userName = (user.name || '').toLowerCase().trim();
          const userStationId = user.stationId;

          return (
            (userEmail && opName === userEmail) ||
            (userName && opName === userName) ||
            (userStationId && (station.stationId === userStationId || station.id === userStationId)) ||
            (opName && userEmail && opName.includes(userEmail)) ||
            (opName && userName && opName.includes(userName))
          );
        });
        setStations(filtered);
      } else {
        setStations(data);
      }
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
  const handleSetStatus = async (id, newStatus) => {
    try {
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
          <p className="text-gray-500 text-sm font-medium">
            {isProsumer()
              ? 'Browse available microgrid stations and reserve energy transfer slots'
              : isGridOperator()
                ? 'Manage your assigned microgrid stations'
                : 'Manage station capacities and status'}
          </p>
        </div>
        {!isProsumer() && (
          <Link
            to="/stations/create"
            className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm inline-block"
          >
            Add Station
          </Link>
        )}
      </div>

      {/* Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-gray-400 font-medium">Loading stations...</div>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {/* Header */}
            <div className="flex items-center px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
              <div className="w-[25%] pl-2">STATION NAME</div>
              <div className="w-[18%]">LOCATION</div>
              <div className="w-[12%]">CAPACITY</div>
              <div className="w-[20%]">OPERATOR</div>
              <div className="w-[10%] text-center">SLOTS</div>
              <div className="w-[15%] text-right pr-4">ACTIONS</div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
              {stations.map(station => (
                <div key={station.stationId} className="flex items-center px-6 py-5 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-lime-200 hover:shadow-md transition-all">

                  {/* Station Name */}
                  <div className="w-[25%] flex items-center gap-4 pr-4">
                    <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center shrink-0">
                      <Battery className="w-5 h-5 text-lime-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-charcoal-900 truncate">{station.name}</div>
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                        ID: {station.stationId.substring(0, 8)}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="w-[18%] text-[12px] font-semibold text-gray-500 pr-4 truncate">
                    {station.address}
                  </div>

                  {/* Capacity */}
                  <div className="w-[12%] text-[13px] font-bold text-charcoal-900">
                    {station.capacity} kW
                  </div>

                  {/* Operator */}
                  <div className="w-[20%] text-[12px] font-semibold text-gray-500 pr-4 truncate">
                    {station.gridOperatorName || 'Unassigned'}
                  </div>

                  {/* Slots */}
                  <div className="w-[10%] flex flex-col items-center justify-center gap-1">
                    <span className="text-[13px] font-bold text-charcoal-900">{station.availableStorage}</span>
                    <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${station.status === 'Active'
                        ? 'bg-[#E3F8B3] text-[#557711]'
                        : 'bg-red-100 text-red-600'
                      }`}>
                      {station.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="w-[15%] flex items-center justify-end gap-1.5">
                    <Link to={`/stations/${station.stationId}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <Eye className="w-4 h-4" />
                    </Link>
                    {!isProsumer() && (
                      <>
                        <Link to={`/stations/${station.stationId}/edit`} className="p-2 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-colors" title="Edit Station">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {isBackoffice() && (
                          station.status === 'Pending' ? (
                            <>
                              <button onClick={() => handleSetStatus(station.stationId, 'Active')} className="p-2 text-lime-600 hover:bg-lime-50 rounded-lg transition-colors" title="Approve Station"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => handleSetStatus(station.stationId, 'Rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject Station"><XCircle className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(station.stationId, station.status)}
                              className={`p-2 rounded-lg transition-colors ${
                                station.status === 'Active' 
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                  : 'text-gray-400 hover:text-lime-600 hover:bg-lime-50'
                              }`}
                              title={station.status === 'Active' ? 'Deactivate Station' : 'Activate Station'}
                            >
                              {station.status === 'Active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </button>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {stations.length === 0 && (
              <div className="text-center py-16 text-gray-400 font-medium bg-white rounded-2xl border border-gray-100 mt-2">
                No stations found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
