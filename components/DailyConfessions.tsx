import React, { useEffect, useState, useCallback } from 'react';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import { AUGUSTINE_CONFESSIONS_SYSTEM_INSTRUCTION } from '../constants';
import ReactMarkdown from 'react-markdown';
import { Scroll, Calendar, Copy, RotateCcw, Bookmark, Check } from 'lucide-react';
import { commonMarkdownComponents } from './MarkdownComponents';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';

const CONFESSIONS_CHAPTERS = [
  { book: 'I', chapters: 18 },
  { book: 'II', chapters: 10 },
  { book: 'III', chapters: 12 },
  { book: 'IV', chapters: 16 },
  { book: 'V', chapters: 14 },
  { book: 'VI', chapters: 16 },
  { book: 'VII', chapters: 21 },
  { book: 'VIII', chapters: 12 },
  { book: 'IX', chapters: 13 },
  { book: 'X', chapters: 43 },
  { book: 'XI', chapters: 31 },
  { book: 'XII', chapters: 32 },
  { book: 'XIII', chapters: 39 }
];

const toRoman = (value: number) => {
  const numerals: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];
  let remaining = value;
  let result = '';
  for (const [num, roman] of numerals) {
    while (remaining >= num) {
      result += roman;
      remaining -= num;
    }
  }
  return result;
};

export const DailyConfessions: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [dateDisplay, setDateDisplay] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReading = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    const today = new Date();
    const dateKey = today.toLocaleDateString('en-CA');
    const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setDateDisplay(formattedDate);

    if (!forceRefresh) {
      const cached = localStorage.getItem(`augustine-${dateKey}`);
      if (cached && !cached.includes("System Error") && !cached.includes("Unable to")) {
        setContent(cached);
        setLoading(false);
        return;
      }
    } else {
      localStorage.removeItem(`augustine-${dateKey}`);
    }

    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const totalChapters = CONFESSIONS_CHAPTERS.reduce((sum, item) => sum + item.chapters, 0);
    let remaining = dayOfYear % totalChapters;
    let selectedBook = CONFESSIONS_CHAPTERS[0].book;
    let selectedChapterNumber = 1;

    for (const item of CONFESSIONS_CHAPTERS) {
      if (remaining < item.chapters) {
        selectedBook = item.book;
        selectedChapterNumber = remaining + 1;
        break;
      }
      remaining -= item.chapters;
    }

    const chapterRoman = toRoman(selectedChapterNumber);
    const currentTopic = `Augustine Confessions Book ${selectedBook} Chapter ${selectedChapterNumber}`;
    const currentReference = `BOOK ${selectedBook} · CHAPTER ${chapterRoman}`;
    setTopic(currentTopic);

    const prompt = `
        Provide the verbatim text for **${currentReference}** from Augustine's Confessions.
        
        TASK:
        1. Use the public-domain source text from Project Gutenberg eBook #3296 or an equivalent open-source directory.
        2. Output only the requested chapter, verbatim, and include the BOOK and CHAPTER headings as in the source.
        3. Do not add commentary or summaries.
      `;

    const ai = getGeminiClient();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt + " Use Google Search to verify the text.",
        config: {
          systemInstruction: AUGUSTINE_CONFESSIONS_SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 8192,
          tools: [{ googleSearch: {} }],
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        },
      });

      if (response.text) {
        setContent(response.text);
        localStorage.setItem(`augustine-${dateKey}`, response.text);
        setLoading(false);
        return;
      }
      throw new Error("Empty response from primary generation");
    } catch (error) {
      console.warn("Confessions reading generation failed", error);
      const message =
        error instanceof Error && error.message.includes('GEMINI_API_KEY')
          ? "### Confessions\n\nWe are currently unable to retrieve today's reading because the API key is not configured."
          : "### Confessions\n\nWe are currently unable to retrieve today's reading. Please try again.";
      setContent(message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateReading();
  }, [generateReading]);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const refId = `augustine-${today}`;
    setIsSaved(isItemSaved(refId, 'confession'));
  }, [dateDisplay, content]);

  const handleToggleSave = () => {
    const today = new Date().toLocaleDateString('en-CA');
    const refId = `augustine-${today}`;

    if (isSaved) {
      const items = getSavedItems();
      const item = items.find(i => i.refId === refId && i.type === 'confession');
      if (item) removeItem(item.id);
      setIsSaved(false);
    } else {
      saveItem({
        type: 'confession',
        refId: refId,
        title: `Augustine Confessions: ${dateDisplay}`,
        subtitle: topic,
        content: content,
        userNotes: '',
        tags: ['Daily', 'Confessions', 'Augustine']
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
          onClick={() => generateReading(true)}
          className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
          title="Regenerate Reading"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-reformed-100 dark:bg-reformed-900/30 rounded-full mb-4 text-reformed-700 dark:text-reformed-300">
          <Scroll className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-2">
          Daily Augustine Confessions
        </h2>
        <div className="flex items-center justify-center text-reformed-600 dark:text-reformed-300 font-serif italic text-sm sm:text-base">
          <Calendar className="w-4 h-4 mr-2" />
          {dateDisplay}
        </div>
      </div>

      <div className="bg-white dark:bg-reformed-900 shadow-2xl rounded-lg border border-reformed-200 dark:border-reformed-800 overflow-hidden relative">
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

        <div className="bg-reformed-50 dark:bg-reformed-950 px-6 sm:px-8 py-4 border-t border-reformed-200 dark:border-reformed-800 flex justify-between items-center">
          <span className="text-xs text-reformed-500 dark:text-reformed-400 font-sans uppercase tracking-widest">
            Confessiones
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
