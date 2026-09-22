import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[95vh] min-h-[700px] p-4 md:p-6 pb-0 flex flex-col">
      {/* Container holding the background, making it rounded */}
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col justify-end"
        style={{
          backgroundImage: `url('/creaenergy-hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark gradient overlay at the bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Huge centered text (placed absolutely so it stays centered) */}
        <div className="absolute top-[25%] inset-x-0 flex justify-center items-center pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="font-display font-medium text-white tracking-tighter"
            style={{ fontSize: 'clamp(5rem, 16vw, 15rem)', lineHeight: 0.85, textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          >
            Solar <span className="text-white/90">Power</span>
          </motion.h1>
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-10 w-full px-6 md:px-12 pb-8 md:pb-12 flex flex-col md:flex-row justify-between items-end gap-8">

          {/* Left Side: Headline & Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col gap-6 max-w-xl"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-lime-400"></div>
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-widest">Renew. Power. Thrive.</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-medium">
              Clean Energy,<br />
              Infinite <span className="text-white/60">Possibilities</span>
            </h2>

            <Link to="/register" className="btn-primary w-fit mt-2" style={{ padding: '0.6rem 0.6rem 0.6rem 1.25rem' }}>
              <span className="text-sm">Get Started</span>
              <span className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>

          {/* Right Side: Stats & Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-end gap-6 md:gap-10"
          >
            {/* Stats Lines */}
            <div className="flex flex-col gap-4 mb-2">
              <div className="flex flex-col">
                <span className="text-white font-display text-3xl font-medium">72%</span>
                <div className="w-24 h-[2px] bg-white/20 mt-1 relative">
                  <div className="absolute left-0 top-0 h-full w-[72%] bg-lime-400"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-white font-display text-3xl font-medium">89%</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70 rotate-45">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="w-24 h-[2px] bg-white/20 mt-1 relative">
                  <div className="absolute left-0 top-0 h-full w-[89%] bg-white"></div>
                </div>
              </div>
            </div>

            {/* Video/Image Mini Card */}
            <div className="w-[280px] rounded-2xl overflow-hidden p-3 bg-black/40 backdrop-blur-xl border border-white/10 flex flex-col gap-3">
              <div className="w-full h-[120px] rounded-xl overflow-hidden relative">
                <img src="/creaenergy-hero-bg.jpg" alt="Video thumbnail" className="w-full h-full object-cover brightness-75" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="px-1 pb-1">
                <h4 className="text-white text-sm font-semibold leading-snug mb-1">Accelerating Renewable Energy Expansion</h4>
                <p className="text-white/50 text-[10px] leading-relaxed mb-3">
                  Discover how we're leading the charge in transforming energy systems with innovative solutions.
                </p>
                <div className="flex justify-between items-center">
                  <button className="text-white text-xs font-semibold flex items-center gap-1 hover:text-lime-400 transition-colors">
                    Get Started <ArrowUpRight className="w-3 h-3" />
                  </button>
                  <span className="text-white/50 text-[10px]">Play ►</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
