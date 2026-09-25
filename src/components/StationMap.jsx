import { useEffect, useRef, useState } from 'react';
import { fetchStations } from '../services/MicrogridService';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function loadGoogleMaps(apiKey) {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.dataset.googleMaps = 'true';
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });
}

export default function StationMap({ heightClass = 'h-[520px]' }) {
  const mapRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const showStations = async () => {
      try {
        const data = await fetchStations();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setStations(list);

        if (!MAPS_KEY) {
          setError('Add VITE_GOOGLE_MAPS_API_KEY to smart-solar-microgrid-web/.env.local and restart the web app.');
          return;
        }

        const maps = await loadGoogleMaps(MAPS_KEY);
        if (cancelled || !mapRef.current) return;

        const validLocation = (station) => {
          const lat = Number(station.latitude);
          const lng = Number(station.longitude);
          return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
        };
        const withLocation = list.filter(validLocation);
        const skipped = list.filter((station) => !validLocation(station));
        if (skipped.length > 0) {
          setError(`${skipped.map((station) => station.name).join(', ')} ${skipped.length === 1 ? 'has' : 'have'} coordinates outside the map. Latitude must be between -90 and 90, and longitude between -180 and 180. Edit that station and save a real location.`);
        }
        const center = withLocation[0]
          ? { lat: Number(withLocation[0].latitude), lng: Number(withLocation[0].longitude) }
          : { lat: 7.8731, lng: 80.7718 };

        const map = new maps.Map(mapRef.current, {
          center,
          zoom: withLocation.length === 1 ? 12 : 7,
          mapTypeControl: false,
          streetViewControl: false,
        });

        const bounds = new maps.LatLngBounds();
        withLocation.forEach((station) => {
          const position = { lat: Number(station.latitude), lng: Number(station.longitude) };
          const marker = new maps.Marker({
            map,
            position,
            title: station.name,
          });
          marker.addListener('click', () => {
            setSelected(station);
            map.panTo(position);
          });
          bounds.extend(position);
        });

        if (withLocation.length > 1) {
          map.fitBounds(bounds, 80);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Stations could not be loaded.');
        }
      }
    };

    showStations();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div ref={mapRef} className={`${heightClass} w-full rounded-3xl bg-gray-100`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stations.map((station) => (
          <button
            key={station.stationId}
            type="button"
            onClick={() => setSelected(station)}
            className="text-left p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-lime-200"
          >
            <p className="font-bold text-sm text-charcoal-900">{station.name}</p>
            <p className="text-xs text-gray-500 mt-1">{station.address}</p>
            <p className="text-xs text-gray-400 mt-1">{station.latitude}, {station.longitude}</p>
          </button>
        ))}
        {stations.length === 0 && !error && (
          <p className="text-sm text-gray-500">No stations yet. Create one first.</p>
        )}
      </div>
      {selected && (
        <div className="rounded-2xl bg-lime-50 p-4 text-sm">
          <p className="font-bold">{selected.name}</p>
          <p>{selected.address}</p>
          <p>Capacity {selected.capacity} kW · Battery {selected.batteryCapacity} kWh · {selected.status}</p>
          <p>Open {selected.openingTime} – {selected.closingTime}</p>
        </div>
      )}
    </div>
  );
}
