import { motion } from 'framer-motion';
import { Settings, Clock, CheckCircle2, MapPin, History, Shield, Activity, Laptop } from 'lucide-react';

const features = [
  { name: 'Microgrid Station Management', icon: Settings, description: 'Register, update, and manage the operational status of all microgrid stations.' },
  { name: 'Energy Slot Management', icon: Clock, description: 'Configure available time slots for energy transfers based on grid capacity.' },
  { name: 'Smart Reservations', icon: CheckCircle2, description: 'Streamlined booking system for prosumers to reserve energy slots in advance.' },
  { name: 'QR Verification', icon: Shield, description: 'Secure, unique QR codes generated for every transaction to ensure validity.' },
  { name: 'Google Maps Integration', icon: MapPin, description: 'Interactive mapping for prosumers to easily locate nearby microgrid stations.' },
  { name: 'Booking History', icon: History, description: 'Comprehensive logs of all past reservations and completed energy transfers.' },
  { name: 'Role-Based Access', icon: Laptop, description: 'Distinct portals and permissions for Backoffice, Grid Operators, and Prosumers.' },
  { name: 'Energy Transfer Tracking', icon: Activity, description: 'Real-time monitoring of energy flow during active transactions.' },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative bg-navy-800/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Features</h2>
          <p className="text-slate-400 text-lg">
            A comprehensive suite of tools designed to optimize energy trading and microgrid management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl group hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors border border-teal-500/20">
                <feature.icon className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
