import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { prosumerAPI } from '../services/api';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await prosumerAPI.updateProfile(formData);
      
      if (response.success) {
        updateUser(response.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await prosumerAPI.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred while changing password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivationRequest = async () => {
    if (!window.confirm('Are you sure you want to request account deactivation? This will require admin approval.')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await prosumerAPI.requestDeactivation();
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Deactivation request submitted successfully. Please contact admin for approval.' });
        // Refresh user data to get updated status
        const profileResponse = await prosumerAPI.getProfile();
        if (profileResponse.success) {
          updateUser(profileResponse.data);
        }
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to submit deactivation request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while submitting deactivation request' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="py-24 flex items-center justify-center text-gray-400 font-medium">Loading profile...</div>;
  }

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 text-sm font-medium">Manage your account information and security</p>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto flex-1">
        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium shadow-sm ${
            message.type === 'success' 
              ? 'bg-lime-50 text-lime-700 border border-lime-200' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Account Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900">Account Status</h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-gray-500 text-sm font-medium">Current status:</span>
                <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                  user.status === 'Active' ? 'bg-[#E3F8B3] text-[#557711]' : 
                  user.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                }`}>{user.status}</span>
              </div>
            </div>
            {user.status === 'Active' && (
              <button
                onClick={handleDeactivationRequest}
                disabled={loading}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                Request Deactivation
              </button>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-charcoal-900">Profile Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                  />
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">NIC</p>
                <p className="text-charcoal-900 font-semibold">{user.nic}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</p>
                <p className="text-charcoal-900 font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">First Name</p>
                <p className="text-charcoal-900 font-semibold">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</p>
                <p className="text-charcoal-900 font-semibold">{user.lastName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</p>
                <p className="text-charcoal-900 font-semibold">{user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Address</p>
                <p className="text-charcoal-900 font-semibold">{user.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Member Since</p>
                <p className="text-charcoal-900 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-charcoal-900">Security</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-shadow"
                  />
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-charcoal-900 px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-charcoal-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;