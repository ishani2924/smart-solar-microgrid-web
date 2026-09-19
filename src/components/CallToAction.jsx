import { motion } from 'framer-motion';

const CallToAction = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-900/20 z-0" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto border border-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.1)]"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Powering smarter solar <br className="hidden md:block" />
            <span className="text-gradient">energy management</span>
          </h2>
          
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage stations, reservations and energy transfers through one connected enterprise platform.
          </p>

          <button className="bg-teal-500 hover:bg-teal-400 text-navy-900 px-10 py-5 rounded-xl font-bold transition-all hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] text-lg inline-flex items-center gap-3">
            Login to Dashboard
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
