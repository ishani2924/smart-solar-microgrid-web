import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery, Clock, MapPin, X, Zap } from 'lucide-react';
import { fetchStations } from '../services/MicrogridService';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const SRI_LANKA_BOUNDS = {
  north: 10.05,
  south: 5.85,
  west: 79.5,
  east: 82.05,
};

function isInSriLanka(lat, lng) {
  return lat >= SRI_LANKA_BOUNDS.south && lat <= SRI_LANKA_BOUNDS.north
    && lng >= SRI_LANKA_BOUNDS.west && lng <= SRI_LANKA_BOUNDS.east;
}

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
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const infoWindowRef = useRef(null);
  const countryBounds = useRef(null);
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState('');

  const zoomToCountry = () => {
    if (mapInstance.current && countryBounds.current) {
      mapInstance.current.fitBounds(countryBounds.current, 24);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    infoWindowRef.current?.close();
    zoomToCountry();
  };

  useEffect(() => {
    let cancelled = false;

    const showStations = async () => {
      try {
        const data = await fetchStations();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];

        if (!MAPS_KEY) {
          setError('Add VITE_GOOGLE_MAPS_API_KEY to smart-solar-microgrid-web/.env.local and restart the web app.');
          return;
        }

        const maps = await loadGoogleMaps(MAPS_KEY);
        if (cancelled || !mapRef.current) return;

        const validLocation = (station) => {
          const lat = Number(station.latitude);
          const lng = Number(station.longitude);
          return Number.isFinite(lat) && Number.isFinite(lng) && isInSriLanka(lat, lng);
        };
        const withLocation = list.filter(validLocation);
        const skipped = list.filter((station) => !validLocation(station));
        if (skipped.length > 0) {
          setError(`${skipped.map((station) => station.name).join(', ')} ${skipped.length === 1 ? 'is' : 'are'} outside Sri Lanka, so ${skipped.length === 1 ? 'it is' : 'they are'} not shown on the map. Use a Sri Lankan latitude and longitude.`);
        }

        const sriLanka = new maps.LatLngBounds(
          { lat: SRI_LANKA_BOUNDS.south, lng: SRI_LANKA_BOUNDS.west },
          { lat: SRI_LANKA_BOUNDS.north, lng: SRI_LANKA_BOUNDS.east }
        );

        countryBounds.current = sriLanka;
        const map = new maps.Map(mapRef.current, {
          center: { lat: 7.8731, lng: 80.7718 },
          restriction: {
            latLngBounds: SRI_LANKA_BOUNDS,
            strictBounds: false,
          },
          mapTypeControl: false,
          streetViewControl: false,
        });
        mapInstance.current = map;
        const infoWindow = new maps.InfoWindow();
        infoWindowRef.current = infoWindow;
        infoWindow.addListener('closeclick', () => {
          setShowDetails(false);
          map.fitBounds(sriLanka, 24);
        });
        const stationIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
              <path d="M24 56s18-16 18-34A18 18 0 1 0 6 22c0 18 18 34 18 34z" fill="#1A1C1E"/>
              <circle cx="24" cy="22" r="12" fill="#C6F04D"/>
              <path d="M24 14l1.6 4.6H30l-3.6 2.8 1.4 4.6L24 23.4 20.2 26l1.4-4.6L18 18.6h4.4z" fill="#1A1C1E"/>
            </svg>
          `)}`,
          scaledSize: new maps.Size(36, 44),
          anchor: new maps.Point(18, 44),
        };

        withLocation.forEach((station) => {
          const position = { lat: Number(station.latitude), lng: Number(station.longitude) };
          const marker = new maps.Marker({
            map,
            position,
            title: station.name,
            icon: stationIcon,
          });
          marker.addListener('click', () => {
            setSelected(station);
            setShowDetails(false);
            infoWindow.setContent(`
              <div style="font-family:Inter,Segoe UI,sans-serif;min-width:220px;padding:2px 2px 4px">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:40px;height:40px;border-radius:12px;background:#1A1C1E;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6F04D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <div style="flex:1">
                    <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#65a30d;font-weight:700">Grid station</div>
                    <div style="font-size:15px;font-weight:700;color:#1A1C1E;line-height:1.2">${station.name}</div>
                  </div>
                  <button id="station-view-more" type="button" title="View more" style="width:32px;height:32px;border:0;border-radius:10px;background:#1A1C1E;color:#C6F04D;cursor:pointer;font-size:16px;line-height:1">↗</button>
                </div>
                <div style="font-size:12px;color:#6b7280;margin-top:8px">${station.address}</div>
              </div>
            `);
            infoWindow.open(map, marker);
            maps.event.addListenerOnce(infoWindow, 'domready', () => {
              document.getElementById('station-view-more')?.addEventListener('click', () => {
                setSelected(station);
                setShowDetails(true);
                infoWindow.close();
              });
            });
            map.setCenter(position);
            map.setZoom(15);
          });
        });

        map.fitBounds(sriLanka, 16);
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
    <div className={`relative w-full ${heightClass}`}>
      {error && <p className="absolute top-4 left-4 z-10 text-sm font-medium text-red-600 bg-white/90 rounded-xl px-3 py-2">{error}</p>}
      <div ref={mapRef} className="absolute inset-0 rounded-3xl bg-gray-100" />
      {showDetails && selected && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1A1C1E]/35 rounded-3xl p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1A1C1E] text-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-lime-300 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-[#1A1C1E]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-lime-300">Grid station</p>
                  <h3 className="text-xl font-bold mt-1">{selected.name}</h3>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selected.address}
                  </p>
                </div>
              </div>
              <button type="button" onClick={closeDetails} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-2xl bg-white/5 p-4">
                <Zap className="w-4 h-4 text-lime-300 mb-2" />
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Capacity</p>
                <p className="text-lg font-bold mt-1">{selected.capacity} <span className="text-xs text-gray-400">kW</span></p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <Battery className="w-4 h-4 text-lime-300 mb-2" />
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Battery</p>
                <p className="text-lg font-bold mt-1">{selected.batteryCapacity} <span className="text-xs text-gray-400">kWh</span></p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <Clock className="w-4 h-4 text-lime-300 mb-2" />
                <p className="text-[11px] uppercase tracking-wider text-gray-400">Hours</p>
                <p className="text-lg font-bold mt-1">{selected.openingTime}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/stations/${selected.stationId}`)}
              className="mt-6 w-full py-3 rounded-2xl bg-lime-300 text-[#1A1C1E] font-bold"
            >
              Book slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
