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
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Deactivated': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-50">
      {/* Header */}
      <div className="bg-navy-800 border-b border-navy-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prosumer Management</h1>
            <p className="text-slate-400 text-sm">Manage prosumer accounts</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={logout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {message.text && (
          <div className={`mb-4 px-4 py-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearchByNic} className="flex gap-4">
            <input
              type="text"
              value={searchNic}
              onChange={(e) => setSearchNic(e.target.value)}
              placeholder="Search by NIC..."
              className="flex-1 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchNic('');
                fetchProsumers();
              }}
              className="bg-navy-700 hover:bg-navy-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reset
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading prosumers...</div>
          </div>
        ) : (
          <div className="bg-navy-800 rounded-lg border border-navy-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-navy-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">NIC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700">
                {prosumers.map((prosumer) => (
                  <tr key={prosumer.id} className="hover:bg-navy-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {prosumer.firstName} {prosumer.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {prosumer.nic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {prosumer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {prosumer.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(prosumer.status)}`}>
                        {prosumer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(prosumer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProsumer(prosumer);
                            setShowDetailsModal(true);
                          }}
                          className="text-teal-500 hover:text-teal-400"
                        >
                          View Details
                        </button>
                        <select
                          value={prosumer.status}
                          onChange={(e) => handleUpdateStatus(prosumer.id, e.target.value)}
                          className="bg-navy-700 border border-navy-600 rounded px-2 py-1 text-xs text-white"
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
              <div className="text-center py-12 text-slate-400">
                No prosumers found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prosumer Details Modal */}
      {showDetailsModal && selectedProsumer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Prosumer Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-sm">Name:</span>
                <p className="text-white">{selectedProsumer.firstName} {selectedProsumer.lastName}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">NIC:</span>
                <p className="text-white">{selectedProsumer.nic}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Email:</span>
                <p className="text-white">{selectedProsumer.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Phone:</span>
                <p className="text-white">{selectedProsumer.phoneNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Address:</span>
                <p className="text-white">{selectedProsumer.address}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Status:</span>
                <p className="text-white">{selectedProsumer.status}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Created:</span>
                <p className="text-white">{new Date(selectedProsumer.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProsumer(null);
                }}
                className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProsumers;
