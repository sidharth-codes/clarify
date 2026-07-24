import React from 'react';
import { SAMPLE_CONCEPTS } from '../data/sampleConcepts';
import { SampleConcept } from '../types';
import { X, Atom, Brain, TrendingUp, Leaf, Sparkles, BookOpen } from 'lucide-react';

interface SampleModalProps {
  onSelectSample: (sample: SampleConcept) => void;
  onClose: () => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({ onSelectSample, onClose }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Atom': return <Atom className="h-5 w-5 text-indigo-400" />;
      case 'Brain': return <Brain className="h-5 w-5 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'Leaf': return <Leaf className="h-5 w-5 text-amber-400" />;
      default: return <Sparkles className="h-5 w-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[24px] border border-slate-200 bg-white shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow-xs">
              <BookOpen className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Load Sample Concept</h3>
              <p className="text-xs text-slate-500">Choose a pre-loaded topic to test streaming explanations</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid of Samples */}
        <div className="grid grid-cols-1 gap-3 p-6 overflow-y-auto sm:grid-cols-2">
          {SAMPLE_CONCEPTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-400 hover:shadow-xs active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                      {getIcon(sample.iconName)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {sample.category}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                  {sample.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-3">
                  {sample.text}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-2.5 border-t border-slate-100">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-700 font-medium">
                  {sample.difficulty}
                </span>
                <span>•</span>
                <span>{sample.tone}</span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
