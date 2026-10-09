import { useEffect, useState } from 'react';
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

  if (!qr) return null;

  const canManage = Boolean(onRegenerate || onDelete || onSave) && qr.transferStatus !== 'Completed';

  const copyCode = async () => {
    if (!qr.qrPayload) return;
    await navigator.clipboard.writeText(qr.qrPayload);
    setCopied(true);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-lime-600">Booking confirmed</p>
            <h3 className="text-xl font-bold text-charcoal-900 mt-1">{qr.stationName || 'Station'}</h3>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {qr.qrImageBase64 && (
          <img
            alt="Booking QR code"
            className="mx-auto mt-5 w-52 h-52 rounded-2xl border border-gray-100"
            src={`data:image/png;base64,${qr.qrImageBase64}`}
          />
        )}

        {editing ? (
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Station</span>
              <input
                value={form.stationName}
                onChange={(event) => setForm({ ...form, stationName: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase text-gray-400">Energy (kWh)</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.energyAmountKwh}
                onChange={(event) => setForm({ ...form, energyAmountKwh: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase text-gray-400">Start</span>
              <input
                type="time"
                value={form.startTime}
                onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </label>
            <label className="col-span-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">End</span>
              <input
                type="time"
                value={form.endTime}
                onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              />
            </label>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase text-gray-400">NIC</p>
              <p className="font-bold mt-1">{qr.prosumerNic}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase text-gray-400">Energy</p>
              <p className="font-bold mt-1">{qr.energyAmountKwh} kWh</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase text-gray-400">Date</p>
              <p className="font-bold mt-1">{qr.reservationDate ? new Date(qr.reservationDate).toLocaleDateString() : ''}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase text-gray-400">Time</p>
              <p className="font-bold mt-1">{qr.startTime || '—'} – {qr.endTime || '—'}</p>
            </div>
          </div>
        )}

        {qr.qrPayload && !editing && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase text-gray-400">QR text</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={qr.qrPayload}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-charcoal-900"
                onFocus={(event) => event.target.select()}
              />
              <button
                type="button"
                onClick={copyCode}
                className="shrink-0 px-3 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {canManage && !editing && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(onRegenerate)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-2 py-3 transition hover:border-charcoal-900 hover:bg-white disabled:opacity-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-900 text-white">
                <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
              </span>
              <span className="text-xs font-bold text-charcoal-900">Regenerate</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-2 py-3 transition hover:border-blue-300 hover:bg-white disabled:opacity-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Pencil className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-charcoal-900">Edit</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(onDelete)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-2 py-3 transition hover:border-red-300 hover:bg-white disabled:opacity-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-charcoal-900">Delete</span>
            </button>
          </div>
        )}

        {canManage && editing && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
              className="rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={save}
              className="rounded-xl bg-lime-400 py-3 text-sm font-bold text-charcoal-900 disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">{qr.message || 'Show this QR to the grid operator at the booked time.'}</p>
      </div>
    </div>
  );
}
