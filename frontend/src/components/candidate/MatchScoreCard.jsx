import React from 'react';
import { Sparkles, BrainCircuit, CheckCircle, AlertCircle, Info } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

const MatchScoreCard = ({ matchAnalysis, compact = false }) => {
  if (!matchAnalysis) return null;

  const {
    matchPercentage = 0,
    skillMatch = 0,
    experienceMatch = 0,
    educationMatch = 0,
    roleMatch = 0,
    matchedSkills = [],
    missingSkills = [],
    whyMatched = '',
    disclaimer = '',
  } = matchAnalysis;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center">
              AI Match Analysis
              <span className="ml-2 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Explainable AI
              </span>
            </h4>
            <p className="text-xs text-slate-500">Resume alignment with job requirements</p>
          </div>
        </div>

        {/* Big Overall Match Score */}
        <div className="text-right">
          <div className="flex items-baseline justify-end space-x-1">
            <span
              className={`text-3xl font-extrabold ${
                matchPercentage >= 75
                  ? 'text-emerald-600'
                  : matchPercentage >= 50
                  ? 'text-indigo-600'
                  : 'text-amber-600'
              }`}
            >
              {matchPercentage}%
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Overall Compatibility
          </span>
        </div>
      </div>

      {/* Metric Bars (Skills 50%, Experience 20%, Education 15%, Role Relevance 15%) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
        <div>
          <ProgressBar
            label="Skill Match (50% weight)"
            value={skillMatch}
            colorScheme={skillMatch >= 75 ? 'emerald' : 'indigo'}
          />
        </div>
        <div>
          <ProgressBar
            label="Experience Match (20% weight)"
            value={experienceMatch}
            colorScheme={experienceMatch >= 75 ? 'emerald' : 'indigo'}
          />
        </div>
        <div>
          <ProgressBar
            label="Education Match (15% weight)"
            value={educationMatch}
            colorScheme={educationMatch >= 75 ? 'emerald' : 'indigo'}
          />
        </div>
        <div>
          <ProgressBar
            label="Role Relevance (15% weight)"
            value={roleMatch}
            colorScheme={roleMatch >= 75 ? 'emerald' : 'indigo'}
          />
        </div>
      </div>

      {/* Matched vs Missing Skills */}
      {!compact && (
        <div className="space-y-4 mb-4">
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
              Matched Skills ({matchedSkills.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  >
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No direct skill matches identified</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
              Missing Skills to Acquire ({missingSkills.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.length > 0 ? (
                missingSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80"
                  >
                    + {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 font-medium">All required skills present in your profile!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Why Matched explanation */}
      {whyMatched && (
        <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-3 text-xs text-indigo-950 flex items-start space-x-2.5 mt-3">
          <BrainCircuit className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">AI Insight:</span> {whyMatched}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <div className="mt-3 text-[11px] text-slate-400 italic flex items-center">
          <Info className="w-3 h-3 mr-1 flex-shrink-0" />
          {disclaimer}
        </div>
      )}
    </div>
  );
};

export default MatchScoreCard;
