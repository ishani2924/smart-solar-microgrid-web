import { motion } from 'framer-motion';
import { Search, CalendarClock, QrCode, Zap } from 'lucide-react';

const steps = [
  {
    id: 1,
    name: 'Find a Microgrid',
    description: 'Solar prosumer discovers an available nearby station using the interactive map.',
    icon: Search,
  },
  {
    id: 2,
    name: 'Reserve an Energy Slot',
    description: 'Select an available date and time that fits your energy transfer schedule.',
    icon: CalendarClock,
  },
  {
    id: 3,
    name: 'Receive QR Confirmation',
    description: 'Approved reservation generates a secure QR transaction reference instantly.',
    icon: QrCode,
  },
  {
    id: 4,
    name: 'Complete Energy Transfer',
    description: 'Grid operator scans the QR code, verifies the reservation and completes the transaction.',
    icon: Zap,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg">
            A seamless four-step process connecting prosumers with microgrid stations.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-500/20 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-teal-500/30">
                  <step.icon className="w-10 h-10 text-teal-400" />
                </div>
                <div className="bg-navy-900/80 p-1 rounded-full px-4 text-xs font-bold text-teal-400 mb-4 border border-teal-500/20">
                  STEP {step.id}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[250px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
