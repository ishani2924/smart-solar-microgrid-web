import { motion } from 'framer-motion';
import { Sun, Battery, Zap, ChevronRight } from 'lucide-react';

const flowSteps = [
  { id: 1, name: 'Solar Panel', icon: Sun, color: 'text-amber-400' },
  { id: 2, name: 'Energy', icon: Zap, color: 'text-teal-400' },
  { id: 3, name: 'Microgrid Station', icon: Zap, color: 'text-blue-400' },
  { id: 4, name: 'Battery Storage', icon: Battery, color: 'text-green-400' },
];

const EnergyFlow = () => {
  return (
    <section className="py-24 relative bg-navy-900 border-t border-b border-teal-500/10 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Energy Flow Visualization</h2>
          <p className="text-slate-400 text-lg">
            Track the seamless transfer of renewable energy from generation to storage.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-2xl glass-card flex items-center justify-center mb-4 relative group">
                  <div className={`absolute inset-0 bg-current opacity-10 rounded-2xl ${step.color}`} />
                  <step.icon className={`w-10 h-10 ${step.color} relative z-10`} />
                  
                  {/* Ping effect for active state */}
                  <div className={`absolute inset-0 rounded-2xl border-2 border-current opacity-20 animate-ping ${step.color}`} style={{ animationDuration: '3s', animationDelay: `${index * 0.5}s` }} />
                </div>
                <h4 className="text-white font-semibold text-center">{step.name}</h4>
              </motion.div>

              {/* Arrow Connector */}
              {index < flowSteps.length - 1 && (
                <div className="hidden md:flex flex-col items-center justify-center px-4 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100px' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                    className="h-0.5 bg-gradient-to-r from-teal-500/20 to-teal-400 relative overflow-hidden"
                  >
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                    />
                  </motion.div>
                  <ChevronRight className="w-6 h-6 text-teal-400 absolute right-0 translate-x-1/2 bg-navy-900" />
                </div>
              )}
              
              {/* Mobile Arrow */}
              {index < flowSteps.length - 1 && (
                <div className="md:hidden flex justify-center py-2">
                  <ChevronRight className="w-6 h-6 text-teal-400 rotate-90" />
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnergyFlow;
