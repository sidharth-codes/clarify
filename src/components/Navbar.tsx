import React from 'react';
import { Sparkles, BookOpen, RotateCcw, Zap, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onSelectSampleClick: () => void;
  onResetClick: () => void;
  hasInputOrOutput: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectSampleClick,
  onResetClick,
  hasInputOrOutput,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E5E5] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow-sm">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
                Clarify<span className="text-indigo-600 font-bold">.AI</span>
              </h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> SSE Streaming
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Complex concepts, simplified for any target audience.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onSelectSampleClick}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-white hover:border-slate-300 transition-all shadow-xs"
          >
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <span>Load Sample</span>
          </button>

          {hasInputOrOutput && (
            <button
              type="button"
              onClick={onResetClick}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
              title="Clear all inputs and results"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 border-l border-slate-200 pl-3 ml-1">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>PDF & Plain Text</span>
          </div>
        </div>
      </div>
    </header>
  );
};
