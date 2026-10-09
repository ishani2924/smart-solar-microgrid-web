import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Pencil, RefreshCw, Trash2, X } from 'lucide-react';

export default function BookingQrModal({ qr, onClose, onRegenerate, onDelete, onSave }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    stationName: '',
    energyAmountKwh: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (!qr) return;
    setCopied(false);
    setEditing(false);
    setForm({
      stationName: qr.stationName || '',
      energyAmountKwh: qr.energyAmountKwh ?? '',
      startTime: qr.startTime || '',
      endTime: qr.endTime || '',
    });
  }, [qr]);

  useEffect(() => {
    if (!qr) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qr, onClose]);

  useEffect(() => {
    if (!qr) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [qr]);

  if (!qr) return null;

  const canManage = Boolean(onRegenerate || onDelete || onSave) && qr.transferStatus !== 'Completed';

  const copyCode = async () => {
    if (!qr.qrPayload) return;
    try {
      await navigator.clipboard.writeText(qr.qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const save = () => run(async () => {
    await onSave?.({
      stationName: form.stationName,
      energyAmountKwh: Number(form.energyAmountKwh),
      startTime: form.startTime,
      endTime: form.endTime,
    });
    setEditing(false);
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-charcoal-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Close Button (Cross mark) */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 bg-white/95 backdrop-blur shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lime-500 shrink-0 animate-pulse" />
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-lime-600 truncate">
                Booking confirmed
              </p>
            </div>
            <h3
              className="text-lg sm:text-xl font-bold text-charcoal-900 mt-0.5 truncate"
              title={qr.stationName || 'Station'}
            >
              {qr.stationName || 'Station'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-charcoal-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-4 sm:space-y-5 flex-1">
          {/* QR Image */}
          {qr.qrImageBase64 && (
            <div className="flex justify-center">
              <div className="relative p-2.5 sm:p-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
                <img
                  alt="Booking QR code"
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-xl"
                  src={`data:image/png;base64,${qr.qrImageBase64}`}
                />
              </div>
            </div>
          )}

          {/* Details or Edit Form */}
          {editing ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-sm">
              <label className="col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Station</span>
                <input
                  value={form.stationName}
                  onChange={(event) => setForm({ ...form, stationName: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </label>
              <label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Energy (kWh)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.energyAmountKwh}
                  onChange={(event) => setForm({ ...form, energyAmountKwh: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </label>
              <label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Start Time</span>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </label>
              <label className="col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">End Time</span>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
              <div className="rounded-2xl bg-gray-50/80 border border-gray-100 p-2.5 sm:p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">NIC</p>
                <p className="font-bold text-charcoal-900 mt-0.5 truncate text-xs sm:text-sm" title={qr.prosumerNic}>
                  {qr.prosumerNic || '—'}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50/80 border border-gray-100 p-2.5 sm:p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Energy</p>
                <p className="font-bold text-charcoal-900 mt-0.5 text-xs sm:text-sm">
                  {qr.energyAmountKwh} kWh
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50/80 border border-gray-100 p-2.5 sm:p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</p>
                <p className="font-bold text-charcoal-900 mt-0.5 text-xs sm:text-sm">
                  {qr.reservationDate ? new Date(qr.reservationDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50/80 border border-gray-100 p-2.5 sm:p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time</p>
                <p className="font-bold text-charcoal-900 mt-0.5 text-xs sm:text-sm">
                  {qr.startTime || '—'} – {qr.endTime || '—'}
                </p>
              </div>
            </div>
          )}

          {/* QR Payload Text and Copy button */}
          {qr.qrPayload && !editing && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">QR text</p>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  readOnly
                  value={qr.qrPayload}
                  className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-lime-400"
                  onFocus={(event) => event.target.select()}
                />
                <button
                  type="button"
                  onClick={copyCode}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Grid Operator / Admin Management Controls */}
          {canManage && !editing && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => run(onRegenerate)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 px-2 py-2.5 sm:py-3 transition hover:border-charcoal-900 hover:bg-white disabled:opacity-50 cursor-pointer"
              >
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-charcoal-900 text-white">
                  <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-charcoal-900">Regenerate</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(true)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 px-2 py-2.5 sm:py-3 transition hover:border-blue-300 hover:bg-white disabled:opacity-50 cursor-pointer"
              >
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Pencil className="h-4 w-4" />
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-charcoal-900">Edit</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(onDelete)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 px-2 py-2.5 sm:py-3 transition hover:border-red-300 hover:bg-white disabled:opacity-50 cursor-pointer"
              >
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Trash2 className="h-4 w-4" />
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-charcoal-900">Delete</span>
              </button>
            </div>
          )}

          {/* Edit Actions: Cancel & Save */}
          {canManage && editing && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(false)}
                className="rounded-xl border border-gray-200 bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={save}
                className="rounded-xl bg-lime-400 hover:bg-lime-500 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-charcoal-900 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Save changes
              </button>
            </div>
          )}

          {/* Footer note */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            {qr.message || 'Booking confirmed. Show this QR to the grid operator at the slot time.'}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
