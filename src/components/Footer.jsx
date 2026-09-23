const Footer = () => {
  return (
    <footer className="bg-charcoal-900 pt-16 pb-8 border-t border-charcoal-800">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="md:col-span-1 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2 font-display font-bold text-2xl text-white tracking-tight">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="#C5F849"/>
              </svg>
              SolarGrid
            </a>
            <p className="text-sm leading-relaxed text-charcoal-400">
              Clean Energy, Infinite Possibilities. Powering smarter solar energy management worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-5 text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {['Home', 'About Us', 'Services', 'Team', 'Contact'].map(item => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-charcoal-400 hover:text-lime-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-5 text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3">
              {['Login', 'Register', 'Prosumer Portal', 'Operator Dashboard'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-charcoal-400 hover:text-lime-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-5 text-white uppercase tracking-wider">Notice</h4>
            <div className="rounded-2xl p-4 bg-charcoal-800 border border-charcoal-700">
              <p className="text-xs leading-relaxed text-charcoal-400">
                This is a university enterprise application project for the Smart Solar Microgrid Trading System. Demo purposes only.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-charcoal-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-charcoal-400">
            &copy; {new Date().getFullYear()} SolarGrid System. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span className="text-xs text-charcoal-400">System Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
