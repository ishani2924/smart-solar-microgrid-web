import { motion } from 'framer-motion';
import { UserCog, Wrench, Home } from 'lucide-react';

const roles = [
  {
    icon: UserCog,
    title: 'Backoffice',
    subtitle: 'System Administration',
    desc: 'Responsible for system administration and management.',
    functions: [
      'Manage system users',
      'Manage Solar Prosumer accounts',
      'Create and update microgrid stations',
      'Manage station schedules',
      'Manage energy slots',
      'Monitor reservations',
      'Activate or deactivate accounts and stations'
    ]
  },
  {
    icon: Wrench,
    title: 'Grid Operator',
    subtitle: 'Daily Operations',
    desc: 'Responsible for daily operational activities at microgrid stations.',
    functions: [
      'View microgrid station information',
      'Monitor energy slots',
      'Update battery-slot availability',
      'Monitor reservations',
      'Scan Prosumer QR codes',
      'Verify reservation information',
      'Complete energy transfers'
    ]
  },
  {
    icon: Home,
    title: 'Solar Prosumer',
    subtitle: 'End User',
    desc: 'A property owner who uses solar panels and interacts with microgrid stations through the mobile application.',
    functions: [
      'Register an account',
      'Manage profile information',
      'View microgrid stations',
      'View available energy slots',
      'Create reservations',
      'Modify or cancel reservations',
      'View booking history',
      'Receive reservation QR confirmation'
    ]
  }
];

const UserRolesSection = () => {
  return (
    <section id="roles" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12 flex flex-col items-center">
        
        <div className="pill-badge mb-6">
          <span className="dot"></span>
          USER ROLES
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-5xl lg:text-5xl font-medium leading-[1.1] tracking-tight text-charcoal-900 mb-16 text-center max-w-2xl"
        >
          Built for every member of the energy ecosystem
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {roles.map((role, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-charcoal-50 rounded-3xl p-8 border border-charcoal-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white border border-charcoal-200 flex items-center justify-center text-charcoal-900 shadow-sm">
                  <role.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-charcoal-900">{role.title}</h3>
                  <span className="text-xs font-bold text-lime-600 uppercase tracking-wider">{role.subtitle}</span>
                </div>
              </div>
              
              <p className="text-sm text-charcoal-500 mb-6 leading-relaxed">
                {role.desc}
              </p>

              <div className="bg-white rounded-xl p-5 border border-charcoal-100 flex-1">
                <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider mb-4">Key Functions</h4>
                <ul className="flex flex-col gap-3">
                  {role.functions.map((func, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-lime-100 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-500"></div>
                      </div>
                      <span className="text-xs text-charcoal-500 font-medium leading-relaxed">{func}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default UserRolesSection;
