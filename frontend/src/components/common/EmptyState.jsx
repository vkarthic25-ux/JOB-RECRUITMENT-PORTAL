import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are currently no records available in this view.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
