import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { prosumerAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nic: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await prosumerAPI.register(registerData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 text-center">
          <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-3 tracking-tight">Registration Successful!</h2>
          <p className="text-gray-500 font-medium mb-6">Your account has been created and is pending approval.</p>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-lime-400 animate-pulse w-full"></div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-lime-400 rounded-lg"></div>
              SolarGrid
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Create an Account</h2>
          <p className="text-gray-500 text-sm font-medium">Register as a Prosumer to join our network</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl mb-8 text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
            <h3 className="text-sm font-bold text-charcoal-900 mb-4 border-b border-gray-200 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">NIC (National ID)</label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium resize-none"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
            <h3 className="text-sm font-bold text-charcoal-900 mb-4 border-b border-gray-200 pb-2">Account Security</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-bold py-4 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 mt-4 text-lg"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-8">
          <p className="text-gray-500 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-lime-600 hover:text-lime-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
