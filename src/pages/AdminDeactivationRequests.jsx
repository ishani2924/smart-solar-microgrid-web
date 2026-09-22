import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { prosumerAdminAPI } from '../services/api';

const AdminDeactivationRequests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user || user.role !== 'Backoffice') {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await prosumerAdminAPI.getDeactivationRequests();
      if (response.success) {
        // Handle both array and object with numeric keys
        let requestsArray;
        if (Array.isArray(response.data)) {
          requestsArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          requestsArray = Object.values(response.data);
        } else {
          requestsArray = [];
        }
        setRequests(requestsArray);
      } else {
        setRequests([]);
        setMessage({ type: 'error', text: response.message || 'Failed to fetch requests' });
      }
    } catch (error) {
      setRequests([]);
      setMessage({ type: 'error', text: 'Failed to fetch requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (prosumerId) => {
    if (!window.confirm('Are you sure you want to approve this deactivation request?')) {
      return;
    }

    try {
      const response = await prosumerAdminAPI.approveDeactivation(prosumerId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Deactivation approved successfully!' });
        fetchRequests();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to approve deactivation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve deactivation' });
    }
  };

  const handleReject = async (prosumerId) => {
    if (!window.confirm('Are you sure you want to reject this deactivation request?')) {
      return;
    }

    try {
      const response = await prosumerAdminAPI.rejectDeactivation(prosumerId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Deactivation rejected successfully!' });
        fetchRequests();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to reject deactivation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject deactivation' });
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-50">
      {/* Header */}
      <div className="bg-navy-800 border-b border-navy-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deactivation Requests</h1>
            <p className="text-slate-400 text-sm">Manage prosumer account deactivation requests</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/prosumers')}
              className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Manage Prosumers
            </button>
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading requests...</div>
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
                {Array.isArray(requests) && requests.map((request) => (
                  <tr key={request.id} className="hover:bg-navy-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {request.firstName} {request.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {request.nic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {request.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {request.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="text-teal-500 hover:text-teal-400"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="text-green-500 hover:text-green-400"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!Array.isArray(requests) || requests.length === 0) && (
              <div className="text-center py-12 text-slate-400">
                No deactivation requests found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Request Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-sm">Name:</span>
                <p className="text-white">{selectedRequest.firstName} {selectedRequest.lastName}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">NIC:</span>
                <p className="text-white">{selectedRequest.nic}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Email:</span>
                <p className="text-white">{selectedRequest.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Phone:</span>
                <p className="text-white">{selectedRequest.phoneNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Address:</span>
                <p className="text-white">{selectedRequest.address}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Status:</span>
                <p className="text-white">{selectedRequest.status}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Created:</span>
                <p className="text-white">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg transition-colors"
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

export default AdminDeactivationRequests;
