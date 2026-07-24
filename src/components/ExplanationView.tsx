import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  Copy, 
  Check, 
  Download, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  MessageSquare, 
  Loader2, 
  Zap,
  BookCheck
} from 'lucide-react';
import { DifficultyLevel, ToneStyle } from '../types';

interface ExplanationViewProps {
  explanationText: string;
  isStreaming: boolean;
  difficulty: DifficultyLevel;
  tone: ToneStyle;
  onGenerateQuiz: () => void;
  onGenerateFlashcards: () => void;
  onOpenFollowup: () => void;
  isQuizLoading: boolean;
  isFlashcardsLoading: boolean;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  explanationText,
  isStreaming,
  difficulty,
  tone,
  onGenerateQuiz,
  onGenerateFlashcards,
  onOpenFollowup,
  isQuizLoading,
  isFlashcardsLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Stop speech if explanation changes or component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [explanationText]);

  const handleCopy = () => {
    if (!explanationText) return;
    navigator.clipboard.writeText(explanationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!explanationText) return;
    const blob = new Blob([explanationText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `concept-explanation-${difficulty.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown symbols for cleaner TTS reading
      const plainText = explanationText
        .replace(/#+/g, '')
        .replace(/\*+/g, '')
        .replace(/`+/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/\$(.*?)\$/g, '$1');

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const changeRate = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlayingAudio && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="flex flex-col rounded-[32px] border border-slate-200/80 bg-white shadow-xs overflow-hidden min-h-[600px]">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow-xs">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              Generated Explanation
              {isStreaming && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Streaming live
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="text-indigo-600 font-medium">{difficulty}</span>
              <span>•</span>
              <span>{tone}</span>
            </div>
          </div>
        </div>

        {/* Header Tools */}
        {explanationText && (
          <div className="flex items-center gap-2">
            {/* Audio Speech Controls */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={toggleSpeech}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  isPlayingAudio
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title={isPlayingAudio ? 'Stop Reading' : 'Listen Read Aloud'}
              >
                {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-indigo-600" />}
                <span className="hidden sm:inline">{isPlayingAudio ? 'Pause' : 'Listen'}</span>
              </button>

              <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-1.5 pr-1 text-[10px] text-slate-500 font-mono">
                {[0.9, 1.0, 1.25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => changeRate(rate)}
                    className={`px-1.5 py-0.5 rounded ${speechRate === rate ? 'bg-indigo-100 text-indigo-800 font-bold' : 'hover:text-slate-800'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white transition-all shadow-2xs"
              title="Copy Markdown"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white transition-all shadow-2xs"
              title="Download Markdown"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Streaming Output Content Area */}
      <div className="p-8 sm:p-10 overflow-y-auto max-h-[640px] flex-1 bg-white">
        {!explanationText && !isStreaming ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 my-auto">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 text-indigo-600 shadow-xs">
              <Zap className="h-8 w-8 text-indigo-600" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              Ready to Clarify Any Concept
            </h4>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
              Paste your raw notes or upload a PDF on the left, select your audience level and tone, then click <strong className="text-slate-900 font-semibold">Explain Concept</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3.5 py-1 border border-slate-200">👶 ELI5 Analogy</span>
              <span className="rounded-full bg-slate-100 px-3.5 py-1 border border-slate-200">🎓 Academic Math</span>
              <span className="rounded-full bg-slate-100 px-3.5 py-1 border border-slate-200">🧪 Quizzes & Flashcards</span>
            </div>
          </div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {explanationText}
            </ReactMarkdown>

            {/* Streaming Cursor */}
            {isStreaming && (
              <span className="inline-block h-4 w-2 bg-indigo-600 ml-1 animate-pulse rounded-sm align-middle" />
            )}
          </div>
        )}
      </div>

      {/* Interactive Follow-Up Action Footer */}
      {explanationText && !isStreaming && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Study Tools & Follow-Ups
            </span>
            <span className="text-xs text-indigo-600 font-mono">
              Ready
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Generate 3-Question Quiz */}
            <button
              type="button"
              onClick={onGenerateQuiz}
              disabled={isQuizLoading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 transition-all shadow-xs disabled:opacity-50"
            >
              {isQuizLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              ) : (
                <HelpCircle className="h-4 w-4 text-indigo-600" />
              )}
              <span>Generate 3-Question Quiz</span>
            </button>

            {/* Study Flashcards */}
            <button
              type="button"
              onClick={onGenerateFlashcards}
              disabled={isFlashcardsLoading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 transition-all shadow-xs disabled:opacity-50"
            >
              {isFlashcardsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              ) : (
                <Layers className="h-4 w-4 text-indigo-600" />
              )}
              <span>3 Study Flashcards</span>
            </button>

            {/* Ask Follow-Up Question */}
            <button
              type="button"
              onClick={onOpenFollowup}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200/80 px-4 py-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-all shadow-xs"
            >
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <span>Ask Follow-Up Q&A</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
