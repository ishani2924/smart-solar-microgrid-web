import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full bg-lime-400 rounded-[3rem] p-12 md:p-20 flex flex-col items-center text-center shadow-xl border border-lime-500 relative overflow-hidden"
        >
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-charcoal-900 mb-8 tracking-tighter leading-[1.1] max-w-4xl relative z-10">
            Powering Smarter Solar Energy Management
          </h2>
          
          <p className="text-charcoal-900/70 text-sm md:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mb-12 relative z-10">
            Manage microgrid stations, energy slots, reservations, and energy-transfer activities through one connected platform.
          </p>
          
          <Link to="/register" className="relative z-10 btn-primary !bg-charcoal-900 !text-white hover:!bg-charcoal-800 hover:scale-105 transition-all !px-6 !py-4 !gap-4 shadow-xl">
            <span className="text-base font-bold">Join the Platform</span>
            <span className="w-8 h-8 rounded-full bg-lime-400 text-charcoal-900 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </span>
          </Link>

        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
