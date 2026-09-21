import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OperatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalProsumers: 0,
    activeProsumers: 0,
    pendingApprovals: 0,
    gridLoad: 0,
  });

  useEffect(() => {
    if (!user || user.role !== 'GridOperator') {
      navigate('/');
      return;
    }
    // Placeholder data - replace with actual API calls when endpoints are available
    setStats({
      totalProsumers: 156,
      activeProsumers: 142,
      pendingApprovals: 8,
      gridLoad: 78,
    });
  }, [user, navigate]);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 text-slate-50">
      {/* Header */}
      <div className="bg-navy-800 border-b border-navy-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Grid Operator Dashboard</h1>
            <p className="text-slate-400 text-sm">Monitor and manage the solar microgrid</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Prosumers"
            value={stats.totalProsumers}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="bg-teal-500/20"
          />
          <StatCard
            title="Active Prosumers"
            value={stats.activeProsumers}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-green-500/20"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-yellow-500/20"
          />
          <StatCard
            title="Grid Load"
            value={`${stats.gridLoad}%`}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color="bg-blue-500/20"
          />
        </div>

        {/* Placeholder for Grid Monitoring */}
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Grid Monitoring</h2>
          <div className="bg-navy-700 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-slate-400">Grid monitoring features will be available once API endpoints are implemented</p>
            <p className="text-slate-500 text-sm mt-2">Expected features: Real-time energy flow, grid load visualization, alerts</p>
          </div>
        </div>

        {/* Placeholder for Energy Analytics */}
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-6">
          <h2 className="text-xl font-bold mb-4">Energy Analytics</h2>
          <div className="bg-navy-700 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="text-slate-400">Energy analytics will be available once API endpoints are implemented</p>
            <p className="text-slate-500 text-sm mt-2">Expected features: Production/consumption charts, peak usage analysis, trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
