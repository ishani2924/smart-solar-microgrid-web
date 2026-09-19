import { motion } from 'framer-motion';
import { MonitorDot, ShieldCheck, Smartphone } from 'lucide-react';

const roles = [
  {
    title: 'Backoffice',
    icon: MonitorDot,
    color: 'from-blue-500 to-cyan-400',
    capabilities: [
      'Manage system users',
      'Manage prosumers',
      'Manage stations',
      'Monitor reservations'
    ]
  },
  {
    title: 'Grid Operator',
    icon: ShieldCheck,
    color: 'from-teal-500 to-emerald-400',
    capabilities: [
      'Manage operational slots',
      'Monitor bookings',
      'Verify QR transactions',
      'Complete energy transfers'
    ]
  },
  {
    title: 'Solar Prosumer',
    icon: Smartphone,
    color: 'from-amber-400 to-orange-500',
    capabilities: [
      'Uses the Android mobile app',
      'Find nearby stations',
      'Reserve energy slots',
      'View reservations',
      'Receive QR confirmation'
    ]
  }
];

const UserRoles = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Dedicated Interfaces</h2>
          <p className="text-slate-400 text-lg">
            Tailored tools and permissions for every stakeholder in the energy ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="glass-card p-8 rounded-3xl relative overflow-hidden group"
            >
              {/* Decorative gradient blob */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${role.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${role.color} shadow-lg shadow-black/50`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{role.title}</h3>
              </div>

              <ul className="space-y-4">
                {role.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    <span className="text-sm">{cap}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserRoles;
