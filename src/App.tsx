/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { InputPanel } from './components/InputPanel';
import { ExplanationView } from './components/ExplanationView';
import { QuizModal } from './components/QuizModal';
import { FlashcardsModal } from './components/FlashcardsModal';
import { FollowupDrawer } from './components/FollowupDrawer';
import { SampleModal } from './components/SampleModal';
import { DifficultyLevel, ToneStyle, QuizQuestion, Flashcard, SampleConcept } from './types';

export default function App() {
  // Input State
  const [textInput, setTextInput] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ text: string; numPages: number; wordCount: number } | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Preference State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Undergraduate');
  const [tone, setTone] = useState<ToneStyle>('Analogy-Heavy');
  const [customFocus, setCustomFocus] = useState<string>('');

  // Streaming & Explanation State
  const [explanationText, setExplanationText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Interactive Tools State
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);

  const [flashcardsData, setFlashcardsData] = useState<Flashcard[] | null>(null);
  const [isFlashcardsLoading, setIsFlashcardsLoading] = useState<boolean>(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState<boolean>(false);

  const [showFollowupDrawer, setShowFollowupDrawer] = useState<boolean>(false);
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);

  // PDF Upload Handler
  const handlePdfSelect = async (file: File) => {
    setPdfFile(file);
    setIsPdfLoading(true);
    setPdfError(null);
    setPdfInfo(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract text from PDF.');
      }

      setPdfInfo({
        text: data.text,
        numPages: data.numPages,
        wordCount: data.wordCount,
      });
    } catch (err: any) {
      console.error('PDF Upload Error:', err);
      setPdfError(err.message || 'Error processing PDF document.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleClearPdf = () => {
    setPdfFile(null);
    setPdfInfo(null);
    setPdfError(null);
  };

  const handleReset = () => {
    setTextInput('');
    handleClearPdf();
    setExplanationText('');
    setQuizData(null);
    setFlashcardsData(null);
    setCustomFocus('');
    setShowFollowupDrawer(false);
  };

  // Main Streaming Handler
  const handleExplainConcept = async () => {
    const activeText = pdfInfo ? pdfInfo.text : textInput;
    if (!activeText || !activeText.trim()) return;

    setExplanationText('');
    setIsStreaming(true);
    setQuizData(null);
    setFlashcardsData(null);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeText,
          difficulty,
          tone,
          customFocus: customFocus.trim() || undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start streaming explanation.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                setExplanationText(accumulated);
              } else if (parsed.error) {
                setExplanationText((prev) => prev + `\n\n**Error:** ${parsed.error}`);
              }
            } catch (e) {
              // Ignore partial json parse errors in stream
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Streaming error:', error);
      setExplanationText(`**Error generating explanation:** ${error.message || 'Connection failed'}`);
    } finally {
      setIsStreaming(false);
    }
  };

  // Quiz Generation Handler
  const handleGenerateQuiz = async () => {
    const activeText = pdfInfo ? pdfInfo.text : textInput;
    setIsQuizLoading(true);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: activeText,
          explanationText,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.quiz) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      setQuizData(data.quiz);
      setShowQuizModal(true);
    } catch (err: any) {
      alert(`Quiz Error: ${err.message || 'Could not generate quiz'}`);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Flashcards Generation Handler
  const handleGenerateFlashcards = async () => {
    const activeText = pdfInfo ? pdfInfo.text : textInput;
    setIsFlashcardsLoading(true);

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: activeText,
          explanationText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.flashcards) {
        throw new Error(data.error || 'Failed to generate flashcards.');
      }

      setFlashcardsData(data.flashcards);
      setShowFlashcardsModal(true);
    } catch (err: any) {
      alert(`Flashcards Error: ${err.message || 'Could not generate flashcards'}`);
    } finally {
      setIsFlashcardsLoading(false);
    }
  };

  const handleSelectSample = (sample: SampleConcept) => {
    handleClearPdf();
    setTextInput(sample.text);
    setDifficulty(sample.difficulty);
    setTone(sample.tone);
    setShowSampleModal(false);
  };

  const hasInputOrOutput = textInput.trim().length > 0 || !!pdfFile || explanationText.length > 0;
  const activeSourceText = pdfInfo ? pdfInfo.text : textInput;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <Navbar
        onSelectSampleClick={() => setShowSampleModal(true)}
        onResetClick={handleReset}
        hasInputOrOutput={hasInputOrOutput}
      />

      {/* Main Body Grid */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* Left Column: Input & Preferences */}
          <div className="lg:col-span-5">
            <InputPanel
              textInput={textInput}
              setTextInput={setTextInput}
              pdfFile={pdfFile}
              pdfInfo={pdfInfo}
              isPdfLoading={isPdfLoading}
              pdfError={pdfError}
              onPdfSelect={handlePdfSelect}
              onClearPdf={handleClearPdf}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              tone={tone}
              setTone={setTone}
              customFocus={customFocus}
              setCustomFocus={setCustomFocus}
              onExplainClick={handleExplainConcept}
              isStreaming={isStreaming}
            />
          </div>

          {/* Right Column: Streaming Output Explanation */}
          <div className="lg:col-span-7">
            <ExplanationView
              explanationText={explanationText}
              isStreaming={isStreaming}
              difficulty={difficulty}
              tone={tone}
              onGenerateQuiz={handleGenerateQuiz}
              onGenerateFlashcards={handleGenerateFlashcards}
              onOpenFollowup={() => setShowFollowupDrawer(true)}
              isQuizLoading={isQuizLoading}
              isFlashcardsLoading={isFlashcardsLoading}
            />
          </div>

        </div>
      </main>

      {/* Modals & Overlays */}
      {showQuizModal && quizData && (
        <QuizModal
          quiz={quizData}
          onClose={() => setShowQuizModal(false)}
          onRetake={handleGenerateQuiz}
        />
      )}

      {showFlashcardsModal && flashcardsData && (
        <FlashcardsModal
          cards={flashcardsData}
          onClose={() => setShowFlashcardsModal(false)}
        />
      )}

      {showFollowupDrawer && (
        <FollowupDrawer
          sourceText={activeSourceText}
          explanation={explanationText}
          difficulty={difficulty}
          tone={tone}
          onClose={() => setShowFollowupDrawer(false)}
        />
      )}

      {showSampleModal && (
        <SampleModal
          onSelectSample={handleSelectSample}
          onClose={() => setShowSampleModal(false)}
        />
      )}

    </div>
  );
}
