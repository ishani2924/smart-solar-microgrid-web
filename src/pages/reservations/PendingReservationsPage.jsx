/**
 * PendingReservationsPage.jsx
 * Route: /reservations/pending
 * Role: GridOperator, Backoffice
 *
 * Shows only Pending reservations in a card layout.
 * Key action: Approve — sends PUT /api/reservations/{id}/approve
 * Secondary action: View → navigates to /reservations/:id
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, Calendar, MapPin, Zap, User, Eye, RefreshCw, Inbox,
} from 'lucide-react';
import { getPendingReservations, approveReservation } from '../../services/reservationApi';

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'long', year: 'numeric',
      })
    : '—';

const formatTime = (start, end) =>
  start && end ? `${start} – ${end}` : start || '—';

const PendingCard = ({ reservation, onApprove, onView, approving }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.25 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
  >
    {/* Top accent stripe */}
    <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-300" />

    <div className="p-6">
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xs font-mono text-gray-400" title={reservation.id}>
              …{reservation.id?.slice(-8)}
            </div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">
              Pending Approval
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-medium">
          {reservation.createdAt
            ? new Date(reservation.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short',
              })
            : ''}
        </div>
      </div>

      {/* Detail fields */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex items-start gap-2">
          <User className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prosumer</div>
            <div className="text-sm font-semibold text-charcoal-900 mt-0.5">
              {reservation.prosumerNic || '—'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Station</div>
            <div className="text-sm font-semibold text-charcoal-900 mt-0.5">
              {reservation.stationName || reservation.stationId || '—'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</div>
            <div className="text-sm font-semibold text-charcoal-900 mt-0.5">
              {formatDate(reservation.reservationDate)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</div>
            <div className="text-sm font-semibold text-charcoal-900 mt-0.5">
              {formatTime(reservation.startTime, reservation.endTime)}
            </div>
          </div>
        </div>

        <div className="col-span-2 flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Energy</div>
            <div className="text-sm font-semibold text-charcoal-900 mt-0.5">
              {reservation.energyAmountKwh != null ? `${reservation.energyAmountKwh} kWh` : '—'}
            </div>
          </div>
        </div>
      </div>

      {reservation.notes && (
        <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</div>
          <p className="text-xs text-gray-600 font-medium">{reservation.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(reservation.id)}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-charcoal-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all"
        >
          <Eye className="w-4 h-4" />
          View
        </button>

        <button
          onClick={() => onApprove(reservation.id)}
          disabled={approving === reservation.id}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2.5 rounded-xl transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          {approving === reservation.id ? 'Approving…' : 'Approve'}
        </button>
      </div>
    </div>
  </motion.div>
);

const PendingReservationsPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null); // id of reservation being approved
  const [error, setError] = useState(null);
  const [approveError, setApproveError] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingReservations();
      if (res.success) setReservations(res.data || []);
    } catch {
      setError('Failed to load pending reservations. Check the API connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id) => {
    setApproving(id);
    setApproveError(null);
    try {
      const res = await approveReservation(id);
      if (res.success) {
        // Remove from list (it's no longer Pending)
        setReservations((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Failed to approve reservation. Please try again.';
      setApproveError(msg);
    } finally {
      setApproving(null);
    }
  };

  const handleView = (id) => navigate(`/reservations/${id}`);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Pending Reservations</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            {!loading && (
              <>
                {reservations.length === 0
                  ? 'All caught up — no pending reservations'
                  : `${reservations.length} reservation${reservations.length !== 1 ? 's' : ''} awaiting approval`}
              </>
            )}
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-charcoal-900 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Approve error banner */}
      {approveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          {approveError}
        </div>
      )}

      {/* API error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-1 bg-amber-100 -mx-6 -mt-6 mb-6 rounded-t-2xl" />
              <div className="flex gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 w-24 bg-gray-100 rounded-full" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-3 w-2/3 bg-gray-100 rounded-full mb-3" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reservations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-charcoal-900 mb-1">All caught up!</h3>
          <p className="text-sm text-gray-400 font-medium">No pending reservations at this time.</p>
        </motion.div>
      )}

      {/* Cards grid */}
      {!loading && reservations.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reservations.map((r) => (
              <PendingCard
                key={r.id}
                reservation={r}
                onApprove={handleApprove}
                onView={handleView}
                approving={approving}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default PendingReservationsPage;
