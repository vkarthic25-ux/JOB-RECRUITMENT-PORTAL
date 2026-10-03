import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Check, AlertTriangle, X } from 'lucide-react';
import Badge from '../common/Badge';

const EligibilityCard = ({ eligibilityStatus = 'Partially Eligible', eligibilityReasons = [] }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Eligible':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'Partially Eligible':
        return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'Not Eligible':
        return <ShieldX className="w-5 h-5 text-rose-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            {getStatusIcon(eligibilityStatus)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Eligibility Checker</h4>
            <p className="text-xs text-slate-500">Automated criteria verification</p>
          </div>
        </div>
        <Badge variant={eligibilityStatus} size="lg">
          {eligibilityStatus}
        </Badge>
      </div>

      <div className="mt-3 space-y-2.5">
        {eligibilityReasons && eligibilityReasons.length > 0 ? (
          eligibilityReasons.map((reason, idx) => {
            const isCheck = reason.startsWith('✓');
            const isPartial = reason.startsWith('~');
            const isCross = reason.startsWith('✗');

            return (
              <div
                key={idx}
                className={`flex items-start text-xs p-2.5 rounded-xl border ${
                  isCheck
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                    : isPartial
                    ? 'bg-amber-50/50 border-amber-100 text-amber-900'
                    : isCross
                    ? 'bg-rose-50/50 border-rose-100 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex-shrink-0 mr-2.5 mt-0.5 font-bold">
                  {isCheck && <Check className="w-4 h-4 text-emerald-600" />}
                  {isPartial && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {isCross && <X className="w-4 h-4 text-rose-600" />}
                </span>
                <span className="font-medium leading-relaxed">
                  {reason.replace(/^[✓~✗]\s*/, '')}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500">All standard eligibility conditions verified.</p>
        )}
      </div>
    </div>
  );
};

export default EligibilityCard;
