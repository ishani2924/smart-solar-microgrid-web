import React, { useState, useEffect } from 'react';
import { fetchStations } from '../services/MicrogridService';
import { reservationAPI, prosumerAdminAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Activity, Zap, Users, CheckCircle, Clock, XCircle, Battery } from 'lucide-react';

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCapacity: 0,
    totalEnergyBooked: 0,
    totalProsumers: 0,
    activeStations: 0,
    bookingsByStatus: { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stationsRes, reservationsRes, prosumersRes] = await Promise.all([
          fetchStations().catch(() => []),
          reservationAPI.getAllReservations().catch(() => []),
          prosumerAdminAPI.getAllProsumers().catch(() => [])
        ]);

        const stations = Array.isArray(stationsRes) ? stationsRes : [];
        const reservations = Array.isArray(reservationsRes) ? reservationsRes : (reservationsRes?.data || []);
        const prosumers = Array.isArray(prosumersRes) ? prosumersRes : (prosumersRes?.data || []);

        let totalCapacity = 0;
        let activeStations = 0;
        stations.forEach(s => {
          totalCapacity += (s.capacity || 0);
          if (s.status === 'Active') activeStations++;
        });

        let totalEnergyBooked = 0;
        const bookingsByStatus = { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };

        reservations.forEach(r => {
          const status = r.status || 'Pending';
          if (bookingsByStatus[status] !== undefined) {
             bookingsByStatus[status]++;
          }
          if (status === 'Completed') {
            totalEnergyBooked += (r.bookingSize || 0);
          }
        });

        setMetrics({
          totalCapacity,
          totalEnergyBooked,
          totalProsumers: prosumers.length,
          activeStations,
          bookingsByStatus
        });
      } catch (error) {
        console.error("Error loading analysis data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="py-24 flex justify-center text-gray-400 font-medium">Loading analysis data...</div>;

  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">

      <div className="flex items-center justify-between mb-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">System Analysis</h1>
          <p className="text-gray-500 text-sm font-medium">Real-time overview of network performance and usage statistics.</p>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-8 flex-1">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-lime-50 text-lime-500 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Capacity</p>
              <h3 className="text-3xl font-black text-charcoal-900">{metrics.totalCapacity.toFixed(1)} <span className="text-lg font-bold text-gray-400">kW</span></h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <Battery className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Yield Booked</p>
              <h3 className="text-3xl font-black text-charcoal-900">{metrics.totalEnergyBooked.toFixed(1)} <span className="text-lg font-bold text-gray-400">kWh</span></h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Registered Prosumers</p>
              <h3 className="text-3xl font-black text-charcoal-900">{metrics.totalProsumers} <span className="text-lg font-bold text-gray-400">users</span></h3>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Active Stations</p>
              <h3 className="text-3xl font-black text-charcoal-900">{metrics.activeStations} <span className="text-lg font-bold text-gray-400">online</span></h3>
            </div>
          </motion.div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-charcoal-900 rounded-3xl p-8 shadow-xl flex flex-col relative overflow-hidden">

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-400/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="z-10 flex justify-between items-center mb-8">
              <h2 className="text-white font-bold text-xl">Booking Status Distribution</h2>
              <span className="text-lime-400 text-sm font-semibold bg-lime-400/10 px-3 py-1 rounded-full">All Time</span>
            </div>

            <div className="flex-1 z-10 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-2xl">{metrics.bookingsByStatus.Completed}</h4>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Completed</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-2xl">{metrics.bookingsByStatus.Approved}</h4>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Approved</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-2xl">{metrics.bookingsByStatus.Pending}</h4>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pending</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-2xl">{metrics.bookingsByStatus.Cancelled}</h4>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Cancelled</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 bg-lime-50 text-lime-500 rounded-full flex items-center justify-center mb-6">
              <Activity className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-charcoal-900 mb-2">More Analytics Coming Soon</h3>
            <p className="text-gray-500 max-w-sm">We are gathering more data from the grid. Detailed historical charts and predictive ML models will be available in the next major update.</p>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default Analysis;
