import { motion } from 'framer-motion';

const stats = [
  { id: 1, name: 'Active Microgrid Stations', value: '142' },
  { id: 2, name: 'Registered Prosumers', value: '8,439' },
  { id: 3, name: 'Energy Reservations', value: '24.5k' },
  { id: 4, name: 'Completed Transfers (MWh)', value: '156.2' },
];

const Statistics = () => {
  return (
    <section className="py-12 md:py-24 relative border-t border-teal-500/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 md:p-8 rounded-2xl text-center"
            >
              <dt className="text-sm md:text-base font-medium text-slate-400 mb-2">{stat.name}</dt>
              <dd className="text-3xl md:text-5xl font-bold text-white tracking-tight text-gradient">
                {stat.value}
              </dd>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
