import React, { useState } from 'react';
import { Flashcard } from '../types';
import { X, ChevronLeft, ChevronRight, RotateCw, CheckCircle, Layers } from 'lucide-react';

interface FlashcardsModalProps {
  cards: Flashcard[];
  onClose: () => void;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({ cards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  const isMastered = masteredIds.has(currentCard.id || String(currentIndex));

  const toggleMastered = () => {
    const id = currentCard.id || String(currentIndex);
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-[24px] border border-slate-200 bg-white shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow-xs">
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Interactive Study Flashcards</h3>
              <p className="text-xs text-slate-500">Card {currentIndex + 1} of {cards.length}</p>
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

        {/* Card Arena */}
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`group relative flex min-h-[220px] w-full cursor-pointer flex-col justify-between rounded-2xl border p-6 text-center transition-all duration-300 shadow-xs ${
              isFlipped
                ? 'border-indigo-400 bg-indigo-50/60 text-slate-900 shadow-xs'
                : 'border-slate-200 bg-slate-50/40 text-slate-900 hover:border-slate-300'
            }`}
          >
            {/* Top Category Badge & Flip Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="rounded-md bg-white px-3 py-1 font-mono text-[11px] font-semibold text-indigo-700 border border-slate-200">
                {currentCard.category || 'Concept'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-700">
                <RotateCw className="h-3 w-3" /> Click card to flip
              </span>
            </div>

            {/* Card Main Text */}
            <div className="my-auto py-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {isFlipped ? 'BACK (DEFINITION / ANSWER)' : 'FRONT (QUESTION / CONCEPT)'}
              </span>
              <p className={`font-semibold leading-relaxed ${isFlipped ? 'text-base text-indigo-950 font-medium' : 'text-lg text-slate-900'}`}>
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastered();
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  isMastered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className={`h-3.5 w-3.5 ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {cards.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-indigo-600'
                      : masteredIds.has(card.id || String(idx))
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
