/**
 * ReservationTable.jsx
 * Sortable data table for reservation lists.
 * Props:
 *   data: ReservationResponseDto[]
 *   loading: boolean
 *   onView(id): navigate to detail page
 *   onApprove(id): approve a reservation (optional)
 *   onCancel(id): cancel a reservation (optional)
 *   showApprove: boolean — show Approve button column
 *   showCancel: boolean — show Cancel button column
 *   emptyMessage: string
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import ReservationStatusBadge from './ReservationStatusBadge';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const shortId = (id) => (id ? `…${id.slice(-6)}` : '—');

const ReservationTable = ({
  data = [],
  loading = false,
  onApprove,
  onCancel,
  showApprove = false,
  showCancel = false,
  emptyMessage = 'No reservations found.',
}) => {
  const navigate = useNavigate();

  const handleView = (id) => navigate(`/reservations/${id}`);

  const hasActions = showApprove || showCancel;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Reservation ID
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Prosumer NIC
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Station
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Time
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Energy (kWh)
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-16 text-center text-gray-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  <td className="px-4 py-4">
                    <span
                      className="font-mono text-xs text-gray-500 cursor-pointer hover:text-charcoal-900 transition-colors"
                      title={r.id}
                    >
                      {shortId(r.id)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-charcoal-900">
                    {r.prosumerNic || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-charcoal-900 leading-tight">
                      {r.stationName || r.stationId || '—'}
                    </div>
                    {r.stationName && r.stationId && (
                      <div className="text-[11px] text-gray-400">{r.stationId}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {formatDate(r.reservationDate)}
                  </td>
                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {r.startTime && r.endTime
                      ? `${r.startTime} – ${r.endTime}`
                      : r.startTime || '—'}
                  </td>
                  <td className="px-4 py-4 font-semibold text-charcoal-900">
                    {r.energyAmountKwh != null ? `${r.energyAmountKwh} kWh` : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <ReservationStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {/* View — always shown */}
                      <button
                        onClick={() => handleView(r.id)}
                        title="View details"
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-charcoal-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      {/* Approve — only for Pending rows when showApprove=true */}
                      {showApprove && r.status === 'Pending' && onApprove && (
                        <button
                          onClick={() => onApprove(r.id)}
                          title="Approve reservation"
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}

                      {/* Cancel — only for Pending/Approved rows when showCancel=true */}
                      {showCancel &&
                        (r.status === 'Pending' || r.status === 'Approved') &&
                        onCancel && (
                          <button
                            onClick={() => onCancel(r.id)}
                            title="Cancel reservation"
                            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer row count */}
      {!loading && data.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 text-xs font-semibold text-gray-400">
          {data.length} {data.length === 1 ? 'reservation' : 'reservations'}
        </div>
      )}
    </div>
  );
};

export default ReservationTable;
