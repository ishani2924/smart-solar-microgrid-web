import { motion } from 'framer-motion';
import { Sun, Battery, Zap, ChevronRight } from 'lucide-react';

const flowSteps = [
  { id: 1, name: 'Solar Panel', icon: Sun, accent: '#FBBF24', delay: 0 },
  { id: 2, name: 'Energy Flow', icon: Zap, accent: '#F59E0B', delay: 0.5 },
  { id: 3, name: 'Microgrid Station', icon: Zap, accent: '#EAB308', delay: 1 },
  { id: 4, name: 'Battery Storage', icon: Battery, accent: '#CA8A04', delay: 1.5 },
];

const EnergyFlow = () => {
  return (
    <section
      className="py-24 relative border-t border-b border-yellow-400/10 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #141B18 0%, #1C2523 100%)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-yellow-400/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge-solar text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4">
            Energy Flow
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Energy Flow <span className="text-yellow-400">Visualization</span>
          </h2>
          <p className="text-white/50 text-lg">
            Track the seamless transfer of renewable energy from generation to storage.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col md:flex-row items-center gap-4 md:gap-6">

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4 relative"
                  style={{
                    background: `linear-gradient(135deg, ${step.accent}18 0%, rgba(31,42,38,0.8) 100%)`,
                    border: `1px solid ${step.accent}30`,
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <step.icon className="w-10 h-10 relative z-10" style={{ color: step.accent }} />
                  {/* Pulse */}
                  <div
                    className="absolute inset-0 rounded-2xl border-2 animate-ping opacity-15"
                    style={{ borderColor: step.accent, animationDuration: '2.5s', animationDelay: `${step.delay}s` }}
                  />
                </div>
                <h4 className="text-white font-semibold text-sm text-center">{step.name}</h4>
              </motion.div>

              {/* Arrow Connector */}
              {index < flowSteps.length - 1 && (
                <>
                  <div className="hidden md:flex items-center justify-center relative w-16">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                      className="h-px w-full origin-left"
                      style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.3), rgba(245,158,11,0.7))' }}
                    >
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-80"
                      />
                    </motion.div>
                    <ChevronRight className="w-5 h-5 text-yellow-400 absolute -right-2" />
                  </div>
                  <div className="md:hidden flex justify-center py-1">
                    <ChevronRight className="w-5 h-5 text-yellow-400 rotate-90" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnergyFlow;
