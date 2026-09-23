import { motion } from 'framer-motion';

const steps = [
  { num: '1', title: 'Find a Microgrid Station', desc: 'Solar Prosumers can view available microgrid stations and their information through the mobile application.' },
  { num: '2', title: 'View Available Energy Slots', desc: 'Users can check available energy-transfer slots for a selected microgrid station.' },
  { num: '3', title: 'Reserve a Slot', desc: 'The Prosumer selects an available station and time slot and creates a reservation.' },
  { num: '4', title: 'Receive Confirmation', desc: 'Once the reservation is approved, the Prosumer receives confirmation and a secure QR code.' },
  { num: '5', title: 'Verify at the Station', desc: 'The Grid Operator scans the QR code and verifies the reservation using the system.' },
  { num: '6', title: 'Complete the Energy Transfer', desc: 'After successful verification, the Grid Operator completes the energy-transfer process and the transaction is recorded.' }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gray-50 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="pill-badge mb-6 bg-white">
            <span className="dot"></span>
            HOW IT WORKS
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-medium text-charcoal-900 tracking-tight">
            Simple Energy Slot Management
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white rounded-[2rem] p-8 border border-gray-100 hover:border-lime-300 transition-colors overflow-hidden group shadow-sm hover:shadow-md"
            >
              {/* Giant background number */}
              <div className="absolute -right-4 -bottom-8 text-[8rem] font-display font-bold text-gray-50 group-hover:text-lime-50 transition-colors z-0 select-none">
                {step.num}
              </div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-charcoal-900 text-lime-400 flex items-center justify-center font-display font-bold text-xl mb-6 shadow-md">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-3 leading-tight">{step.title}</h3>
                <p className="text-sm text-charcoal-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
