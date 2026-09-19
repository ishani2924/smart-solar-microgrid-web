import { Sun } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-teal-500/10 bg-navy-900 pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 text-2xl font-bold tracking-tight mb-4">
              <Sun className="w-8 h-8 text-teal-400" />
              <span>
                Solar<span className="text-teal-400">Grid</span>
              </span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powering smarter solar energy management. A smart platform that connects solar prosumers, grid operators and microgrid stations.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">How It Works</a></li>
              <li><a href="#features" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">Features</a></li>
              <li><a href="#" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">Microgrid Stations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">About Us</a></li>
              <li><a href="#contact" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">Contact</a></li>
              <li><a href="#" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Notice</h4>
            <div className="glass-panel p-4 rounded-xl border border-teal-500/20">
              <p className="text-xs text-slate-300">
                This is a university enterprise application project for the Smart Solar Microgrid Trading System. Demo purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} SolarGrid System. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:text-teal-400 transition-all cursor-pointer">
              {/* Demo Social Icon */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
