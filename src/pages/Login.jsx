import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect based on role
        if (result.role === 'Prosumer') {
          navigate('/profile');
        } else if (result.role === 'Backoffice') {
          navigate('/admin/users');
        } else if (result.role === 'GridOperator') {
          navigate('/operator/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-lime-400 rounded-lg"></div>
              SolarGrid
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm font-medium">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl mb-6 text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-8">
          <p className="text-gray-500 text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-lime-600 hover:text-lime-700 font-bold transition-colors">
              Register as Prosumer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;