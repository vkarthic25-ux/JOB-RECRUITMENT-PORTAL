import React from 'react';
import { Target, BookOpen, ArrowRight, Lightbulb, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SkillGapCard = ({ skillGaps = [], jobId, jobTitle = 'Target Position' }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">AI Skill Gap Analysis</h4>
            <p className="text-xs text-slate-500">Targeted upskilling recommendations for this role</p>
          </div>
        </div>

        {jobId && (
          <Link
            to={`/candidate/learning-roadmap?jobId=${jobId}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center transition"
          >
            Full Roadmap <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        )}
      </div>

      {skillGaps.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100 flex items-center">
          <Target className="w-4 h-4 mr-2 text-emerald-600" />
          Outstanding! You possess all primary technical skills specified for this position.
        </div>
      ) : (
        <div className="space-y-4">
          {skillGaps.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  {item.skill}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {item.importance || 'High Priority'}
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                {item.whyImportant}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 mb-3">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Required Level</span>
                  <span className="font-semibold text-slate-800">{item.requiredLevel || 'Intermediate'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Assessment</span>
                  <span className="font-semibold text-amber-700">{item.currentLevel || 'Needs Development'}</span>
                </div>
              </div>

              {item.topics && item.topics.length > 0 && (
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Key Topics to Master:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.topics.slice(0, 4).map((topic, tidx) => (
                      <span
                        key={tidx}
                        className="text-[11px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.suggestedProject && (
                <div className="mt-2 text-xs bg-indigo-50/80 p-2.5 rounded-lg border border-indigo-100/60 text-indigo-900 flex items-start space-x-2">
                  <Code2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">Suggested Project:</span> {item.suggestedProject}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillGapCard;
