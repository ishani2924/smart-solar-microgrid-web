/**
 * BookingStatsCards.jsx
 * Dashboard summary stat cards for booking counts.
 * Fetches live data from GET /api/reservations/dashboard.
 * Shows: Pending, Approved (Future), Cancelled, Completed counts.
 * Assignment requirement: PendingCount + ApprovedFutureCount are the key metrics.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Zap, TrendingUp } from 'lucide-react';
import { getDashboardSummary, searchReservations } from '../../services/reservationApi';

const StatCard = ({ icon: Icon, label, value, color, bg, delay, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    className={`relative overflow-hidden rounded-2xl p-6 ${bg} border border-white/60 shadow-sm`}
  >
    {/* Background decoration */}
    <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 ${color.replace('text-', 'bg-')}`} />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <TrendingUp className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className={`text-4xl font-bold tracking-tight mb-1 ${color}`}>
        {value === null ? (
          <div className="w-12 h-10 bg-white/50 rounded-lg animate-pulse" />
        ) : (
          value
        )}
      </div>
      <div className="text-sm font-semibold text-gray-600">{label}</div>
    </div>
  </motion.div>
);

const BookingStatsCards = () => {
  const [summary, setSummary] = useState(null);
  const [extraCounts, setExtraCounts] = useState({ cancelled: null, completed: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, cancelledRes, completedRes] = await Promise.all([
          getDashboardSummary(),
          searchReservations({ status: 'Cancelled' }),
          searchReservations({ status: 'Completed' }),
        ]);

        if (dashRes.success) setSummary(dashRes.data);
        setExtraCounts({
          cancelled: cancelledRes.success ? cancelledRes.data.length : 0,
          completed: completedRes.success ? completedRes.data.length : 0,
        });
      } catch (err) {
        setError('Failed to load dashboard data. Make sure the API is running.');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="col-span-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
        {error}
      </div>
    );
  }

  const cards = [
    {
      icon: Clock,
      label: 'Pending Reservations',
      value: summary ? summary.pendingCount : null,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      delay: 0,
    },
    {
      icon: CheckCircle,
      label: 'Approved (Upcoming)',
      value: summary ? summary.approvedFutureCount : null,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      delay: 0.08,
    },
    {
      icon: XCircle,
      label: 'Cancelled',
      value: extraCounts.cancelled,
      color: 'text-red-500',
      bg: 'bg-red-50',
      delay: 0.16,
    },
    {
      icon: Zap,
      label: 'Completed',
      value: extraCounts.completed,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      delay: 0.24,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default BookingStatsCards;
