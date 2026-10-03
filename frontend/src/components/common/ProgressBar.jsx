import React from 'react';

const ProgressBar = ({
  value,
  progress,
  score,
  max = 100,
  label = '',
  showPercentage,
  colorScheme = 'auto',
  color,
  size = 'md',
  height,
  className = '',
}) => {
  // Support value, progress, or score interchangeably
  const raw = value !== undefined ? value : progress !== undefined ? progress : score !== undefined ? score : 0;
  const num = Math.min(100, Math.max(0, Number(raw) || 0));
  const percentage = Math.min(Math.max(Math.round((num / max) * 100), 0), 100);

  // Height sizing
  let barHeight = height;
  if (!barHeight) {
    if (size === 'xs') barHeight = 'h-1.5';
    else if (size === 'sm') barHeight = 'h-2';
    else if (size === 'lg') barHeight = 'h-3.5';
    else barHeight = 'h-2.5';
  }

  // Color handling
  const activeColor = color || colorScheme;
  let fillColor = 'bg-indigo-600';
  if (activeColor === 'auto') {
    if (percentage >= 80) fillColor = 'bg-emerald-500';
    else if (percentage >= 60) fillColor = 'bg-indigo-600';
    else if (percentage >= 40) fillColor = 'bg-amber-500';
    else fillColor = 'bg-rose-500';
  } else if (activeColor === 'emerald') {
    fillColor = 'bg-emerald-500';
  } else if (activeColor === 'indigo') {
    fillColor = 'bg-indigo-600';
  } else if (activeColor === 'amber') {
    fillColor = 'bg-amber-500';
  } else if (activeColor === 'purple') {
    fillColor = 'bg-purple-600';
  } else if (activeColor === 'rose') {
    fillColor = 'bg-rose-500';
  } else if (activeColor === 'blue') {
    fillColor = 'bg-blue-600';
  }

  // Header display rule:
  // If label is present, default showPercentage to true unless explicitly false
  // If label is not present, only show percentage if explicitly requested as true
  const renderPercentage = showPercentage !== undefined ? Boolean(showPercentage) : Boolean(label);
  const shouldRenderHeader = Boolean(label) || showPercentage === true;

  return (
    <div className={`w-full ${className}`}>
      {shouldRenderHeader && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-700">
          <span>{label}</span>
          {renderPercentage && <span className="font-bold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${barHeight}`}>
        <div
          className={`${barHeight} rounded-full transition-all duration-700 ease-out ${fillColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
