import { useState } from 'react';
import { Copy, X } from 'lucide-react';

export default function BookingQrModal({ qr, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!qr) return null;

  const copyCode = async () => {
    if (!qr.qrPayload) return;
    await navigator.clipboard.writeText(qr.qrPayload);
    setCopied(true);
  };

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
            <p className="font-bold mt-1">{qr.startTime} – {qr.endTime}</p>
          </div>
        </div>
        {qr.qrPayload && (
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
            <p className="mt-2 text-xs text-gray-500">Copy this text and paste it on Scan QR, then click Verify.</p>
          </div>
        )}
        <p className="mt-4 text-sm text-gray-500">{qr.message || 'Show this QR to the grid operator at the booked time.'}</p>
      </div>
    </div>
  );
}
