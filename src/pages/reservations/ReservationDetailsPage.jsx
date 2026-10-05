/**
 * ReservationDetailsPage.jsx
 * Route: /reservations/:id
 * Role: GridOperator, Backoffice
 *
 * Full detail view for a single reservation.
 * Actions shown by status:
 *   Pending   → [Approve] [Cancel]
 *   Approved  → [Cancel]
 *   Completed → read-only
 *   Cancelled → read-only
 *
 * Cancel includes a confirmation step.
 * Backend enforces 12-hour rule — errors are shown in the UI.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Trash2,
  Calendar, Clock, MapPin, User, Zap, FileText,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ReservationStatusBadge from '../../components/reservations/ReservationStatusBadge';
import {
  getReservationById,
  approveReservation,
  cancelReservation,
  deleteReservation,
} from '../../services/reservationApi';

const Field = ({ label, value, icon: Icon, mono = false }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
    <div className={`text-sm font-semibold text-charcoal-900 ${mono ? 'font-mono' : ''}`}>
      {value || '—'}
    </div>
  </div>
);

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : '—';

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

const ReservationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action states
  const [approving, setApproving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getReservationById(id);
        if (res.success) setReservation(res.data);
        else setError('Reservation not found.');
      } catch {
        setError('Failed to load reservation. Check your connection and the API.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    setActionError(null);
    try {
      const res = await approveReservation(id);
      if (res.success) setReservation(res.data);
    } catch (err) {
      setActionError(
        err?.response?.data?.message || 'Failed to approve the reservation.'
      );
    } finally {
      setApproving(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setActionError(null);
    try {
      const res = await cancelReservation(id);
      if (res.success) {
        setReservation(res.data);
        setShowCancelConfirm(false);
      }
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          'Cannot cancel within 12 hours of the scheduled time.'
      );
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setActionError(null);
    try {
      const res = await deleteReservation(id);
      if (res.success) navigate('/reservations', { replace: true });
    } catch (err) {
      setActionError(
        err?.response?.data?.message || 'Failed to delete the reservation.'
      );
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const isBackoffice = user?.role === 'Backoffice';
  const canApprove = reservation?.status === 'Pending';
  const canCancel =
    reservation?.status === 'Pending' || reservation?.status === 'Approved';
  const isReadOnly =
    reservation?.status === 'Completed' || reservation?.status === 'Cancelled';

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 h-96" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-charcoal-900 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Back navigation */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </motion.div>

      {/* Page title row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-charcoal-900">Reservation Details</h1>
            <ReservationStatusBadge status={reservation.status} size="lg" />
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">{reservation.id}</p>
        </div>
      </motion.div>

      {/* Action error */}
      {actionError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium"
        >
          {actionError}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main detail card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Status stripe */}
          <div
            className={`h-1 ${
              reservation.status === 'Pending'
                ? 'bg-amber-400'
                : reservation.status === 'Approved'
                ? 'bg-emerald-500'
                : reservation.status === 'Cancelled'
                ? 'bg-red-400'
                : 'bg-sky-400'
            }`}
          />

          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Prosumer NIC" value={reservation.prosumerNic} icon={User} mono />
            <Field
              label="Station"
              value={reservation.stationName || reservation.stationId}
              icon={MapPin}
            />
            <Field label="Station ID" value={reservation.stationId} />
            <Field label="Slot ID" value={reservation.slotId} />
            <Field
              label="Reservation Date"
              value={formatDate(reservation.reservationDate)}
              icon={Calendar}
            />
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
              value={
                reservation.energyAmountKwh != null
                  ? `${reservation.energyAmountKwh} kWh`
                  : '—'
              }
              icon={Zap}
            />
            {reservation.notes && (
              <div className="sm:col-span-2">
                <Field label="Prosumer Notes" value={reservation.notes} icon={FileText} />
              </div>
            )}
          </div>

          {/* Timestamps section */}
          <div className="px-8 pb-8">
            <div className="h-px bg-gray-100 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Created" value={formatDateTime(reservation.createdAt)} />
              <Field label="Updated" value={formatDateTime(reservation.updatedAt)} />
              {reservation.approvedAt && (
                <Field label="Approved" value={formatDateTime(reservation.approvedAt)} />
              )}
              {reservation.cancelledAt && (
                <Field label="Cancelled" value={formatDateTime(reservation.cancelledAt)} />
              )}
              {reservation.completedAt && (
                <Field label="Completed" value={formatDateTime(reservation.completedAt)} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          {/* Actions card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Actions
            </div>

            {isReadOnly ? (
              <div className="text-sm text-gray-500 font-medium py-2">
                {reservation.status === 'Completed'
                  ? '✓ Energy transfer completed. No actions available.'
                  : '✕ Reservation has been cancelled. No actions available.'}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-sm py-3 rounded-xl transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {approving ? 'Approving…' : 'Approve Reservation'}
                  </button>
                )}

                {canCancel && (
                  <>
                    {showCancelConfirm ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-xs font-semibold text-red-700 mb-3">
                          Cancel this reservation? The 12-hour rule will be checked by the backend.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold text-xs py-2 rounded-lg transition-all"
                          >
                            {cancelling ? 'Cancelling…' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-lg bg-white hover:bg-gray-50 transition-all"
                          >
                            Keep It
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm py-3 rounded-xl bg-white transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Reservation
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Backoffice hard-delete */}
          {isBackoffice && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Backoffice
              </div>
              <p className="text-xs text-gray-400 font-medium mb-4">
                Permanently removes the record from the database.
              </p>
              {showDeleteConfirm ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-semibold text-red-700 mb-3">
                    This action is permanent and cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-300 text-white font-semibold text-xs py-2 rounded-lg transition-all"
                    >
                      {deleting ? 'Deleting…' : 'Delete Forever'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-lg bg-white hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 border border-red-100 text-red-500 hover:bg-red-50 font-semibold text-sm py-2.5 rounded-xl bg-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Record
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReservationDetailsPage;
