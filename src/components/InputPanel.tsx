import React, { useState, useRef, DragEvent } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Baby, 
  GraduationCap, 
  BookOpenCheck, 
  Microscope, 
  Lightbulb, 
  Target, 
  Smile, 
  Trash2, 
  FileCheck, 
  Loader2, 
  Sliders,
  X
} from 'lucide-react';
import { DifficultyLevel, ToneStyle } from '../types';

interface InputPanelProps {
  textInput: string;
  setTextInput: (val: string) => void;
  pdfFile: File | null;
  pdfInfo: { text: string; numPages: number; wordCount: number } | null;
  isPdfLoading: boolean;
  pdfError: string | null;
  onPdfSelect: (file: File) => void;
  onClearPdf: () => void;
  difficulty: DifficultyLevel;
  setDifficulty: (diff: DifficultyLevel) => void;
  tone: ToneStyle;
  setTone: (tone: ToneStyle) => void;
  customFocus: string;
  setCustomFocus: (focus: string) => void;
  onExplainClick: () => void;
  isStreaming: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  textInput,
  setTextInput,
  pdfFile,
  pdfInfo,
  isPdfLoading,
  pdfError,
  onPdfSelect,
  onClearPdf,
  difficulty,
  setDifficulty,
  tone,
  setTone,
  customFocus,
  setCustomFocus,
  onExplainClick,
  isStreaming,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = activeTab === 'pdf' && pdfInfo 
    ? pdfInfo.wordCount 
    : textInput.trim().split(/\s+/).filter(Boolean).length;

  const charCount = activeTab === 'pdf' && pdfInfo 
    ? pdfInfo.text.length 
    : textInput.length;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setActiveTab('pdf');
        onPdfSelect(file);
      } else {
        alert('Please drop a valid .pdf file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onPdfSelect(file);
    }
  };

  const difficulties: { level: DifficultyLevel; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { level: '5-Year-Old/ELI5', label: '5-Year-Old (ELI5)', desc: 'Simple stories & zero jargon', icon: Baby },
    { level: 'High School', label: 'High School', desc: 'Relatable examples & basics', icon: GraduationCap },
    { level: 'Undergraduate', label: 'Undergraduate', desc: 'Conceptual depth & formulas', icon: BookOpenCheck },
    { level: 'Domain Expert', label: 'Domain Expert', desc: 'Formal mechanics & precision', icon: Microscope },
  ];

  const tones: { style: ToneStyle; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { style: 'Analogy-Heavy', label: 'Analogy-Heavy', desc: 'Rich metaphors & analogies', icon: Lightbulb },
    { style: 'Plain & Direct', label: 'Plain & Direct', desc: 'Concise, zero-fluff facts', icon: Target },
    { style: 'Humorous & Casual', label: 'Humorous & Casual', desc: 'Witty, upbeat & engaging', icon: Smile },
  ];

  const canSubmit = (activeTab === 'text' ? textInput.trim().length > 0 : !!pdfInfo) && !isPdfLoading && !isStreaming;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
      
      {/* Source Material Tab Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
            Source Material
          </label>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span><strong className="text-slate-700 font-mono">{wordCount}</strong> words</span>
            <span>•</span>
            <span><strong className="text-slate-700 font-mono">{charCount}</strong> chars</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>Paste Text / Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'pdf'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-indigo-600" />
            <span>Upload PDF</span>
            {pdfFile && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Input Content Area */}
      {activeTab === 'text' ? (
        <div className="relative">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="E.g. The Einstein-Podolsky-Rosen (EPR) paradox and Bell's theorem demonstrate that quantum mechanics contradicts local realism..."
            rows={6}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
          />
          {textInput.length > 0 && (
            <button
              type="button"
              onClick={() => setTextInput('')}
              className="absolute right-3 top-3 rounded-lg bg-slate-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors"
              title="Clear text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {!pdfFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-white'
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-xs border border-slate-200">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Drop PDF document or click to browse
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Max 15MB file size
              </p>
              <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200/60">
                Browse PDF File
              </span>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                      {pdfFile.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • {pdfInfo ? `${pdfInfo.numPages} pages` : 'Extracting...'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClearPdf}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:text-rose-600 hover:border-slate-300 transition-colors"
                  title="Remove PDF"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {isPdfLoading && (
                <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-indigo-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting text from PDF...</span>
                </div>
              )}

              {pdfError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                  {pdfError}
                </div>
              )}

              {pdfInfo && (
                <div className="rounded-lg bg-white p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Extracted Text Preview:
                  </span>
                  <p className="text-xs text-slate-600 line-clamp-2 font-mono leading-relaxed italic">
                    "{pdfInfo.text.slice(0, 200)}..."
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Target Audience Selector */}
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400 flex items-center justify-between">
          <span>Target Audience</span>
          <span className="text-indigo-600 font-mono text-xs lowercase">{difficulty}</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((item) => {
            const Icon = item.icon;
            const isSelected = difficulty === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => setDifficulty(item.level)}
                className={`group flex items-start gap-2.5 rounded-xl p-3 text-left transition-all border ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <h5 className={`text-xs font-semibold leading-snug ${isSelected ? 'text-indigo-950 font-bold' : 'text-slate-700'}`}>
                    {item.label}
                  </h5>
                  <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone & Style Selector */}
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400 flex items-center justify-between">
          <span>Tone & Style</span>
          <span className="text-indigo-600 font-mono text-xs lowercase">{tone}</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {tones.map((item) => {
            const Icon = item.icon;
            const isSelected = tone === item.style;
            return (
              <button
                key={item.style}
                type="button"
                onClick={() => setTone(item.style)}
                className={`flex flex-col items-center justify-center text-center rounded-xl p-2.5 transition-all border ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-indigo-950' : 'text-slate-700'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Custom Instructions */}
      <div className="space-y-1.5">
        <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
          <Sliders className="h-3 w-3" />
          <span>Custom Instructions (Optional)</span>
        </label>
        <input
          type="text"
          value={customFocus}
          onChange={(e) => setCustomFocus(e.target.value)}
          placeholder="e.g. Include physical intuition, Python code sample..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Main Submit Action */}
      <button
        type="button"
        onClick={onExplainClick}
        disabled={!canSubmit}
        className={`w-full py-4 rounded-2xl text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 ${
          canSubmit
            ? 'bg-[#1A1A1A] text-white hover:bg-black active:scale-[0.99] cursor-pointer'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isStreaming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Streaming Explanation...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Explain Concept</span>
          </>
        )}
      </button>

    </div>
  );
};
