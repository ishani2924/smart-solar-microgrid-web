import React from 'react';

const Analysis = () => {
  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">System Analysis</h1>
          <p className="text-gray-500 text-sm font-medium">View grid performance and analytical reports</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Analysis Dashboard Coming Soon</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            We are working on powerful new analytics tools to help you visualize microgrid performance and optimize energy distribution. Check back later!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
