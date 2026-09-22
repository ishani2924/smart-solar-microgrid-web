import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { prosumerAdminAPI } from '../services/api';

const AdminDeactivationRequests = () => {
  const { user } = useAuth();
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
        setShowDetailsModal(false);
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
        setShowDetailsModal(false);
        fetchRequests();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to reject deactivation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject deactivation' });
    }
  };

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">Deactivation Requests</h1>
          <p className="text-gray-500 text-sm font-medium">Manage prosumer account deactivation requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/prosumers')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Manage Prosumers
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Manage Users
          </button>
        </div>
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

        {loading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 font-medium">
            Loading requests...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">PROSUMER</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">NIC</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">STATUS</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">REQUESTED ON</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(!Array.isArray(requests) || requests.length === 0) ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-medium">
                        No pending deactivation requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-charcoal-900">
                            {request.firstName} {request.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{request.email}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                          {request.nic}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-yellow-100 text-yellow-700">
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                              className="text-sm font-semibold text-lime-600 hover:text-lime-700 transition-colors"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-charcoal-900">Review Deactivation Request</h2>
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-charcoal-900">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">NIC</p>
                  <p className="text-sm font-semibold text-charcoal-900">{selectedRequest.nic}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-sm font-semibold text-charcoal-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm font-semibold text-charcoal-900">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-yellow-100 text-yellow-700">
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-semibold text-charcoal-900">{selectedRequest.address}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="flex-1 bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeactivationRequests;
