import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, Sun, Calendar, ChevronDown, MoreVertical } from 'lucide-react';
import heroImg from '../assets/heroimg.jpg';
import { useAuth } from '../contexts/AuthContext';
import { fetchStations } from '../services/MicrogridService';
import { reservationAPI } from '../services/api';
import { Link } from 'react-router-dom';

const OperatorDashboard = () => {
  const { user } = useAuth();
  const [myStations, setMyStations] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCapacity: 0,
    totalBookedEnergy: 0,
    activeChargingEnergy: 0,
    bookingsByStatus: { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 },
    monthlyEnergy: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stationsData, reservationsData] = await Promise.all([
          fetchStations(),
          reservationAPI.getAllReservations().catch(() => [])
        ]);

        let filteredStations = stationsData;
        if (user) {
          filteredStations = stationsData.filter(station => {
            const opName = (station.gridOperatorName || '').toLowerCase().trim();
            const userEmail = (user.email || '').toLowerCase().trim();
            const userName = (user.name || '').toLowerCase().trim();
            const userStationId = user.stationId;

            return (
              (userEmail && opName === userEmail) ||
              (userName && opName === userName) ||
              (userStationId && (station.stationId === userStationId || station.id === userStationId)) ||
              (opName && userEmail && opName.includes(userEmail)) ||
              (opName && userName && opName.includes(userName))
            );
          });
        }
        setMyStations(filteredStations);

        const stationIds = filteredStations.map(s => s.stationId || s.id);
        const myReservations = Array.isArray(reservationsData) 
          ? reservationsData.filter(r => stationIds.includes(r.stationId))
          : [];

        let totalCapacity = 0;
        filteredStations.forEach(s => totalCapacity += (s.capacity || 0));

        let totalBookedEnergy = 0;
        let activeChargingEnergy = 0;
        const bookingsByStatus = { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };
        const monthlyEnergyMap = {};

        myReservations.forEach(r => {
          const size = r.bookingSize || 0;
          const status = r.status || 'Pending';
          if (bookingsByStatus[status] !== undefined) {
             bookingsByStatus[status]++;
          }
          if (status === 'Completed') {
            totalBookedEnergy += size;
          } else if (status === 'Approved' || status === 'Pending') {
            activeChargingEnergy += size;
          }

          if (r.bookingDate) {
            const date = new Date(r.bookingDate);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthlyEnergyMap[month]) monthlyEnergyMap[month] = 0;
            monthlyEnergyMap[month] += size;
          }
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let monthlyEnergy = months.map(m => ({ month: m, value: monthlyEnergyMap[m] || 0 })).filter(m => m.value > 0);
        if (monthlyEnergy.length === 0) {
          monthlyEnergy = [{ month: 'No Data', value: 0 }];
        }

        setMetrics({
          totalCapacity,
          totalBookedEnergy,
          activeChargingEnergy,
          bookingsByStatus,
          monthlyEnergy
        });
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);
  return (
    <div className="flex flex-col gap-6 h-full w-full pb-8">
      
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Monitoring (Span 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-[#1A1C1E] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-8 z-10">
            <h2 className="text-white font-medium text-lg">Performance Monitoring</h2>
            <div className="bg-[#2A2C2E] rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-white text-xs font-semibold">32 °C</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 z-10 flex-1">
            
            {/* Stats Left */}
            <div className="flex flex-col gap-8 w-full md:w-1/3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400"></div>
                  <span className="text-gray-400 text-xs font-medium">Total Completed Energy</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-white text-4xl md:text-5xl font-semibold tracking-tight">{metrics.totalBookedEnergy.toFixed(2)}</span>
                  <span className="text-gray-500 text-xs font-bold">KWH</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                  <span>Based on <span className="text-lime-400">{metrics.bookingsByStatus.Completed} Completed</span> Bookings</span>
                </div>
              </div>

              <div className="h-px w-full bg-[#2A2C2E]"></div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-400 text-xs font-medium">Active Pending/Approved</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-white text-4xl md:text-5xl font-semibold tracking-tight">{metrics.activeChargingEnergy.toFixed(2)}</span>
                  <span className="text-gray-500 text-xs font-bold">KWH</span>
                </div>
                <div className="text-gray-400 text-xs font-medium">
                  Total pending energy to be completed
                </div>
              </div>
            </div>

            {/* Image & Capacity Right */}
            <div className="w-full md:w-2/3 flex flex-col justify-end items-center relative">
              <div className="w-full h-48 md:h-64 absolute top-0 -mt-10 lg:-mt-16 right-0 overflow-hidden flex items-center justify-center">
                <img src={heroImg} className="h-[150%] w-[150%] object-cover opacity-70 mask-image-gradient" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }} alt="Solar Panel" />
              </div>
              
              <div className="flex justify-between w-full max-w-sm mt-auto bg-[#2A2C2E]/80 backdrop-blur-md rounded-2xl p-4 z-10 border border-[#3A3C3E]">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Battery className="w-4 h-4 text-lime-400" /> Capacity
                  </div>
                  <span className="text-white font-bold text-lg">{metrics.totalCapacity.toFixed(1)} <span className="text-gray-500 text-xs">kW</span></span>
                </div>
                <div className="w-px bg-[#3A3C3E]"></div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Zap className="w-4 h-4 text-lime-400" /> Total yield
                  </div>
                  <span className="text-white font-bold text-lg">{metrics.totalBookedEnergy.toFixed(1)} <span className="text-gray-500 text-xs">kWh</span></span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Energy Generation (Span 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 md:p-8 flex flex-col shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-charcoal-900 font-bold text-lg">Booking Statuses</h2>
            <div className="text-xs font-semibold text-charcoal-900 border border-gray-200 rounded-full px-3 py-1">All Time</div>
          </div>
          <span className="text-gray-400 text-xs font-medium mb-8">Bookings count</span>

          {/* CSS Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-2 mt-auto pt-4 relative h-48">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-dashed border-gray-100"></div>
              <div className="w-full border-t border-dashed border-gray-100"></div>
              <div className="w-full border-t border-dashed border-gray-100"></div>
              <div className="w-full border-t border-dashed border-gray-100"></div>
            </div>
            
            {Object.entries(metrics.bookingsByStatus).map(([status, count], i) => {
              const maxCount = Math.max(1, ...Object.values(metrics.bookingsByStatus));
              const height = `${(count / maxCount) * 100}%`;
              return (
              <div key={i} className="flex flex-col items-center gap-2 z-10 group cursor-pointer w-full">
                <span className="text-gray-500 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{count}</span>
                <div 
                  className="w-full max-w-[2rem] bg-lime-100 group-hover:bg-lime-200 rounded-t-sm transition-colors"
                  style={{ height }}
                ></div>
                <span className="text-gray-400 text-[10px] font-semibold mt-2">{status}</span>
              </div>
            )})}
          </div>
        </motion.div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Energy Production (Span 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 flex flex-col shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-charcoal-900 font-bold text-lg">Energy Output</h2>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-400 text-xs font-semibold">{metrics.totalBookedEnergy.toFixed(1)} kWh</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-900 border border-gray-200 rounded-full px-3 py-1 cursor-pointer">
              Monthly <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Bar chart replacement */}
          <div className="flex-1 flex items-end relative min-h-[250px] pl-8 pb-6">
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-gray-400">
              {(() => {
                const max = Math.max(10, ...metrics.monthlyEnergy.map(m => m.value));
                return [...Array(6)].map((_, i) => (
                  <span key={i}>{Math.round(max - (max / 5) * i)}</span>
                ));
              })()}
            </div>

            {/* Grid lines */}
            <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full border-t border-dashed border-gray-100 flex items-center justify-start -ml-2">
                  <div className="w-1 h-1 rounded-full bg-yellow-400 -mt-0.5"></div>
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="w-full h-full flex justify-around items-end z-10 px-2 pb-1">
              {metrics.monthlyEnergy.map((data, i) => {
                const max = Math.max(10, ...metrics.monthlyEnergy.map(m => m.value));
                const height = Math.max(5, (data.value / max) * 100);
                const isGreen = i % 2 === 0;
                return (
                  <div key={i} className="flex flex-col items-center justify-end w-8 group" style={{ height: '100%' }}>
                    <span className="text-gray-500 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{data.value.toFixed(1)}</span>
                    <div 
                      className={`w-full rounded-t-sm transition-all ${isGreen ? 'bg-lime-500 hover:bg-lime-400' : 'bg-yellow-400 hover:bg-yellow-300'}`}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                )
              })}
            </div>

            {/* X-axis labels */}
            <div className="absolute left-8 right-0 -bottom-2 flex justify-around text-[10px] font-bold text-gray-400 px-4">
              {metrics.monthlyEnergy.map((data, i) => (
                <span key={i} className="w-8 text-center">{data.month}</span>
              ))}
            </div>

          </div>
        </motion.div>

        {/* Solar Panels Points (Span 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 md:p-8 flex flex-col shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-charcoal-900 font-bold text-lg">
              Assigned Stations <span className="text-lime-500 font-medium">({myStations.length})</span>
            </h2>
            <Link to="/stations" className="text-xs font-semibold text-lime-600 hover:underline">View All</Link>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <div className="text-gray-400 text-xs py-4 text-center">Loading stations...</div>
            ) : myStations.length === 0 ? (
              <div className="text-gray-400 text-xs py-4 text-center">No assigned stations found.</div>
            ) : (
              myStations.map((station, i) => (
                <Link key={station.stationId || i} to={`/stations/${station.stationId}`} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-lime-50/50 transition-colors rounded-2xl cursor-pointer border border-transparent hover:border-lime-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <Sun className="w-5 h-5 text-lime-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-charcoal-900">{station.name}</span>
                      <span className="text-[10px] font-semibold text-gray-400">Cap: {station.capacity} kW • {station.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${station.status === 'Active' ? 'bg-lime-100 text-lime-800' : 'bg-red-100 text-red-600'}`}>
                      {station.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

        </motion.div>

      </div>

    </div>
  );
};

export default OperatorDashboard;
