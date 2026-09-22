import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { prosumerAdminAPI } from '../services/api';

const AdminProsumers = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [prosumers, setProsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNic, setSearchNic] = useState('');
  const [selectedProsumer, setSelectedProsumer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user || user.role !== 'Backoffice') {
      navigate('/');
      return;
    }
    fetchProsumers();
  }, [user, navigate]);

  const fetchProsumers = async () => {
    try {
      setLoading(true);
      const response = await prosumerAdminAPI.getAllProsumers();
      if (response.success) {
        setProsumers(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch prosumers' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByNic = async (e) => {
    e.preventDefault();
    if (!searchNic.trim()) {
      fetchProsumers();
      return;
    }

    try {
      setLoading(true);
      const response = await prosumerAdminAPI.getProsumerByNic(searchNic);
      if (response.success) {
        setProsumers([response.data]);
      } else {
        setMessage({ type: 'error', text: response.message || 'Prosumer not found' });
        setProsumers([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Prosumer not found' });
      setProsumers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (prosumerId, newStatus) => {
    try {
      const response = await prosumerAdminAPI.updateProsumerStatus(prosumerId, newStatus);
      if (response.success) {
        setMessage({ type: 'success', text: 'Prosumer status updated successfully!' });
        fetchProsumers();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-[#E3F8B3] text-[#557711]';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Deactivated': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">Prosumer Management</h1>
          <p className="text-gray-500 text-sm font-medium">Manage prosumer accounts</p>
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
        >
          Manage Users
        </button>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium shadow-sm ${
            message.type === 'success' ? 'bg-lime-50 text-lime-700 border border-lime-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <form onSubmit={handleSearchByNic} className="flex gap-4 max-w-2xl">
            <input
              type="text"
              value={searchNic}
              onChange={(e) => setSearchNic(e.target.value)}
              placeholder="Search by NIC..."
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 shadow-sm transition-shadow"
            />
            <button
              type="submit"
              className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchNic('');
                fetchProsumers();
              }}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
            >
              Reset
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-gray-400 font-medium">Loading prosumers...</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">PROSUMER</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">NIC</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">CONTACT</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">STATUS</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">CREATED</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {prosumers.map((prosumer) => (
                  <tr key={prosumer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-charcoal-900">
                        {prosumer.firstName} {prosumer.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-[13px] font-medium text-gray-500">
                      {prosumer.nic}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-[13px] font-medium text-charcoal-900">{prosumer.email}</div>
                      <div className="text-[11px] font-medium text-gray-400 mt-0.5">{prosumer.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${getStatusColor(prosumer.status)}`}>
                        {prosumer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-[13px] font-medium text-gray-500">
                      {new Date(prosumer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setSelectedProsumer(prosumer);
                            setShowDetailsModal(true);
                          }}
                          className="text-lime-600 font-semibold hover:text-lime-700 text-[13px] transition-colors"
                        >
                          View
                        </button>
                        <select
                          value={prosumer.status}
                          onChange={(e) => handleUpdateStatus(prosumer.id, e.target.value)}
                          className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-medium text-charcoal-900 focus:outline-none focus:border-gray-300 shadow-sm cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Deactivated">Deactivated</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {prosumers.length === 0 && (
              <div className="text-center py-16 text-gray-400 font-medium">
                No prosumers found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prosumer Details Modal */}
      {showDetailsModal && selectedProsumer && (
        <div className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-charcoal-900 tracking-tight">Prosumer Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Name</span>
                <p className="text-charcoal-900 font-semibold text-sm">{selectedProsumer.firstName} {selectedProsumer.lastName}</p>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">NIC</span>
                <p className="text-charcoal-900 font-semibold text-sm">{selectedProsumer.nic}</p>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Email</span>
                <p className="text-charcoal-900 font-semibold text-sm">{selectedProsumer.email}</p>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Phone</span>
                <p className="text-charcoal-900 font-semibold text-sm">{selectedProsumer.phoneNumber}</p>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Address</span>
                <p className="text-charcoal-900 font-semibold text-sm text-right max-w-[60%]">{selectedProsumer.address}</p>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Status</span>
                <p className="text-charcoal-900 font-semibold text-sm">{selectedProsumer.status}</p>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProsumer(null);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-charcoal-900 font-semibold py-3 rounded-xl transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProsumers;
