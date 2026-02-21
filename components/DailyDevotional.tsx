
import React, { useEffect, useState, useCallback } from 'react';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import { DEVOTIONAL_SYSTEM_INSTRUCTION } from '../constants';
import ReactMarkdown from 'react-markdown';
import { Sun, Calendar, Copy, RotateCcw, Bookmark, Check } from 'lucide-react';
import { commonMarkdownComponents } from './MarkdownComponents';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';

export const DailyDevotional: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [dateDisplay, setDateDisplay] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDevotional = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    const today = new Date();
    // Use local timezone date string (YYYY-MM-DD) to prevent UTC mismatch issues
    const dateKey = today.toLocaleDateString('en-CA');
    const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setDateDisplay(formattedDate);

    // Check Local Storage first if not forcing refresh
    if (!forceRefresh) {
      const cachedDevotional = localStorage.getItem(`devotional-${dateKey}`);
      if (cachedDevotional && !cachedDevotional.includes("System Error") && !cachedDevotional.includes("Unable to")) {
        setContent(cachedDevotional);
        setLoading(false);
        return;
      }
    } else {
      localStorage.removeItem(`devotional-${dateKey}`);
    }

    // Calculate Day of Year for deterministic selection
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Selection Logic:
    let currentTopic = "";
    const remainder = dayOfYear % 3;

    if (remainder === 0) {
      const qNum = (dayOfYear % 129) + 1;
      currentTopic = `Heidelberg Catechism Question ${qNum}`;
    } else if (remainder === 1) {
      const qNum = (dayOfYear % 107) + 1;
      currentTopic = `Westminster Shorter Catechism Question ${qNum}`;
    } else {
      const qNum = (dayOfYear % 196) + 1;
      currentTopic = `Westminster Larger Catechism Question ${qNum}`;
    }
    setTopic(currentTopic);

    const prompt = `
        Generate a daily devotional for ${formattedDate}. 
        The anchor text is **${currentTopic}**. 
        
        TASK:
        1. Quote the exact verbatim text of ${currentTopic}.
        2. Ensure the text matches the original historic document exactly.
        3. Explicitly display the title (e.g., "**${currentTopic}**") before the quote.
        4. Follow the system instruction for structure.
      `;

    const ai = getGeminiClient();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt + " Use Google Search to verify the text.",
        config: {
          systemInstruction: DEVOTIONAL_SYSTEM_INSTRUCTION,
          temperature: 0.4,
          maxOutputTokens: 8192,
          tools: [{ googleSearch: {} }],
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        },
      });

      if (response.text) {
        setContent(response.text);
        localStorage.setItem(`devotional-${dateKey}`, response.text);
        setLoading(false);
        return;
      }
      throw new Error("Empty response from primary generation");

    } catch (error) {
      console.warn("Devotional generation failed, attempting fallback...", error);
      // Fallback logic could go here...
      setContent("### Grace and Peace\n\nWe are currently unable to retrieve today's devotional due to a connection issue. Please consult Scripture directly: *The Lord is my shepherd; I shall not want.* (Psalm 23:1)");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateDevotional();
  }, [generateDevotional]);

  useEffect(() => {
    // Check if saved
    const today = new Date().toLocaleDateString('en-CA');
    const refId = `devotional-${today}`;
    setIsSaved(isItemSaved(refId, 'devotional'));
  }, [dateDisplay, content]);

  const handleToggleSave = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const refId = `devotional-${today}`;

    if (isSaved) {
      const items = getSavedItems();
      const item = items.find(i => i.refId === refId && i.type === 'devotional');
      if (item) removeItem(item.id);
      setIsSaved(false);
    } else {
      saveItem({
        type: 'devotional',
        refId: refId,
        title: `Devotional: ${dateDisplay}`,
        subtitle: topic,
        content: content,
        userNotes: '',
        tags: ['Daily', 'Devotional']
      });
      setIsSaved(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${content}\n\nRead more at Reformed Standards.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-[80vh] flex flex-col justify-center relative">
      <div className="absolute top-4 right-4 sm:top-12 sm:right-0">
        <button
          onClick={() => generateDevotional(true)}
          className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
          title="Regenerate Devotional"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4 text-amber-700 dark:text-amber-400">
          <Sun className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-2">
          Daily Devotional
        </h2>
        <div className="flex items-center justify-center text-reformed-600 dark:text-reformed-300 font-serif italic text-sm sm:text-base">
          <Calendar className="w-4 h-4 mr-2" />
          {dateDisplay}
        </div>
      </div>

      <div className="bg-white dark:bg-reformed-900 shadow-2xl rounded-lg border border-reformed-200 dark:border-reformed-800 overflow-hidden relative">
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-to-r from-reformed-400 via-reformed-600 to-reformed-400"></div>

        <div className="p-6 sm:p-12">
          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-8 bg-reformed-200 dark:bg-reformed-800 rounded w-3/4 mx-auto"></div>
              <div className="space-y-3">
                <div className="h-4 bg-reformed-100 dark:bg-reformed-800 rounded"></div>
                <div className="h-4 bg-reformed-100 dark:bg-reformed-800 rounded"></div>
                <div className="h-4 bg-reformed-100 dark:bg-reformed-800 rounded w-5/6"></div>
              </div>
              <div className="h-24 bg-reformed-100 dark:bg-reformed-800 rounded opacity-50"></div>
              <div className="h-20 bg-reformed-100 dark:bg-reformed-800 rounded opacity-50"></div>
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
        <div className="bg-reformed-50 dark:bg-reformed-950 px-6 sm:px-8 py-4 border-t border-reformed-200 dark:border-reformed-800 flex justify-between items-center">
          <span className="text-xs text-reformed-500 dark:text-reformed-400 font-sans uppercase tracking-widest">
            Sola Gratia
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-full transition-colors ${isSaved
                  ? 'bg-reformed-800 text-white hover:bg-reformed-700'
                  : 'text-reformed-500 hover:text-reformed-900 hover:bg-reformed-200 dark:text-reformed-400 dark:hover:text-white dark:hover:bg-reformed-800'
                }`}
              title={isSaved ? "Remove Bookmark" : "Bookmark this"}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 text-reformed-500 hover:text-reformed-900 hover:bg-reformed-200 dark:text-reformed-400 dark:hover:text-white dark:hover:bg-reformed-800 rounded-full transition-colors"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
