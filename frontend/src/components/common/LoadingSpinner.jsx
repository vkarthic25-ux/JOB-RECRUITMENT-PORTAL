import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-indigo-600 border-t-transparent animate-spin`}
      />
      {text && <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
