/**
 * ReservationStatusBadge.jsx
 * A colored pill badge for reservation statuses.
 * Colors: Pending=amber, Approved=green, Cancelled=red, Completed=sky
 */

import React from 'react';

const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    dot: 'bg-amber-400',
  },
  Approved: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    dot: 'bg-emerald-400',
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-200',
    dot: 'bg-red-400',
  },
  Completed: {
    label: 'Completed',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    ring: 'ring-sky-200',
    dot: 'bg-sky-400',
  },
};

const ReservationStatusBadge = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    ring: 'ring-gray-200',
    dot: 'bg-gray-400',
  };

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1.5 text-sm gap-2'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ring-1 ${config.bg} ${config.text} ${config.ring} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default ReservationStatusBadge;
