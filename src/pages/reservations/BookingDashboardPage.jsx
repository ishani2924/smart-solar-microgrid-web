

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, List, ArrowRight, RefreshCw } from 'lucide-react';
import BookingStatsCards from '../../components/reservations/BookingStatsCards';
import ReservationStatusBadge from '../../components/reservations/ReservationStatusBadge';
import { getAllReservations } from '../../services/reservationApi';

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const shortId = (id) => (id ? `…${id.slice(-6)}` : '—');

const BookingDashboardPage = () => {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const res = await getAllReservations();
      if (res.success && Array.isArray(res.data)) {

        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecent(sorted.slice(0, 6));
      }
    } catch {

    } finally {
      setLoadingRecent(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-8">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Booking Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Live reservation summary · Last refreshed{' '}
            {lastRefreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={fetchRecent}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-charcoal-900 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      <BookingStatsCards />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <button
          onClick={() => navigate('/reservations/pending')}
          className="group flex items-center justify-between bg-amber-50 hover:bg-amber-100 border border-amber-100 hover:border-amber-200 text-amber-700 rounded-2xl p-5 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-bold text-sm">Pending Reservations</div>
              <div className="text-xs text-amber-600/80 font-medium mt-0.5">
                Review and approve new bookings
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => navigate('/reservations')}
          className="group flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 text-charcoal-900 rounded-2xl p-5 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
              <List className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="font-bold text-sm">All Reservations</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">
                Search, filter and manage all bookings
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-charcoal-900">Recent Activity</h2>
          <button
            onClick={() => navigate('/reservations')}
            className="text-xs font-semibold text-lime-600 hover:text-lime-700 transition-colors"
          >
            View all →
          </button>
        </div>

        {loadingRecent ? (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
                  <div className="h-2.5 w-1/2 bg-gray-100 rounded-full" />
                </div>
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
            No reservations yet
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/reservations/${r.id}`)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 cursor-pointer transition-colors group"
              >

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    r.status === 'Pending'
                      ? 'bg-amber-100 text-amber-700'
                      : r.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : r.status === 'Cancelled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {r.prosumerNic ? r.prosumerNic.slice(-2) : '??'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-charcoal-900 truncate">
                    {r.prosumerNic || '—'}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">
                    {r.stationName || r.stationId} · {formatDate(r.reservationDate)}{' '}
                    {r.startTime && `· ${r.startTime}`}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <ReservationStatusBadge status={r.status} />
                  <span className="text-gray-300 group-hover:text-gray-400 transition-colors text-sm">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookingDashboardPage;
