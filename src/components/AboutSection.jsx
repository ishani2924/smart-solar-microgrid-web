import { motion } from 'framer-motion';
import heroImg from '../assets/heroimg.jpg';

const stats = [
  { value: '00+', label: 'Active Microgrid Stations' },
  { value: '00+', label: 'Registered Prosumers' },
  { value: '00+', label: 'Energy Reservations' },
  { value: '00+', label: 'Completed Transfers' }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-white relative">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Top Badge */}
        <div className="flex mb-8">
          <div className="pill-badge">
            <span className="dot"></span>
            ABOUT US
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-12">
          
          {/* Left Side: Images */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full h-48 rounded-2xl overflow-hidden bg-charcoal-100"
            >
              <img src={heroImg} alt="Solar facility" className="w-full h-full object-cover object-left" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="w-full h-48 rounded-2xl overflow-hidden bg-charcoal-100"
            >
              <img src={heroImg} alt="Solar landscape" className="w-full h-full object-cover object-right" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full h-24 rounded-2xl overflow-hidden bg-charcoal-100"
            >
              <img src={heroImg} alt="Solar details" className="w-full h-full object-cover object-bottom" />
            </motion.div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-2/3 flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-charcoal-900 mb-6 tracking-tight"
            >
              What is SolarGrid?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-charcoal-400 leading-relaxed max-w-3xl mb-12"
            >
              SolarGrid is a Smart Solar Microgrid Trading System designed to simplify the management of solar microgrid stations and energy-transfer reservations.
              <br/><br/>
              The system allows administrators to manage microgrid stations, Grid Operators to manage operational activities, and Solar Prosumers to find available stations and reserve energy slots using the mobile application.
            </motion.p>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-charcoal-50 p-6 rounded-2xl flex flex-col justify-center gap-2 border border-transparent hover:border-lime-300 transition-colors text-center"
                >
                  <div className="font-display text-4xl lg:text-5xl font-bold text-charcoal-900">{stat.value}</div>
                  <div className="text-xs font-semibold text-charcoal-400 uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
