/**
 * ReservationFilters.jsx
 * Search and filter panel for reservation pages.
 * Emits onSearch(params) callback on Submit; onClear() on Clear.
 * Props:
 *   onSearch(params: { nic, stationId, status, from, to }) → void
 *   loading: boolean
 */

import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Completed', label: 'Completed' },
];

const ReservationFilters = ({ onSearch, loading = false }) => {
  const [filters, setFilters] = useState({
    nic: '',
    stationId: '',
    status: '',
    from: '',
    to: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const empty = { nic: '', stationId: '', status: '', from: '', to: '' };
    setFilters(empty);
    onSearch(empty);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-charcoal-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all';

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-bold text-charcoal-900">Search & Filter</span>
        {hasActiveFilters && (
          <span className="ml-1 w-2 h-2 rounded-full bg-lime-500" title="Filters active" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Prosumer NIC */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Prosumer NIC
          </label>
          <input
            type="text"
            name="nic"
            value={filters.nic}
            onChange={handleChange}
            placeholder="e.g. 200012345678"
            className={inputClass}
          />
        </div>

        {/* Station ID */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Station ID
          </label>
          <input
            type="text"
            name="stationId"
            value={filters.stationId}
            onChange={handleChange}
            placeholder="e.g. ST001"
            className={inputClass}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* From Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            From Date
          </label>
          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            To Date
          </label>
          <input
            type="date"
            name="to"
            value={filters.to}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-all"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Searching…' : 'Search'}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 text-gray-500 hover:text-charcoal-900 font-semibold text-sm px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-all"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </form>
  );
};

export default ReservationFilters;
