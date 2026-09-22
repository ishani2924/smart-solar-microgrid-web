import React from 'react';

const Support = () => {
  return (
    <div className="text-charcoal-900 w-full h-full flex flex-col pt-4 pb-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-charcoal-900 tracking-tight">Help & Support</h1>
          <p className="text-gray-500 text-sm font-medium">Get assistance and manage support tickets</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Support Center Coming Soon</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            A comprehensive support and ticketing system is currently under development to help you resolve issues faster. Check back later!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
