import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle clicks on the map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to pan to the marker when it changes (especially on load)
function MapCenterer({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position.lat !== 0 && position.lng !== 0) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function LocationPickerMap({ latitude, longitude, onLocationSelect }) {
  // Default to Sri Lanka center if no coordinates provided
  const defaultCenter = [7.8731, 80.7718];
  
  const hasValidPosition = latitude && longitude;
  const position = hasValidPosition ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null;
  const center = hasValidPosition ? [parseFloat(latitude), parseFloat(longitude)] : defaultCenter;

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
      <MapContainer 
        center={center} 
        zoom={7} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <Marker position={position} />
        )}
        <MapClickHandler onLocationSelect={onLocationSelect} />
        <MapCenterer position={position} />
      </MapContainer>
      
      {/* Helper text overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100 text-xs font-bold text-charcoal-900 pointer-events-none z-[1000] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></div>
        Click on the map to pin station location
      </div>
    </div>
  );
}
