import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, Sun, Calendar, ChevronDown, MoreVertical } from 'lucide-react';
import heroImg from '../assets/heroimg.jpg';
import { useAuth } from '../contexts/AuthContext';
import { fetchStations } from '../services/MicrogridService';
import { Link } from 'react-router-dom';

const OperatorDashboard = () => {
  const { user } = useAuth();
  const [myStations, setMyStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyStations = async () => {
      try {
        const data = await fetchStations();
        if (user) {
          const filtered = data.filter(station => {
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
          setMyStations(filtered);
        } else {
          setMyStations(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMyStations();
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
                  <span className="text-gray-400 text-xs font-medium">Total Charging</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-white text-4xl md:text-5xl font-semibold tracking-tight">80.88</span>
                  <span className="text-gray-500 text-xs font-bold">KWH</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                  <span>Min <span className="text-red-400">3.0 ▼</span></span>
                  <span>Max <span className="text-lime-400">10.0 ▲</span></span>
                </div>
              </div>

              <div className="h-px w-full bg-[#2A2C2E]"></div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-400 text-xs font-medium">Power Usage</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-white text-4xl md:text-5xl font-semibold tracking-tight">17.05</span>
                  <span className="text-gray-500 text-xs font-bold">KWH</span>
                </div>
                <div className="text-gray-400 text-xs font-medium">
                  1 hour usage <span className="text-white">6.8</span> kWh
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
                  <span className="text-white font-bold text-lg">220.0 <span className="text-gray-500 text-xs">kWh</span></span>
                </div>
                <div className="w-px bg-[#3A3C3E]"></div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <Zap className="w-4 h-4 text-lime-400" /> Total yield
                  </div>
                  <span className="text-white font-bold text-lg">175.0 <span className="text-gray-500 text-xs">kWh</span></span>
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
            <h2 className="text-charcoal-900 font-bold text-lg">Energy Generation</h2>
            <div className="text-xs font-semibold text-charcoal-900 border border-gray-200 rounded-full px-3 py-1">Today</div>
          </div>
          <span className="text-gray-400 text-xs font-medium mb-8">kWh</span>

          {/* CSS Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-2 mt-auto pt-4 relative h-48">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-dashed border-gray-100"></div>
              <div className="w-full border-t border-dashed border-gray-100"></div>
              <div className="w-full border-t border-dashed border-gray-100"></div>
              <div className="w-full border-t border-dashed border-gray-100"></div>
            </div>
            
            {[
              { time: '9 AM', val: 10, h: '40%' },
              { time: '10 AM', val: 14, h: '60%' },
              { time: '11 AM', val: 18, h: '80%' },
              { time: '12 AM', val: 20, h: '90%' },
              { time: '01 PM', val: 16, h: '70%' },
              { time: '02 PM', val: 18, h: '80%' }
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10 group cursor-pointer w-full">
                <span className="text-gray-500 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{bar.val}</span>
                <div 
                  className="w-full max-w-[2rem] bg-lime-100 group-hover:bg-lime-200 rounded-t-sm transition-colors"
                  style={{ height: bar.h }}
                ></div>
                <span className="text-gray-400 text-[10px] font-semibold mt-2">{bar.time}</span>
              </div>
            ))}
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
              <h2 className="text-charcoal-900 font-bold text-lg">Energy Production</h2>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-400 text-xs font-semibold">100 kWh</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-900 border border-gray-200 rounded-full px-3 py-1 cursor-pointer">
              Monthly <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Candlestick-style chart mock */}
          <div className="flex-1 flex items-end relative min-h-[250px] pl-8 pb-6">
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-gray-400">
              <span>200</span>
              <span>160</span>
              <span>120</span>
              <span>80</span>
              <span>40</span>
              <span>0</span>
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
            <div className="w-full h-full flex justify-between items-end z-10 px-2 pb-1">
              {/* Generating a bunch of random looking candlestick bars that match the color scheme */}
              {[...Array(24)].map((_, i) => {
                const height = 20 + Math.sin(i / 3) * 30 + Math.cos(i) * 20 + 30;
                const offset = Math.abs(Math.cos(i * 2)) * 20;
                const isGreen = i % 2 === 0;
                return (
                  <div key={i} className="flex flex-col justify-end w-2 md:w-3" style={{ height: '100%' }}>
                    <div 
                      className={`w-full rounded-full ${isGreen ? 'bg-lime-500' : 'bg-yellow-400'}`}
                      style={{ height: `${height}%`, marginBottom: `${offset}%` }}
                    ></div>
                  </div>
                )
              })}
            </div>

            {/* X-axis labels */}
            <div className="absolute left-8 right-0 -bottom-2 flex justify-between text-[10px] font-bold text-gray-400 px-4">
              <span>March</span>
              <span>April</span>
              <span>May</span>
              <span>June</span>
              <span>July</span>
              <span>August</span>
              <span>August</span>
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
