import { motion } from 'framer-motion';
import { 
  Building2, Zap, CalendarCheck, QrCode, 
  BookOpen, Users, Smartphone, Server 
} from 'lucide-react';

const features = [
  { icon: Building2, title: 'Microgrid Station Management', desc: 'Create and manage solar microgrid stations with location, capacity, battery-storage information, and operational schedules.' },
  { icon: Zap, title: 'Energy Slot Management', desc: 'Create, update, and manage available energy-transfer slots for each microgrid station.' },
  { icon: CalendarCheck, title: 'Smart Reservations', desc: 'Allow Solar Prosumers to create, modify, and cancel energy-slot reservations.' },
  { icon: QrCode, title: 'QR Verification', desc: 'Generate secure QR information for approved reservations and verify it at the microgrid station.' },
  { icon: BookOpen, title: 'Booking Management', desc: 'View current bookings, pending reservations, booking history, and reservation status.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Provide different system functionality for Backoffice users, Grid Operators, and Solar Prosumers.' },
  { icon: Smartphone, title: 'Mobile Access', desc: 'Allow Solar Prosumers and Grid Operators to access relevant system functions using the Android mobile application.' },
  { icon: Server, title: 'Centralized Management', desc: 'Web and mobile applications communicate with a centralized web service to keep system information consistent.' }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-10 md:py-16 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="w-full bg-charcoal-900 rounded-[2.5rem] p-8 md:p-12 lg:p-16 flex flex-col relative overflow-hidden shadow-xl">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div className="flex flex-col gap-6">
              <div className="pill-badge !bg-charcoal-800 !border-charcoal-700 !text-white w-fit">
                <span className="dot"></span>
                MAIN FEATURES
              </div>
              <h2 className="font-display text-3xl md:text-5xl lg:text-5xl text-white font-medium leading-[1.1] tracking-tight max-w-xl">
                Everything you need to run a modern solar grid.
              </h2>
            </div>
            <div className="text-charcoal-400 text-sm max-w-sm leading-relaxed">
              Powerful tools designed to connect prosumers, operators, and administrators into one seamless ecosystem.
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-charcoal-800 rounded-2xl p-6 border border-charcoal-700 flex flex-col gap-4 hover:bg-charcoal-800/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-charcoal-700 flex items-center justify-center text-lime-400">
                  <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                  <p className="text-charcoal-400 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
