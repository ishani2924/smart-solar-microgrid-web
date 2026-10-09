import { Check } from 'lucide-react';
import { transferAPI } from '../services/api';

const STEPS = ['Booked', 'Approved', 'QR issued', 'Verified', 'Completed'];

export const transferStepIndex = (status, transferStatus) => {
  if (status === 'Cancelled') return -1;
  if (status === 'Completed' || transferStatus === 'Completed') return 4;
  if (transferStatus === 'InTransfer') return 3;
  if (transferStatus === 'QrIssued') return 2;
  if (status === 'Approved') return 1;
  return 0;
};

export const transferStepMessage = (status, transferStatus) => {
  const step = transferStepIndex(status, transferStatus);
  if (step < 0) return 'This booking was cancelled.';
  return [
    'Waiting for the grid operator to approve this booking.',
    'Approved. The QR is created when the operator opens it.',
    'QR is ready. Show it at the station so the operator can verify it.',
    'QR verified. The energy transfer is in progress.',
    'Energy transfer completed.',
  ][step];
};

export async function fetchTransferStatuses(bookings) {
  const entries = await Promise.all(
    (bookings || []).map(async (booking) => {
      if (!booking?.id || booking.status === 'Pending' || booking.status === 'Cancelled') {
        return [booking.id, null];
      }
      try {
        const response = await transferAPI.getConfirmation(booking.id);
        return [booking.id, response.data?.transferStatus || null];
      } catch {
        return [booking.id, null];
      }
    })
  );
  return Object.fromEntries(entries);
}

export default function TransferStatusBar({ status, transferStatus }) {
  const current = transferStepIndex(status, transferStatus);
  const cancelled = current < 0;

  return (
    <div>
      <div className="flex items-center">
        {STEPS.map((label, index) => {
          const finished = !cancelled && current === STEPS.length - 1;
          const done = !cancelled && (index < current || (finished && index === current));
          const active = !cancelled && index === current && !finished;
          const reached = done || active;
          return (
            <div key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex min-w-0 flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                    cancelled
                      ? 'border-gray-200 bg-white text-gray-300'
                      : reached
                        ? 'border-lime-500 bg-lime-400 text-charcoal-900'
                        : 'border-gray-200 bg-white text-gray-300'
                  } ${active ? 'ring-4 ring-lime-100' : ''}`}
                >
                  {done || (active && current === 4) ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <span className={`mt-2 text-center text-[10px] font-bold leading-tight ${reached ? 'text-charcoal-900' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`mx-1 mb-5 h-0.5 flex-1 rounded-full ${!cancelled && index < current ? 'bg-lime-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className={`mt-3 text-xs font-medium ${cancelled ? 'text-red-500' : 'text-gray-500'}`}>
        {transferStepMessage(status, transferStatus)}
      </p>
    </div>
  );
}
