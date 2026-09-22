import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Solar3DScene from './Solar3DScene';

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-screen flex items-center">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-teal-400/30 w-max mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-sm font-medium text-teal-300">Next-Gen Enterprise Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white">
              Smart Energy.<br />
              <span className="text-gradient">Smarter Microgrids.</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-4">
              A smart platform that connects solar prosumers, grid operators and microgrid stations to simplify energy-slot reservations and secure energy transfers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-navy-900 px-8 py-4 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(45,212,191,0.5)] group text-lg">
                Get Started / Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="flex items-center justify-center gap-2 glass-panel hover:bg-white/5 text-white border border-white/10 px-8 py-4 rounded-xl font-semibold transition-all hover:border-teal-500/50 text-lg">
                <Play className="w-5 h-5 text-teal-400" />
                Learn How It Works
              </button>
            </div>

            {/* Quick Stats snippet under hero */}
            <div className="flex gap-8 mt-8 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-white">99.9%</p>
                <p className="text-sm text-slate-400">Uptime</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">256-bit</p>
                <p className="text-sm text-slate-400">Encryption</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-sm text-slate-400">Grid Access</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="h-[500px] lg:h-[700px] w-full relative"
          >
            <div className="absolute inset-0 glass-panel rounded-3xl border border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent z-0 pointer-events-none"></div>
              {/* 3D Canvas */}
              <Solar3DScene />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
