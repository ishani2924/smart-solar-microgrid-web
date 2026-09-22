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
      console.log('Full API response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
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
        
        console.log('Setting users array:', usersArray);
        console.log('Users array length:', usersArray.length);
        setUsers(usersArray);
      } else {
        setUsers([]);
        setMessage({ type: 'error', text: response.message || 'Failed to fetch users' });
      }
    } catch (error) {
      console.error('Fetch error:', error);
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
        setFormData({ email: '', password: '', role: 'Backoffice' });
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
      const response = await userAPI.updateUser(selectedUser.id, { email: formData.email });
      if (response.success) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ email: '', password: '', role: 'Backoffice' });
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
    setFormData({ email: user.email, password: '', role: user.role });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Deactivated': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Backoffice': return 'bg-purple-500/20 text-purple-400';
      case 'GridOperator': return 'bg-blue-500/20 text-blue-400';
      case 'Prosumer': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-50">
      {/* Header */}
      <div className="bg-navy-800 border-b border-navy-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-slate-400 text-sm">Manage system users</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create User
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
            <div className="text-slate-400">Loading users...</div>
          </div>
        ) : (
          <div className="bg-navy-800 rounded-lg border border-navy-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-navy-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700">
                {Array.isArray(users) && users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-navy-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{userItem.email}</div>
                      <div className="text-xs text-slate-400">{userItem.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(userItem.role)}`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(userItem.status)}`}>
                        {userItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(userItem)}
                          className="text-teal-500 hover:text-teal-400"
                        >
                          Edit
                        </button>
                        <select
                          value={userItem.status}
                          onChange={(e) => handleUpdateUserStatus(userItem.id, e.target.value)}
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

            {users.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Backoffice">Backoffice</option>
                  <option value="GridOperator">GridOperator</option>
                  <option value="Prosumer">Prosumer</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg transition-colors"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg transition-colors"
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
