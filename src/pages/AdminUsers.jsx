import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const AdminUsers = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Backoffice',
    status: 'Active',
  });

  useEffect(() => {
    if (!user || user.role !== 'Backoffice') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      if (response.success) {
        // Handle both array and object with numeric keys
        let usersArray;
        if (Array.isArray(response.data)) {
          usersArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Convert object with numeric keys to array
          usersArray = Object.values(response.data);
        } else {
          usersArray = [];
        }
        setUsers(usersArray);
      } else {
        setUsers([]);
        setMessage({ type: 'error', text: response.message || 'Failed to fetch users' });
      }
    } catch (error) {
      setUsers([]);
      setMessage({ type: 'error', text: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.createUser(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'User created successfully!' });
        setShowCreateModal(false);
        setFormData({ email: '', password: '', role: 'Backoffice', status: 'Active' });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user' });
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const response = await userAPI.updateUserStatus(userId, newStatus);
      if (response.success) {
        setMessage({ type: 'success', text: 'User status updated successfully!' });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };

      const response = await userAPI.updateUser(selectedUser.id, updateData);
      
      if (response.success) {
        // If password is provided, reset it
        if (formData.password) {
          await userAPI.resetPassword(selectedUser.id, formData.password);
        }

        setMessage({ type: 'success', text: 'User updated successfully!' });
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ email: '', password: '', role: 'Backoffice', status: 'Active' });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user' });
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ 
      email: user.email, 
      password: '', 
      role: user.role,
      status: user.status 
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-[#E3F8B3] text-[#557711]';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Deactivated': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Backoffice': return 'bg-purple-100 text-purple-600';
      case 'GridOperator': return 'bg-blue-100 text-blue-600';
      case 'Prosumer': return 'bg-[#E3F8B3] text-[#80B622]'; // Based on screenshot light green text/bg
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 text-sm font-medium">Manage system users</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/prosumers')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Manage Prosumers
          </button>
          <button
            onClick={() => navigate('/admin/deactivation-requests')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Deactivation Requests
          </button>
          <button
            onClick={() => navigate('/admin/tab-permissions')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Tab Permissions
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Create User
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
          <div className="flex items-center justify-center py-24">
            <div className="text-gray-400 font-medium">Loading users...</div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">EMAIL</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">ROLE</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">STATUS</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">CREATED</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {Array.isArray(users) && Array.isArray(users) && users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-charcoal-900">{userItem.email}</div>
                      <div className="text-[11px] font-medium text-gray-400 mt-0.5">{userItem.id}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${getRoleColor(userItem.role)}`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${getStatusColor(userItem.status)}`}>
                        {userItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openEditModal(userItem)}
                          className="text-lime-600 font-semibold hover:text-lime-700 text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <select
                          value={userItem.status}
                          onChange={(e) => handleUpdateUserStatus(userItem.id, e.target.value)}
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

            {users.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 font-medium">No users found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-charcoal-900 tracking-tight">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow cursor-pointer"
                >
                  <option value="Backoffice">Backoffice</option>
                  <option value="GridOperator">GridOperator</option>
                  <option value="Prosumer">Prosumer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-semibold py-3 rounded-xl transition-colors shadow-sm"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-charcoal-900 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-charcoal-900 tracking-tight">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow cursor-pointer"
                >
                  <option value="Backoffice">Backoffice</option>
                  <option value="GridOperator">GridOperator</option>
                  <option value="Prosumer">Prosumer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password (optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-semibold py-3 rounded-xl transition-colors shadow-sm"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-charcoal-900 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
