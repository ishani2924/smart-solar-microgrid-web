import { useEffect, useRef, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Loader2, MapPin, QrCode, ShieldCheck, Zap } from 'lucide-react';
import { transferAPI } from '../services/api';
import { fetchSlots, fetchStationById } from '../services/MicrogridService';

const statusLabel = (status) => {
  if (status === 'InTransfer') return 'Verified';
  if (status === 'Completed') return 'Completed';
  if (status === 'QrIssued') return 'QR issued';
  return status || 'Verified';
};

const OperatorScan = () => {
  const scannerRef = useRef(null);
  const busyRef = useRef(false);
  const regionId = 'operator-qr-reader';
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    let scanner;
    let stopped = false;

    const startScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (stopped) return;
      scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 8, qrbox: 220 },
          (decodedText) => {
            if (busyRef.current) return;
            busyRef.current = true;
            verify(decodedText);
          }
        );
        if (!stopped) setCameraOn(true);
      } catch {
        setCameraOn(false);
      }
    };

    startScanner();

    return () => {
      stopped = true;
      const active = scannerRef.current;
      if (active?.isScanning) {
        active.stop().catch(() => {});
      }
    };
  }, []);

  const withBookingDetails = async (data) => {
    let stationName = data.stationName;
    let startTime = data.startTime;
    let endTime = data.endTime;

    try {
      if (data.stationId && !stationName) {
        const station = await fetchStationById(data.stationId);
        stationName = station?.name || station?.stationName || stationName;
      }
      if (data.stationId && data.slotId && (!startTime || !endTime)) {
        const slots = await fetchSlots(data.stationId);
        const slot = (slots || []).find((item) => item.slotId === data.slotId || item.id === data.slotId);
        if (slot) {
          startTime = startTime || slot.startTime;
          endTime = endTime || slot.endTime;
        }
      }
    } catch {
      // The transfer is already verified. Missing station text should not hide the result.
    }

    return { ...data, stationName, startTime, endTime };
  };

  const verify = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const response = await transferAPI.verifyQr(payload.trim());
      setResult(await withBookingDetails(response.data));
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.message || 'The QR code could not be verified.');
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const complete = async () => {
    if (!result?.reservationId) return;
    setLoading(true);
    setError('');
    try {
      const response = await transferAPI.completeTransfer(result.reservationId);
      setResult(await withBookingDetails(response.data));
    } catch (err) {
      setError(err.response?.data?.message || 'The transfer could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const dateLabel = result?.reservationDate
    ? new Date(result.reservationDate).toLocaleDateString()
    : '—';
  const timeLabel = result?.startTime && result?.endTime
    ? `${result.startTime} – ${result.endTime}`
    : '—';
  const verified = result?.transferStatus === 'InTransfer' || result?.transferStatus === 'Completed';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-lime-600">Energy transfer</p>
        <h2 className="mt-1 text-2xl font-bold text-charcoal-900">Scan booking QR</h2>
        <p className="mt-2 text-sm text-gray-500">
          Paste the code from the prosumer QR. A match confirms the booking and starts the transfer.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div
          id={regionId}
          className={cameraOn ? 'overflow-hidden rounded-2xl bg-gray-950 min-h-56' : 'hidden'}
        />

        {!cameraOn && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <QrCode className="h-6 w-6 text-charcoal-900" />
            </div>
            <p className="font-semibold text-charcoal-900">Camera is off</p>
            <p className="mt-1 text-sm text-gray-500">Paste the QR text below to verify this booking.</p>
          </div>
        )}

        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            verify(manualCode);
          }}
        >
          <input
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
            placeholder="Paste QR text"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-charcoal-900 outline-none focus:border-lime-400"
          />
          <button
            type="submit"
            disabled={loading || !manualCode.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Verify
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>

      {result && (
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className={`absolute bottom-0 left-0 top-0 w-1 ${verified ? 'bg-lime-400' : 'bg-gray-200'}`} />
          <div className="flex items-start justify-between gap-4 pl-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100">
                <CheckCircle2 className="h-5 w-5 text-lime-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-lime-600">Transfer</p>
                <h3 className="text-lg font-bold text-charcoal-900">{result.message}</h3>
              </div>
            </div>
            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-700">
              {statusLabel(result.transferStatus)}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 pl-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                <MapPin className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Station</p>
                <p className="font-bold text-charcoal-900">{result.stationName || 'Station'}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase text-gray-400">Prosumer NIC</p>
              <p className="mt-1 font-bold text-charcoal-900">{result.prosumerNic}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Date</p>
                <p className="font-bold text-charcoal-900">{dateLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Time</p>
                <p className="font-bold text-charcoal-900">{timeLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 sm:col-span-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Energy</p>
                <p className="font-bold text-charcoal-900">{result.energyAmountKwh} kWh</p>
              </div>
            </div>
          </div>

          {result.transferStatus === 'InTransfer' && (
            <button
              type="button"
              onClick={complete}
              disabled={loading}
              className="ml-3 mt-5 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 font-semibold text-charcoal-900 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Mark transfer completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OperatorScan;
