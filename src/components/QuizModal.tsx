import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { X, CheckCircle2, XCircle, RotateCcw, Trophy, Award, Sparkles } from 'lucide-react';

interface QuizModalProps {
  quiz: QuizQuestion[];
  onClose: () => void;
  onRetake: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose, onRetake }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (selectedAnswers[questionIndex] !== undefined) return; // locked once answered
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const allAnswered = answeredCount === quiz.length;
  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[24px] border border-slate-200 bg-white shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow-xs">
              <Trophy className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Interactive Concept Quiz</h3>
              <p className="text-xs text-slate-500">Test your understanding with 3 quick questions</p>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {quiz.map((q, qIdx) => {
            const selectedOpt = selectedAnswers[qIdx];
            const isAnswered = selectedOpt !== undefined;

            return (
              <div
                key={q.id || qIdx}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    <span className="text-indigo-600 font-mono mr-2">Q{qIdx + 1}.</span>
                    {q.question}
                  </h4>
                  {isAnswered && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      selectedOpt === q.correctIndex
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {selectedOpt === q.correctIndex ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Correct</>
                      ) : (
                        <><XCircle className="h-3.5 w-3.5" /> Incorrect</>
                      )}
                    </span>
                  )}
                </div>

                {/* Option Buttons */}
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, optIdx) => {
                    let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';

                    if (isAnswered) {
                      if (optIdx === q.correctIndex) {
                        btnStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold ring-1 ring-emerald-500/30';
                      } else if (optIdx === selectedOpt) {
                        btnStyle = 'border-rose-500 bg-rose-50/80 text-rose-900 ring-1 ring-rose-500/30';
                      } else {
                        btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        disabled={isAnswered}
                        className={`flex items-start text-left gap-3 rounded-lg border p-3 text-xs leading-relaxed transition-all ${btnStyle}`}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-[10px] font-bold font-mono">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="pt-0.5">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {isAnswered && (
                  <div className="mt-3 rounded-lg bg-indigo-50/80 border border-indigo-200/80 p-3 text-xs text-indigo-900">
                    <span className="font-bold text-indigo-700 block mb-0.5">Explanation:</span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Score Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <span className="text-xs text-slate-600">
              Score: <strong className="text-slate-900 text-sm font-mono">{score}</strong> / {quiz.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRetake}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Regenerate Quiz</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#1A1A1A] px-4 py-2 text-xs font-medium text-white hover:bg-black transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
