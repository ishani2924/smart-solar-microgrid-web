import { motion } from 'framer-motion';
import { Battery, CalendarRange, MonitorSmartphone } from 'lucide-react';

const PlatformSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 flex flex-col gap-24">
        
        {/* Block 1: Microgrid Station Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex flex-col items-start"
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-charcoal-900 mb-8 border border-gray-100">
              <Battery className="w-8 h-8 text-lime-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-charcoal-900 mb-6 tracking-tight">
              Manage Solar Energy Infrastructure Efficiently
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
              Each microgrid station contains important operational information that helps users identify suitable stations and available energy-transfer opportunities.
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
              {['Station name', 'Location', 'GPS coordinates', 'Energy capacity', 'Battery-storage capacity', 'Available storage slots', 'Operating schedule', 'Current station status'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400"></div>
                  <span className="text-xs font-semibold text-charcoal-600">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 h-[400px] bg-white rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50 to-charcoal-100 p-8 flex flex-col justify-between">
              <div className="w-full h-12 bg-white rounded-xl shadow-sm mb-4"></div>
              <div className="flex gap-4 mb-4">
                <div className="w-1/3 h-24 bg-white rounded-xl shadow-sm"></div>
                <div className="w-2/3 h-24 bg-white rounded-xl shadow-sm"></div>
              </div>
              <div className="w-full h-32 bg-lime-100/50 border border-lime-200 rounded-xl shadow-sm mt-auto relative overflow-hidden">
                <div className="absolute left-0 bottom-0 top-0 w-2/3 bg-lime-400"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Block 2: Energy Slot Section */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex flex-col items-start"
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-charcoal-900 mb-8 border border-gray-100">
              <CalendarRange className="w-8 h-8 text-lime-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-charcoal-900 mb-6 tracking-tight">
              Simple Energy Slot Management
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
              Microgrid stations can provide multiple energy-transfer slots throughout the day. This provides an organized method for handling energy-transfer activities.
            </p>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-full">
              <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-4">Users Can View</h4>
              <ul className="flex flex-col gap-3">
                {['Available dates', 'Start and end times', 'Slot availability', 'Station information', 'Reservation status'].map((item, i) => (
                  <li key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-semibold text-charcoal-600">{item}</span>
                    <span className="text-xs text-lime-600 bg-lime-50 px-2 py-1 rounded-full font-bold">Enabled</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 h-[400px] bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center p-8"
          >
            <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col p-4 gap-4 relative">
              <div className="w-full h-1/4 bg-gray-50 rounded-xl"></div>
              <div className="w-full h-1/4 bg-gray-50 rounded-xl"></div>
              <div className="w-full h-1/4 bg-lime-400 rounded-xl shadow-sm border border-lime-500 flex items-center px-4">
                <span className="text-charcoal-900 font-bold">Reserved Slot</span>
              </div>
              <div className="w-full h-1/4 bg-gray-50 rounded-xl"></div>
            </div>
          </motion.div>
        </div>

        {/* Block 3: Connected System Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex flex-col items-start"
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-charcoal-900 mb-8 border border-gray-100">
              <MonitorSmartphone className="w-8 h-8 text-lime-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-charcoal-900 mb-6 tracking-tight">
              One Platform. Multiple Applications.
            </h2>
            <div className="flex flex-col gap-6 mt-4 w-full">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-charcoal-900 mb-2">Web Application</h4>
                <p className="text-xs text-charcoal-500 leading-relaxed">Used by Backoffice staff and Grid Operators to manage users, stations, slots, and reservations.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
                <h4 className="font-bold text-charcoal-900 mb-2">Mobile Application</h4>
                <p className="text-xs text-charcoal-500 leading-relaxed">Used by Solar Prosumers and Grid Operators for station access, reservations, QR verification, and operational activities.</p>
              </div>
              <div className="bg-charcoal-900 p-6 rounded-2xl shadow-sm border border-charcoal-800">
                <h4 className="font-bold text-white mb-2">Central Web Service</h4>
                <p className="text-xs text-charcoal-400 leading-relaxed">Connects the applications and manages the system's main business logic and data.</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 h-[400px] flex justify-center items-center relative"
          >
            {/* Visual representation of connected systems */}
            <div className="w-48 h-48 rounded-full bg-lime-400 absolute z-10 flex items-center justify-center shadow-xl border-4 border-white">
              <span className="font-display font-bold text-xl text-charcoal-900 text-center">Central<br/>Web Service</span>
            </div>
            <div className="w-32 h-32 rounded-full bg-white shadow-xl border border-gray-100 absolute -top-4 -left-4 z-20 flex items-center justify-center text-charcoal-900 font-bold">
              Web App
            </div>
            <div className="w-32 h-32 rounded-full bg-charcoal-900 shadow-xl border border-charcoal-800 absolute -bottom-4 -right-4 z-20 flex items-center justify-center text-white font-bold">
              Mobile App
            </div>
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
              <path d="M150 150 L250 250" stroke="#C5F849" strokeWidth="4" strokeDasharray="8 8" />
            </svg>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default PlatformSection;
