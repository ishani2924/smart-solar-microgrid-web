import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker, OverlayView, Circle } from '@react-google-maps/api';
import { Search, Navigation2, Zap, Clock, Battery, MapPin, Crosshair, CalendarCheck, X, Loader2 } from 'lucide-react';
import { fetchStations, fetchSlots } from '../services/MicrogridService';
import { reservationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/solar1.png';

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  inset: 0
};

// Default center (Colombo, Sri Lanka)
const defaultCenter = { lat: 6.9271, lng: 79.8612 };

const ProsumerStations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Booking Modal State
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStation, setBookingStation] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [allAvailableSlots, setAllAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [energyAmount, setEnergyAmount] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDklY0JyrNjpdq8ZxVrO6_HV5_fyJ5wapY",
    libraries: ["geometry", "places"]
  });

  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await fetchStations();
        const data = Array.isArray(response) ? response : (response.data || []);

        const formattedData = data.filter(s => s.latitude !== 0 && s.longitude !== 0).map(s => ({
          ...s,
          latitude: s.latitude,
          longitude: s.longitude
        }));

        setStations(formattedData);
      } catch (err) {
        console.error('Error fetching stations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          setLocationError("Could not fetch location.");
        }
      );
    }
  }, []);

  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const stationsWithDistance = stations.map(station => ({
    ...station,
    distanceKm: userLocation
      ? getDistanceInKm(userLocation.lat, userLocation.lng, station.latitude, station.longitude)
      : null
  }));

  const filteredStations = stationsWithDistance
    .filter(station => {
      return (station.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (station.address || '').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (userLocation && a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

  // If user location is known, center map on user, else center on first station, else default
  const mapCenter = userLocation
    ? userLocation
    : (filteredStations.length > 0 ? { lat: filteredStations[0].latitude, lng: filteredStations[0].longitude } : defaultCenter);

  const onLoad = useCallback(function callback(map) {
    setMapRef(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMapRef(null);
  }, []);

  // Recenter map when a station is clicked
  const handleStationClick = (station) => {
    setSelectedStation(station);
    if (mapRef) {
      mapRef.panTo({ lat: station.latitude, lng: station.longitude });
      mapRef.setZoom(15);
    }
  };

  const handleBookClick = (station) => {
    setBookingStation(station);
    setShowBookingModal(true);
    setBookingError('');
    setBookingSuccess('');
    setSelectedSlot('');
    setEnergyAmount('');
    setBookingNotes('');
    setBookingDate('');
    loadSlotsForStation(station.stationId || station.id);
  };

  const loadSlotsForStation = async (stationId) => {
    setSlotsLoading(true);
    try {
      const response = await fetchSlots(stationId, '', 'available'); // fetch all available slots
      const slots = response.data || response || [];

      const uniqueDates = [...new Set(slots.map(s => new Date(s.date).toLocaleDateString('en-CA')))].sort();

      setAllAvailableSlots(slots);
      setAvailableDates(uniqueDates);

      if (uniqueDates.length > 0) {
        setBookingDate(uniqueDates[0]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setBookingError('Failed to load available slots.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !energyAmount) {
      setBookingError('Please select a slot and enter energy amount.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const payload = {
        prosumerNic: user?.nic || user?.id, // Ensure we have the Prosumer NIC
        stationId: bookingStation.stationId || bookingStation.id,
        slotId: selectedSlot,
        reservationDate: bookingDate,
        energyAmountKwh: parseFloat(energyAmount),
        notes: bookingNotes
      };

      const response = await reservationAPI.createReservation(payload);
      if (response.success) {
        setBookingSuccess('Reservation created successfully!');
        setTimeout(() => {
          setShowBookingModal(false);
          navigate('/prosumer/bookings'); // redirect to bookings
        }, 1500);
      } else {
        setBookingError(response.message || 'Failed to create reservation.');
      }
    } catch (err) {
      console.error('Error booking:', err);
      setBookingError(err.response?.data?.message || err.message || 'An error occurred while booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full pb-4 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight">Nearby Stations</h1>
          <p className="text-sm font-medium text-gray-500">Find and navigate to solar charging stations</p>
        </div>
      </div>

      <div className="flex-1 w-full rounded-3xl overflow-hidden relative shadow-sm border border-gray-100 min-h-[600px]">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: true,
                zoomControl: false, // Hide zoom control to make it completely clean
                mapTypeControl: false,
                streetViewControl: false,
              }}
            >
              {userLocation && (
                <>
                  {/* Circle indicating 5km radius */}
                  <Circle
                    center={userLocation}
                    radius={5000}
                    options={{
                      fillColor: '#84cc16',
                      fillOpacity: 0.1,
                      strokeColor: '#84cc16',
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      clickable: false,
                      editable: false,
                      zIndex: 1
                    }}
                  />

                  {/* User Location Marker */}
                  <Marker
                    position={userLocation}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: '#3b82f6',
                      fillOpacity: 1,
                      strokeColor: 'white',
                      strokeWeight: 2,
                      scale: 8,
                    }}
                    title="Your Location"
                  />
                </>
              )}

              {filteredStations.map(station => (
                <Marker
                  key={station.stationId || station.id}
                  position={{ lat: station.latitude, lng: station.longitude }}
                  onClick={() => handleStationClick(station)}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    fillColor: selectedStation && selectedStation.stationId === station.stationId ? '#1c1917' : '#84cc16', // charcoal if selected, else lime
                    fillOpacity: 1,
                    strokeColor: selectedStation && selectedStation.stationId === station.stationId ? '#a3e635' : '#1c1917',
                    strokeWeight: 2,
                    scale: selectedStation && selectedStation.stationId === station.stationId ? 1.8 : 1.5,
                    anchor: new window.google.maps.Point(12, 22)
                  }}
                >
                  {selectedStation && (selectedStation.stationId === station.stationId) && (
                    <OverlayView
                      position={{ lat: station.latitude, lng: station.longitude }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <div className="absolute -translate-x-1/2 -translate-y-[calc(100%+45px)] w-[240px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                        {/* Custom Close Button */}
                        <button
                          onClick={() => setSelectedStation(null)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-charcoal-900 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div>
                          <h4 className="font-bold text-sm text-charcoal-900 mb-1 pr-6">{station.name}</h4>
                          <p className="text-xs text-gray-500 mb-3">{station.address}</p>

                          <div className="flex gap-2 text-xs font-medium bg-gray-50 p-2 rounded-lg mb-3">
                            <div className="flex flex-col">
                              <span className="text-gray-400 text-[10px] uppercase">Capacity</span>
                              <span className="text-charcoal-900 font-bold">{station.capacity} kW</span>
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="flex flex-col">
                              <span className="text-gray-400 text-[10px] uppercase">Storage</span>
                              <span className="text-charcoal-900 font-bold">{station.availableStorage}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button className="flex-1 bg-charcoal-900 text-white font-bold text-[11px] py-2.5 rounded-lg flex items-center justify-center gap-1 hover:bg-charcoal-800 transition-colors">
                              <Navigation2 className="w-3 h-3" /> Nav
                            </button>
                            <button
                              onClick={() => handleBookClick(station)}
                              className="flex-1 bg-lime-400 text-charcoal-900 font-bold text-[11px] py-2.5 rounded-lg flex items-center justify-center gap-1 hover:bg-lime-500 transition-colors"
                            >
                              <CalendarCheck className="w-3 h-3" /> Book
                            </button>
                          </div>
                        </div>

                        {/* Tail Pointer */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45 shadow-sm"></div>
                      </div>
                    </OverlayView>
                  )}
                </Marker>
              ))}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-medium text-sm">
              Loading Google Maps...
            </div>
          )}
        </div>

        {/* Floating Station List (Grid Overlay) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bottom-4 w-full max-w-[360px] flex flex-col gap-4 z-10 pointer-events-none"
        >
          {/* Search Box */}
          <div className="relative w-full shrink-0 pointer-events-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/95 backdrop-blur-md border border-gray-100/50 rounded-2xl shadow-lg py-4 pl-12 pr-4 text-sm font-medium text-charcoal-900 placeholder:text-gray-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all"
            />
          </div>

          {/* List/Grid of Cards */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 pb-4 pointer-events-auto mask-image-gradient-bottom" style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
            {loading ? (
              <div className="text-center py-10 bg-white/90 backdrop-blur-md rounded-2xl text-sm font-medium text-gray-400 shadow-md">Loading stations...</div>
            ) : filteredStations.length === 0 ? (
              <div className="text-center py-10 bg-white/90 backdrop-blur-md rounded-2xl text-sm font-medium text-gray-400 shadow-md">No stations found.</div>
            ) : (
              filteredStations.map(station => (
                <div
                  key={station.stationId || station.id}
                  onClick={() => handleStationClick(station)}
                  className={`rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-3 shadow-md backdrop-blur-md ${selectedStation && (selectedStation.stationId === station.stationId)
                      ? 'border-2 border-lime-400 bg-lime-50/95 transform scale-[1.02]'
                      : 'border-2 border-transparent hover:border-lime-200 hover:shadow-lg bg-white/95'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedStation && selectedStation.stationId === station.stationId ? 'bg-lime-200' : 'bg-lime-100'}`}>
                        <MapPin className="w-5 h-5 text-lime-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-charcoal-900">{station.name}</h3>
                        <p className="text-[10px] font-semibold text-gray-500 truncate max-w-[150px]">{station.address}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider shrink-0 ${station.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {station.status || 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-semibold text-gray-600">{station.capacity} kW</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-lime-500" />
                      <span className="text-xs font-semibold text-gray-600">{station.batteryCapacity} kWh</span>
                    </div>
                    {userLocation && station.distanceKm !== null && (
                      <div className="flex items-center gap-2 col-span-2 mt-1">
                        <Crosshair className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-blue-600">{station.distanceKm.toFixed(1)} km away</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>

      {/* Booking Modal */}
      {showBookingModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/60 backdrop-blur-sm mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            {/* Blurry Background Image for the Form */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImage})` }}
            >
              {/* Overlay to ensure text readability - reduced blur/opacity so image is much more visible */}
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="relative z-10 p-6 overflow-y-auto custom-scrollbar flex-1">
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:bg-white/50 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-charcoal-900 mb-1">Book Energy Transfer</h2>
              <p className="text-sm font-medium text-gray-600 mb-4">{bookingStation?.name}</p>

              <div className="bg-red-50/90 backdrop-blur-sm text-red-600 text-[11px] p-3 rounded-xl mb-4 border border-red-200 font-bold flex gap-2 items-start">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <p>Please note: A 12-hour rule applies to all bookings. You cannot modify or cancel your booking if there are less than 12 hours remaining before the reserved time slot.</p>
              </div>

              {bookingError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100 font-medium">
                  {bookingError}
                </div>
              )}

              {bookingSuccess && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl mb-4 border border-green-100 font-medium text-center">
                  {bookingSuccess}
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Date</label>
                  {slotsLoading ? (
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading dates...
                    </div>
                  ) : availableDates.length === 0 ? (
                    <div className="w-full bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                      No available dates.
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                      {availableDates.map(date => {
                        const dateObj = new Date(date + 'T00:00:00');
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = dateObj.getDate();
                        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                        const isSelected = bookingDate === date;

                        return (
                          <div
                            key={date}
                            onClick={() => { setBookingDate(date); setSelectedSlot(''); }}
                            className={`flex flex-col items-center justify-center min-w-[70px] py-2 rounded-xl cursor-pointer transition-all border-2 shrink-0 ${isSelected ? 'border-lime-400 bg-lime-50' : 'border-gray-100 bg-white hover:border-lime-200'}`}
                          >
                            <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-lime-700' : 'text-gray-400'}`}>{dayName}</span>
                            <span className={`text-xl font-black ${isSelected ? 'text-charcoal-900' : 'text-gray-700'}`}>{dayNum}</span>
                            <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-lime-700' : 'text-gray-400'}`}>{month}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Available Slots</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all appearance-none"
                    required
                    disabled={slotsLoading || availableDates.length === 0}
                  >
                    <option value="">Select a time slot</option>
                    {allAvailableSlots.filter(s => new Date(s.date).toLocaleDateString('en-CA') === bookingDate).map(slot => (
                      <option key={slot.slotId || slot.id} value={slot.slotId || slot.id}>
                        {slot.startTime} - {slot.endTime} (Max: {slot.availableCapacity} kW)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Energy Amount (kWh)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={energyAmount}
                      onChange={(e) => setEnergyAmount(e.target.value)}
                      placeholder="e.g. 10.5"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">kWh</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Optional Notes</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any special instructions?"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all resize-none h-20 custom-scrollbar"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || availableDates.length === 0 || !selectedSlot}
                  className="w-full mt-2 bg-charcoal-900 text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-charcoal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><CalendarCheck className="w-4 h-4" /> Confirm Booking</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProsumerStations;
