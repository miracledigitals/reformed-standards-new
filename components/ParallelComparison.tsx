
import React, { useState, useEffect } from 'react';
import { CONFESSIONS } from '../constants';
import { Confession, LoadingState } from '../types';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
// Added ChevronDown to imports to fix "Cannot find name 'ChevronDown'" errors
import { GitCompare, ArrowRight, Loader2, Sparkles, BookOpen, Scroll, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { commonMarkdownComponents } from './MarkdownComponents';

export const ParallelComparison: React.FC = () => {
  const [doc1Id, setDoc1Id] = useState<string>(CONFESSIONS[0].id);
  const [doc2Id, setDoc2Id] = useState<string>(CONFESSIONS[1].id);
  const [topic, setTopic] = useState<string>('The Lord\'s Supper');
  const [comparison, setComparison] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);

  const doc1 = CONFESSIONS.find(c => c.id === doc1Id);
  const doc2 = CONFESSIONS.find(c => c.id === doc2Id);

  const handleCompare = async () => {
    if (!doc1 || !doc2 || !topic.trim()) return;

    setLoadingState(LoadingState.LOADING);
    setComparison(null);

    try {
      const ai = getGeminiClient();
      const prompt = `
        Perform a high-level theological comparison between two Reformed standards on a specific topic.
        
        Document A: ${doc1.title} (${doc1.author}, ${doc1.date})
        Document B: ${doc2.title} (${doc2.author}, ${doc2.date})
        Topic: ${topic}

        Instructions:
        1. Summarize how each document addresses the topic.
        2. Provide verbatim snippets if possible (mark them clearly).
        3. Highlight the primary theological nuances or differences in emphasis.
        4. Note any historical context that explains why they might differ (e.g. Anglican vs Continental context).
        5. Conclude with a summary of their common Reformed core.

        Format: Professional, academic, and formatted in clear Markdown. Use the John Allen 1813 translation for any 'Institutes' references.
      `;

      const safetySettings = [...DEFAULT_SAFETY_SETTINGS];

      let text: string | undefined;

      // Attempt 1: With Search Grounding
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt + " Use Google Search to verify citations.",
          config: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            tools: [{ googleSearch: {} }],
            safetySettings: safetySettings
          }
        });
        text = response.text;
      } catch (e) {
        console.warn("Primary comparison attempt failed, trying fallback...", e);
      }

      // Attempt 2: Fallback without Search
      if (!text) {
        console.log("Retrying comparison without search tools...");
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            safetySettings: safetySettings
          }
        });
        text = response.text;
      }

      setComparison(text || "Comparison failed. Please try again.");
    } catch (error) {
      console.error(error);
      setComparison("An error occurred during the comparison.");
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-reformed-800 text-white rounded-xl mb-6 shadow-lg">
          <GitCompare className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4">
          Parallel Comparison Engine
        </h2>
        <p className="text-lg text-reformed-700 dark:text-reformed-200 max-w-2xl mx-auto font-serif">
          Analyze theological nuances between different Reformed standards side-by-side.
        </p>
      </div>

      <div className="bg-white dark:bg-reformed-900 rounded-2xl shadow-xl border border-reformed-200 dark:border-reformed-800 p-6 sm:p-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Document 1 Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-reformed-500 uppercase tracking-widest">Document A</label>
            <div className="relative">
              <select
                value={doc1Id}
                onChange={(e) => setDoc1Id(e.target.value)}
                className="w-full bg-reformed-50 dark:bg-reformed-800 border-2 border-reformed-100 dark:border-reformed-700 rounded-xl py-3 px-4 text-reformed-900 dark:text-reformed-100 focus:outline-none focus:border-reformed-500 appearance-none transition-colors"
              >
                {CONFESSIONS.map(c => <option key={c.id} value={c.id}>{c.shortTitle}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-reformed-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Document 2 Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-reformed-500 uppercase tracking-widest">Document B</label>
            <div className="relative">
              <select
                value={doc2Id}
                onChange={(e) => setDoc2Id(e.target.value)}
                className="w-full bg-reformed-50 dark:bg-reformed-800 border-2 border-reformed-100 dark:border-reformed-700 rounded-xl py-3 px-4 text-reformed-900 dark:text-reformed-100 focus:outline-none focus:border-reformed-500 appearance-none transition-colors"
              >
                {CONFESSIONS.map(c => <option key={c.id} value={c.id}>{c.shortTitle}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-reformed-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-3 mb-10">
          <label className="block text-sm font-bold text-reformed-500 uppercase tracking-widest">Comparative Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a doctrine or topic (e.g. Justification, Civil Magistrate...)"
            className="w-full bg-reformed-50 dark:bg-reformed-800 border-2 border-reformed-100 dark:border-reformed-700 rounded-xl py-3 px-4 text-reformed-900 dark:text-reformed-100 focus:outline-none focus:border-reformed-500 transition-colors"
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loadingState !== LoadingState.IDLE || !topic.trim()}
          className="w-full bg-reformed-800 hover:bg-reformed-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 shadow-lg"
        >
          {loadingState === LoadingState.LOADING ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Parallel Analysis...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Comparison
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {comparison && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white dark:bg-reformed-900 rounded-2xl shadow-2xl border border-reformed-200 dark:border-reformed-800 overflow-hidden">
          <div className="bg-reformed-50 dark:bg-black/20 p-6 border-b border-reformed-100 dark:border-reformed-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scroll className="w-5 h-5 text-reformed-500" />
              <h3 className="font-display font-bold text-reformed-900 dark:text-reformed-100 uppercase tracking-wider text-sm">
                Theological Comparison: {topic}
              </h3>
            </div>
            <span className="text-[10px] font-sans text-reformed-400 uppercase tracking-widest font-bold">
              AI Verified Analysis
            </span>
          </div>
          <div className="p-8 sm:p-12">
            <div className="prose prose-reformed dark:prose-invert max-w-none">
              <ReactMarkdown components={commonMarkdownComponents}>
                {comparison}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
