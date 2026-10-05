/**
 * BookingHistoryPage.jsx
 * Route: /reservations/history
 * Role: GridOperator, Backoffice
 *
 * Shows past reservations (Completed, Cancelled, or All past).
 * Tab interface: Completed | Cancelled | All
 * Read-only — no approve/cancel actions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { History, CheckCircle2, XCircle, LayoutList, RefreshCw } from 'lucide-react';
import ReservationTable from '../../components/reservations/ReservationTable';
import ReservationFilters from '../../components/reservations/ReservationFilters';
import { searchReservations } from '../../services/reservationApi';

const TABS = [
  { id: 'all', label: 'All Past', icon: LayoutList, statusFilter: null },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, statusFilter: 'Completed' },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle, statusFilter: 'Cancelled' },
];

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraFilters, setExtraFilters] = useState({});

  const currentTab = TABS.find((t) => t.id === activeTab);

  const fetchData = useCallback(async (tabId = activeTab, extra = extraFilters) => {
    setLoading(true);
    const tab = TABS.find((t) => t.id === tabId);
    try {
      const params = {
        ...extra,
        ...(tab?.statusFilter ? { status: tab.statusFilter } : {}),
      };

      // For "All Past" with no status filter, fetch completed + cancelled
      if (!tab?.statusFilter && !extra.status) {
        const [completedRes, cancelledRes] = await Promise.all([
          searchReservations({ ...extra, status: 'Completed' }),
          searchReservations({ ...extra, status: 'Cancelled' }),
        ]);
        const combined = [
          ...(completedRes.success ? completedRes.data : []),
          ...(cancelledRes.success ? cancelledRes.data : []),
        ].sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));
        setReservations(combined);
      } else {
        const res = await searchReservations(params);
        if (res.success) setReservations(res.data || []);
      }
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, extraFilters]);

  useEffect(() => {
    fetchData(activeTab, extraFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setExtraFilters({});
  };

  const handleSearch = (params) => {
    setExtraFilters(params);
    fetchData(activeTab, params);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <History className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Booking History</h1>
            <p className="text-sm text-gray-400 mt-0.5 font-medium">
              Completed and cancelled reservations
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchData(activeTab, extraFilters)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-charcoal-900 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 bg-gray-100/80 p-1 rounded-2xl w-fit"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-gray-500 hover:text-charcoal-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? tab.id === 'completed'
                      ? 'text-emerald-500'
                      : tab.id === 'cancelled'
                      ? 'text-red-500'
                      : 'text-gray-600'
                    : 'text-gray-400'
                }`}
              />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ReservationFilters onSearch={handleSearch} loading={loading} />
      </motion.div>

      {/* Summary line */}
      {!loading && (
        <div className="text-sm font-medium text-gray-400">
          Showing{' '}
          <span className="text-charcoal-900 font-bold">{reservations.length}</span>{' '}
          {currentTab?.label.toLowerCase()} reservation
          {reservations.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Read-only table */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <ReservationTable
          data={reservations}
          loading={loading}
          showApprove={false}
          showCancel={false}
          emptyMessage={`No ${currentTab?.label.toLowerCase() || 'past'} reservations found.`}
        />
      </motion.div>
    </div>
  );
};

export default BookingHistoryPage;
