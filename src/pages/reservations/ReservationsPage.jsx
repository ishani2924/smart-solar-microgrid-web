

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReservationFilters from '../../components/reservations/ReservationFilters';
import ReservationTable from '../../components/reservations/ReservationTable';
import { getAllReservations, searchReservations, cancelReservation } from '../../services/reservationApi';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setIsFiltered(false);
    try {
      const res = await getAllReservations();
      if (res.success) setReservations(res.data || []);
    } catch {

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSearch = async (params) => {
    const hasValues = Object.values(params).some((v) => v !== '');
    if (!hasValues) {
      loadAll();
      return;
    }
    setSearchLoading(true);
    setIsFiltered(true);
    try {
      const res = await searchReservations(params);
      if (res.success) setReservations(res.data || []);
    } catch {
      setReservations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCancelClick = (id) => {
    setCancelTarget(id);
    setCancelError(null);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelReservation(cancelTarget);
      if (res.success) {
        setCancelTarget(null);

        if (isFiltered) {

          setReservations((prev) =>
            prev.map((r) =>
              r.id === cancelTarget ? { ...r, status: 'Cancelled' } : r
            )
          );
        } else {
          loadAll();
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Failed to cancel reservation. The 12-hour rule may apply.';
      setCancelError(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-charcoal-900">All Reservations</h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          Manage and search all energy booking reservations
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ReservationFilters onSearch={handleSearch} loading={searchLoading} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ReservationTable
          data={reservations}
          loading={loading || searchLoading}
          showApprove={false}
          showCancel={true}
          onCancel={handleCancelClick}
          emptyMessage={
            isFiltered
              ? 'No reservations match your search criteria.'
              : 'No reservations found.'
          }
        />
      </motion.div>

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm"
            onClick={() => setCancelTarget(null)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-base font-bold text-charcoal-900 mb-2">Cancel Reservation?</h3>
            <p className="text-sm text-gray-500 mb-4 font-medium">
              Are you sure you want to cancel this reservation? The backend will verify the 12-hour
              rule before proceeding.
            </p>

            {cancelError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {cancelError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => { setCancelTarget(null); setCancelError(null); }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm py-2.5 rounded-xl bg-white hover:bg-gray-50 transition-all"
              >
                Keep It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
