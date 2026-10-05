

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Calendar, Zap, MapPin, User, Clock } from 'lucide-react';
import { getReservationById } from '../../services/reservationApi';
import ReservationStatusBadge from './ReservationStatusBadge';

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
    <div className="text-sm font-semibold text-charcoal-900">{value || '—'}</div>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const ReservationDetailsModal = ({
  reservationId,
  onClose,
  onApprove,
  onCancel,
  userRole,
}) => {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!reservationId) {
      setReservation(null);
      setError(null);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getReservationById(reservationId);
        if (res.success) setReservation(res.data);
        else setError('Reservation not found.');
      } catch {
        setError('Failed to load reservation details.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [reservationId]);

  const handleApprove = async () => {
    if (!onApprove) return;
    setActionLoading(true);
    try {
      await onApprove(reservation.id);
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setActionLoading(true);
    try {
      await onCancel(reservation.id);
      setShowCancelConfirm(false);
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const canApprove = reservation?.status === 'Pending' && onApprove;
  const canCancel =
    (reservation?.status === 'Pending' || reservation?.status === 'Approved') && onCancel;

  return (
    <AnimatePresence>
      {reservationId && (
        <>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-charcoal-900">Reservation Details</h2>
                {reservation && (
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{reservation.id}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loading && (
                <div className="flex flex-col gap-4 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                      <div className="h-4 w-3/4 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {reservation && !loading && (
                <div className="flex flex-col gap-6">

                  <div className="flex items-center gap-3">
                    <ReservationStatusBadge status={reservation.status} size="lg" />
                    {reservation.approvedAt && (
                      <span className="text-xs text-gray-400 font-medium">
                        Approved {formatDateTime(reservation.approvedAt)}
                      </span>
                    )}
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Prosumer NIC" value={reservation.prosumerNic} icon={User} />
                    <Field label="Station" value={reservation.stationName || reservation.stationId} icon={MapPin} />
                    <Field label="Station ID" value={reservation.stationId} />
                    <Field label="Slot ID" value={reservation.slotId} />
                    <Field label="Reservation Date" value={formatDate(reservation.reservationDate)} icon={Calendar} />
                    <Field
                      label="Time Slot"
                      value={
                        reservation.startTime && reservation.endTime
                          ? `${reservation.startTime} – ${reservation.endTime}`
                          : reservation.startTime || '—'
                      }
                      icon={Clock}
                    />
                    <Field
                      label="Energy Amount"
                      value={reservation.energyAmountKwh != null ? `${reservation.energyAmountKwh} kWh` : '—'}
                      icon={Zap}
                    />
                    {reservation.notes && (
                      <div className="col-span-2">
                        <Field label="Notes" value={reservation.notes} />
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Created" value={formatDateTime(reservation.createdAt)} />
                    <Field label="Last Updated" value={formatDateTime(reservation.updatedAt)} />
                    {reservation.cancelledAt && (
                      <Field label="Cancelled At" value={formatDateTime(reservation.cancelledAt)} />
                    )}
                    {reservation.completedAt && (
                      <Field label="Completed At" value={formatDateTime(reservation.completedAt)} />
                    )}
                  </div>

                  {reservation.status === 'Completed' && (
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-sky-700 text-sm font-medium">
                      ✓ Energy transfer completed. This reservation is read-only.
                    </div>
                  )}
                  {reservation.status === 'Cancelled' && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium">
                      ✕ This reservation has been cancelled.
                    </div>
                  )}
                </div>
              )}
            </div>

            {reservation && !loading && (canApprove || canCancel) && (
              <div className="px-6 py-5 border-t border-gray-100 flex flex-col gap-3">

                {showCancelConfirm ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-red-700 mb-3">
                      Are you sure you want to cancel this reservation? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold text-sm py-2 rounded-xl transition-all"
                      >
                        {actionLoading ? 'Cancelling…' : 'Yes, Cancel'}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-2 rounded-xl bg-white hover:bg-gray-50 transition-all"
                      >
                        Keep Reservation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {canApprove && (
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading ? 'Approving…' : 'Approve'}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm py-2.5 rounded-xl bg-white transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReservationDetailsModal;
