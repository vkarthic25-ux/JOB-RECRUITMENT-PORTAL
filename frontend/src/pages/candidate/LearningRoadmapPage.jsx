import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Code2,
  Award,
  Layers,
} from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LearningRoadmapPage = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [roadmap, setRoadmap] = useState([]);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const res = await api.post('/ai/learning-roadmap', { jobId });
        if (res.data.success) {
          setRoadmap(res.data.roadmap || []);
          setTargetRole(res.data.targetRole || 'Software Engineering Role');
        }
      } catch (err) {
        console.error('Failed to load roadmap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [jobId]);

  const toggleStepCompleted = (stepNumber) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const completionPercentage =
    roadmap.length > 0
      ? Math.round((completedSteps.size / roadmap.length) * 100)
      : 0;

  if (loading) return <LoadingSpinner text="Generating personalized learning roadmap..." size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Interactive Learning Curriculum</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Personalized Learning Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200">
            Tailored step-by-step pathway for <span className="font-bold text-white">'{targetRole}'</span>. Mark milestones as you complete them!
          </p>
        </div>

        {/* Completion Widget */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 min-w-[200px] text-xs">
          <div className="flex justify-between font-bold mb-1.5">
            <span>Milestones Mastered</span>
            <span className="text-emerald-300">
              {completedSteps.size} of {roadmap.length} ({completionPercentage}%)
            </span>
          </div>
          <ProgressBar
            value={completionPercentage}
            colorScheme="emerald"
            showPercentage={false}
          />
        </div>
      </div>

      {/* Roadmap Steps */}
      {roadmap.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
          No missing skills identified! You currently satisfy the required qualifications for this position.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-200">
          {roadmap.map((item, idx) => {
            const isDone = completedSteps.has(item.step);
            return (
              <div key={idx} className="relative group">
                {/* Checkbox circle milestone on timeline */}
                <button
                  type="button"
                  onClick={() => toggleStepCompleted(item.step)}
                  className={`absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-indigo-400 text-indigo-600 hover:border-indigo-600'
                  }`}
                  title="Click to toggle milestone completion"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-[10px] font-bold">{item.step}</span>
                  )}
                </button>

                {/* Step Card */}
                <div
                  className={`p-6 rounded-3xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200 opacity-90'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                        Step {item.step}
                      </span>
                      <span className="text-slate-300">•</span>
                      <h3
                        className={`text-base font-bold text-slate-900 ${
                          isDone ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.skill}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {item.importance || 'High'} Priority
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleStepCompleted(item.step)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isDone ? 'Completed ✓' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>

                  {/* Core Topics Checklist */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Key Topics & Concepts:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.topics?.map((topic, tidx) => (
                        <div
                          key={tidx}
                          className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-700"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Project */}
                  {item.suggestedProject && (
                    <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 text-xs text-indigo-950 flex items-start space-x-2.5">
                      <Code2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Cap-stone Milestone Project: </span>
                        <span>{item.suggestedProject}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningRoadmapPage;
