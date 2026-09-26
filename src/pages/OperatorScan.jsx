import { useEffect, useRef, useState } from 'react';
import { transferAPI } from '../services/api';

const OperatorScan = () => {
  const scannerRef = useRef(null);
  const busyRef = useRef(false);
  const regionId = 'operator-qr-reader';
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      } catch {
        setError('Camera is unavailable. Paste the scanned code instead.');
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

  const verify = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const response = await transferAPI.verifyQr(payload.trim());
      setResult(response.data);
    } catch (err) {
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
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'The transfer could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-2xl font-bold text-charcoal-900">Scan booking QR</h2>
      <p className="text-sm text-gray-500 mt-2">
        Scan the prosumer QR during the booked time. A match starts the energy transfer.
      </p>

      <div id={regionId} className="mt-6 overflow-hidden rounded-2xl bg-gray-50 min-h-48" />

      <form
        className="mt-6 flex flex-col sm:flex-row gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          verify(manualCode);
        }}
      >
        <input
          value={manualCode}
          onChange={(event) => setManualCode(event.target.value)}
          placeholder="Or paste the QR text"
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
        />
        <button type="submit" disabled={loading} className="px-5 py-3 rounded-xl bg-charcoal-900 text-white font-semibold">
          Verify
        </button>
      </form>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 rounded-2xl bg-lime-50 p-5 text-sm space-y-2">
          <p className="font-semibold text-lime-800">{result.message}</p>
          <p>Status: {result.transferStatus}</p>
          <p>Station: {result.stationName || result.stationId}</p>
          <p>NIC: {result.prosumerNic}</p>
          <p>Time: {result.startTime} - {result.endTime}</p>
          {result.transferStatus === 'InTransfer' && (
            <button type="button" onClick={complete} disabled={loading} className="mt-3 px-4 py-2 rounded-xl bg-lime-400 font-semibold">
              Mark transfer completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OperatorScan;
