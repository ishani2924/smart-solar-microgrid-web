import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const reasons = [
  { title: 'Organized', desc: 'Manage stations, slots, reservations, and users through one connected system.' },
  { title: 'Convenient', desc: 'Allow Solar Prosumers to access station and booking information through a mobile application.' },
  { title: 'Secure', desc: 'Use role-based access and QR verification for reservation-related activities.' },
  { title: 'Centralized', desc: 'Keep web and mobile applications connected through a common web service.' },
  { title: 'Transparent', desc: 'Allow users to view reservation status and booking history.' }
];

const WhySolarGridSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 md:px-12 flex flex-col items-center">
        
        <div className="pill-badge mb-6">
          <span className="dot"></span>
          WHY US
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-5xl font-medium tracking-tight text-charcoal-900 mb-16 text-center"
        >
          Why SolarGrid?
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-4 max-w-5xl">
          {reasons.map((reason, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-charcoal-50 rounded-full px-6 py-4 flex items-center gap-4 border border-transparent hover:border-lime-300 hover:bg-white hover:shadow-md transition-all cursor-default group"
            >
              <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-charcoal-900" strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-charcoal-900 group-hover:text-lime-600 transition-colors">{reason.title}</span>
                <span className="text-xs text-charcoal-500 hidden md:block max-w-xs">{reason.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhySolarGridSection;
