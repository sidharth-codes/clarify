import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChatMessage, DifficultyLevel, ToneStyle } from '../types';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { API_URL } from "../config";

interface FollowupDrawerProps {
  sourceText: string;
  explanation: string;
  difficulty: DifficultyLevel;
  tone: ToneStyle;
  onClose: () => void;
}

export const FollowupDrawer: React.FC<FollowupDrawerProps> = ({
  sourceText,
  explanation,
  difficulty,
  tone,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm here to answer any follow-up questions about this concept. Ask me for specific examples, clarification on any term, or real-world code/math applications!`,
      timestamp: Date.now(),
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputQuestion.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: inputQuestion.trim(),
      timestamp: Date.now(),
    };

    const assistantMsgId = 'assistant-' + (Date.now() + 1);
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    const questionText = inputQuestion.trim();
    setInputQuestion('');
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_URL}/api/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText,
          explanation,
          history: messages.slice(-6), // Send last 6 messages
          question: questionText,
          difficulty,
          tone,
        }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let errMessage = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          const text = await response.text();
          if (text) errMessage = text.slice(0, 300);
        }
        throw new Error(errMessage);
      }

      if (contentType.includes('text/html')) {
        throw new Error('Follow-up endpoint returned HTML instead of SSE stream.');
      }

      if (!response.body) {
        throw new Error('Failed to connect to follow-up stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch (err) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Follow-up error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: 'Sorry, I encountered an error answering your question. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow-xs">
            <Bot className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              Concept Tutor Q&A
            </h3>
            <p className="text-[11px] text-slate-500">Tailored to {difficulty} ({tone})</p>
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

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
              msg.role === 'user'
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-slate-100 text-indigo-700 border border-slate-200'
            }`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#1A1A1A] text-white rounded-tr-xs shadow-2xs'
                : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="markdown-body text-xs">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content || (isStreaming ? 'Thinking...' : '')}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-100 bg-slate-50/80 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a follow-up question about this concept..."
            disabled={isStreaming}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isStreaming}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A1A1A] text-white hover:bg-black disabled:opacity-40 transition-colors shrink-0 shadow-2xs"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>

    </div>
  );
};
