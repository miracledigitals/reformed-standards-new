
import React, { useEffect, useState, useCallback } from 'react';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import { STUDY_SYSTEM_INSTRUCTION, THEOLOGICAL_TOPICS } from '../constants';
import ReactMarkdown from 'react-markdown';
import { GraduationCap, Calendar, RotateCcw, BookOpen, Scroll, PenTool, Bookmark, Check, Copy } from 'lucide-react';
import { commonMarkdownComponents } from './MarkdownComponents';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';

export const TheologicalStudy: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [topic, setTopic] = useState<string>('');
  const [dateDisplay, setDateDisplay] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateStudy = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    const today = new Date();
    // Use local timezone date string (YYYY-MM-DD)
    const dateKey = today.toLocaleDateString('en-CA');
    const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setDateDisplay(formattedDate);

    // Deterministic Topic Selection
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const topicIndex = dayOfYear % THEOLOGICAL_TOPICS.length;
    const selectedTopic = THEOLOGICAL_TOPICS[topicIndex];
    setTopic(selectedTopic);

    // Check Cache
    if (!forceRefresh) {
      const cachedStudy = localStorage.getItem(`study-${dateKey}`);
      if (cachedStudy && !cachedStudy.includes("System Error") && !cachedStudy.includes("Unable to")) {
        setContent(cachedStudy);
        setLoading(false);
        return;
      }
    } else {
      // Clear cache if forcing refresh
      localStorage.removeItem(`study-${dateKey}`);
    }

    const prompt = `
        Conduct a comprehensive theological analysis on the topic: "${selectedTopic}". 
        Compare and contrast how this is handled in the Westminster Standards, the Three Forms of Unity, and the Second Helvetic Confession.
        
        TASK:
        1. Quote the standards verbatim.
        2. Do not generalize; cite specific articles (e.g., "Belgic Confession Art. 12" vs "WCF 4.1").
      `;

    const ai = getGeminiClient();

    const safetySettings = [...DEFAULT_SAFETY_SETTINGS];

    let text: string | undefined;

    // Attempt 1: High quality with Search
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt + " Use Google Search to verify citations.",
        config: {
          systemInstruction: STUDY_SYSTEM_INSTRUCTION,
          temperature: 0.1, // High determinism for academic work
          maxOutputTokens: 8192,
          tools: [{ googleSearch: {} }],
          safetySettings: safetySettings
        },
      });
      text = response.text;
    } catch (e) {
      console.warn("Attempt 1 failed", e);
    }

    // Attempt 2: Fallback without Search
    if (!text) {
      console.log("Retrying study generation without search...");
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: STUDY_SYSTEM_INSTRUCTION,
            temperature: 0.3,
            maxOutputTokens: 8192,
            // No tools
            safetySettings: safetySettings
          },
        });
        text = response.text;
      } catch (e) {
        console.error("Attempt 2 failed", e);
      }
    }

    if (text) {
      setContent(text);
      localStorage.setItem(`study-${dateKey}`, text);
      setLoading(false);
    } else {
      setContent("### System Error\n\nWe are currently unable to retrieve the daily theological study. Please click the refresh button to try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateStudy();
  }, [generateStudy]);

  useEffect(() => {
    // Check if saved
    const today = new Date().toLocaleDateString('en-CA');
    const refId = `study-${today}`;
    setIsSaved(isItemSaved(refId, 'study'));
  }, [dateDisplay, content]);

  const handleToggleSave = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const refId = `study-${today}`;

    if (isSaved) {
      const items = getSavedItems();
      const item = items.find(i => i.refId === refId && i.type === 'study');
      if (item) removeItem(item.id);
      setIsSaved(false);
    } else {
      saveItem({
        type: 'study',
        refId: refId,
        title: `Theological Study: ${topic}`,
        subtitle: dateDisplay,
        content: content,
        userNotes: '',
        tags: ['Daily', 'Study', 'Systematic']
      });
      setIsSaved(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${content}\n\nGenerated by Reformed Standards App.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-start relative">
      <div className="absolute top-4 right-4 sm:top-12 sm:right-0">
        <button
          onClick={() => generateStudy(true)}
          className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
          title="Regenerate Study"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-reformed-800 dark:bg-reformed-700 rounded-lg mb-4 text-white shadow-lg">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-2">
          Daily Theological Study
        </h2>
        <div className="flex items-center justify-center text-reformed-600 dark:text-reformed-300 font-serif italic mb-4 text-sm sm:text-base">
          <Calendar className="w-4 h-4 mr-2" />
          {dateDisplay}
        </div>
        <div className="inline-block px-4 py-1.5 bg-reformed-100 dark:bg-reformed-800 text-reformed-800 dark:text-reformed-200 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase">
          Topic: {topic}
        </div>
      </div>

      <div className="bg-white dark:bg-reformed-900 shadow-2xl rounded-xl border border-reformed-200 dark:border-reformed-800 overflow-hidden relative flex flex-col">
        {/* Academic Header Bar */}
        <div className="bg-reformed-50 dark:bg-black/40 border-b border-reformed-200 dark:border-reformed-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 text-[10px] sm:text-xs font-bold text-reformed-400 uppercase tracking-widest">
            <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> Systematic</span>
            <span className="hidden sm:flex items-center"><Scroll className="w-3 h-3 mr-1" /> Confessional</span>
            <span className="flex items-center"><PenTool className="w-3 h-3 mr-1" /> Analytical</span>
          </div>
        </div>

        <div className="p-6 sm:p-12">
          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-10 bg-reformed-200 dark:bg-reformed-800 rounded w-1/2 mb-8"></div>

              <div className="space-y-4">
                <div className="h-6 bg-reformed-100 dark:bg-reformed-800 rounded w-1/4"></div>
                <div className="h-24 bg-reformed-50 dark:bg-reformed-800 rounded"></div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="h-6 bg-reformed-100 dark:bg-reformed-800 rounded w-1/3"></div>
                <div className="h-4 bg-reformed-50 dark:bg-reformed-800 rounded"></div>
                <div className="h-4 bg-reformed-50 dark:bg-reformed-800 rounded"></div>
                <div className="h-4 bg-reformed-50 dark:bg-reformed-800 rounded w-5/6"></div>
              </div>
            </div>
          ) : (
            <div className="max-w-none">
              <ReactMarkdown components={commonMarkdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-reformed-50 dark:bg-black/40 px-6 sm:px-8 py-4 border-t border-reformed-200 dark:border-reformed-800 flex justify-end gap-3">
          <button
            className={`flex items-center justify-center p-2 rounded-full transition-colors ${isSaved ? 'bg-reformed-800 text-white' : 'text-reformed-600 dark:text-reformed-300 hover:bg-reformed-200 dark:hover:bg-reformed-800'}`}
            onClick={handleToggleSave}
            title={isSaved ? "Saved to Bookmarks" : "Bookmark this"}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            className="flex items-center justify-center p-2 rounded-full text-reformed-600 dark:text-reformed-300 hover:bg-reformed-200 dark:hover:bg-reformed-800 transition-colors"
            onClick={handleCopy}
            title="Copy Text"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
