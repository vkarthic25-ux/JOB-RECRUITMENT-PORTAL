import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
  className = '',
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80 text-indigo-600 border-indigo-100',
      glow: 'group-hover:border-indigo-300',
    },
    emerald: {
      bg: 'bg-emerald-50/80 text-emerald-600 border-emerald-100',
      glow: 'group-hover:border-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50/80 text-amber-600 border-amber-100',
      glow: 'group-hover:border-amber-300',
    },
    purple: {
      bg: 'bg-purple-50/80 text-purple-600 border-purple-100',
      glow: 'group-hover:border-purple-300',
    },
    cyan: {
      bg: 'bg-cyan-50/80 text-cyan-600 border-cyan-100',
      glow: 'group-hover:border-cyan-300',
    },
  };

  const selected = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`group bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 ${selected.glow} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${selected.bg} transition-transform group-hover:scale-105`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 flex items-center text-xs font-medium text-slate-500">
          {trend && (
            <span
              className={`mr-2 font-bold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
