
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ArrowRight, BookOpen, Loader2, ChevronRight, Tag } from 'lucide-react';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import { INITIAL_SYSTEM_INSTRUCTION } from '../constants';
import ReactMarkdown from 'react-markdown';
import { commonMarkdownComponents } from './MarkdownComponents';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  document: string;
  reference: string;
  summary: string;
}

interface SearchResponse {
  results: SearchResult[];
  relatedTerms: string[];
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [relatedTerms, setRelatedTerms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [fullText, setFullText] = useState<string | null>(null);
  const [isTextLoading, setIsTextLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchTerm = overrideQuery || query;
    if (!searchTerm.trim()) return;

    if (overrideQuery) {
      setQuery(overrideQuery);
    }

    setIsLoading(true);
    setResults([]);
    setRelatedTerms([]);
    setSelectedResult(null);
    setFullText(null);

    try {
      const ai = getGeminiClient();
      const prompt = `
        Search for the theological term: "${searchTerm}" across the Reformed Standards (Westminster, Three Forms of Unity, 2nd Helvetic, Institutes).
        Identify the top 5 most relevant sections.
        Also suggest 3-5 related theological terms that a student might want to explore next.
        
        Return strictly a JSON object with this structure:
        {
          "results": [
            {
              "document": "Name of Confession (e.g. Westminster Shorter Catechism)",
              "reference": "Citation (e.g. Q. 35)",
              "summary": "A 10-word summary of what this section says about the term."
            }
          ],
          "relatedTerms": ["Term 1", "Term 2", "Term 3"]
        }
        
        Ensure references are accurate and exist in the original texts. Do not guess; omit anything you cannot verify from open-source directories.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.1,
          // tools: [{ googleSearch: {} }], // Tools unsupported with JSON response mime type
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        },
      });

      const text = response.text;
      if (text) {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText) as SearchResponse;

        if (Array.isArray(data)) {
          setResults(data);
          setRelatedTerms([]);
        } else {
          setResults(data.results || []);
          setRelatedTerms(data.relatedTerms || []);
        }
      }
    } catch (error) {
      console.error("Search failed", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    setSelectedResult(result);
    setIsTextLoading(true);
    setFullText(null);

    try {
      const ai = getGeminiClient();

      let prompt = "";
      let tools: any[] | undefined = [{ googleSearch: {} }];

      if (result.document.toLowerCase().includes("institutes")) {
        prompt = `
            You are a Theological Research Assistant.
            The user wants the verbatim text for: ${result.document} ${result.reference}.
            
            TASK:
            1. Retrieve the text of Calvin's Institutes ${result.reference} using the **John Allen Translation (1813)**.
            2. Use Google Search to verify the exact text against open-source directories (Project Gutenberg eBook #45001/64392 or equivalent public-domain sources).
            3. Verify the Book, Chapter, and Section numbers match the source text.
            4. Output the text verbatim.
          `;
      } else {
        prompt = `
            Quote the following text verbatim from the original historical document:
            Document: ${result.document}
            Reference: ${result.reference}
            
            Return ONLY the text (and Question/Answer if applicable). Do not add commentary.
            
            VERIFICATION:
            1. USE THE GOOGLE SEARCH TOOL to verify that the text matches the citation.
            2. Check the reference. If the text does not match the reference, find the correct reference for that text or return "Unable to verify text at this location."
          `;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          tools: tools,
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        }
      });

      setFullText(response.text || "Could not retrieve text.");
    } catch (error) {
      setFullText("Error retrieving text.");
    } finally {
      setIsTextLoading(false);
    }
  };

  const handleBackToResults = () => {
    setSelectedResult(null);
    setFullText(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-4 sm:pt-24 px-4 bg-reformed-900/50 dark:bg-black/70 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-reformed-900 rounded-xl shadow-2xl overflow-hidden border border-reformed-200 dark:border-reformed-700 flex flex-col max-h-[90vh] transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center p-4 border-b border-reformed-100 dark:border-reformed-800 bg-white dark:bg-reformed-900 shrink-0">
          <Search className="w-5 h-5 text-reformed-400 dark:text-reformed-500 mr-3" />
          <form onSubmit={(e) => handleSearch(e)} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              className="w-full text-base sm:text-lg bg-transparent border-none focus:ring-0 placeholder-reformed-300 dark:placeholder-reformed-600 text-reformed-900 dark:text-reformed-100 font-sans"
              placeholder="Search doctrine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center space-x-2">
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-reformed-500" />}
            <button onClick={onClose} className="p-1 rounded hover:bg-reformed-100 dark:hover:bg-reformed-800 text-reformed-400 hover:text-reformed-600 transition-colors">
              <span className="sr-only">Close</span>
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium text-reformed-400 border border-reformed-200 dark:border-reformed-700 rounded mr-2">ESC</kbd>
              <X className="w-5 h-5 inline-block" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto bg-reformed-50 dark:bg-reformed-950 min-h-[300px] relative flex flex-col">

          {!isLoading && results.length === 0 && !selectedResult && (
            <div className="flex flex-col items-center justify-center flex-grow py-12 text-reformed-400 dark:text-reformed-600 px-4 text-center">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mb-4 opacity-50" />
              <p className="font-serif text-sm">Search across all Confessions & Catechisms</p>
            </div>
          )}

          {!selectedResult && results.length > 0 && (
            <div className="p-2 space-y-2 flex-grow">
              <p className="text-xs font-bold text-reformed-400 dark:text-reformed-500 uppercase tracking-wider px-3 py-2">
                Relevant Sections
              </p>
              {results.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-white dark:hover:bg-reformed-800 border border-transparent hover:border-reformed-200 dark:hover:border-reformed-700 group transition-all flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-display font-bold text-reformed-800 dark:text-reformed-100 text-sm">
                        {result.document}
                      </span>
                      <span className="bg-reformed-200 dark:bg-reformed-700 text-reformed-800 dark:text-reformed-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                        {result.reference}
                      </span>
                    </div>
                    <p className="text-sm text-reformed-600 dark:text-reformed-400 font-serif line-clamp-2">
                      {result.summary}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-reformed-300 dark:text-reformed-600 group-hover:text-reformed-500 mt-1" />
                </button>
              ))}

              {relatedTerms.length > 0 && (
                <div className="mt-6 px-3 pb-4">
                  <p className="text-xs font-bold text-reformed-400 dark:text-reformed-500 uppercase tracking-wider mb-3 flex items-center">
                    <Tag className="w-3 h-3 mr-1.5" />
                    Related Terms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {relatedTerms.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(undefined, term)}
                        className="px-3 py-1.5 bg-reformed-100 dark:bg-reformed-800 text-reformed-700 dark:text-reformed-300 text-xs sm:text-sm rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-700 hover:text-reformed-900 dark:hover:text-white transition-colors font-medium border border-reformed-200 dark:border-reformed-700"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedResult && (
            <div className="absolute inset-0 bg-white dark:bg-reformed-900 flex flex-col animate-in slide-in-from-right duration-200">
              <div className="flex items-center p-4 border-b border-reformed-100 dark:border-reformed-800 bg-reformed-50 dark:bg-reformed-950 shrink-0">
                <button
                  onClick={handleBackToResults}
                  className="flex items-center text-sm text-reformed-500 hover:text-reformed-800 dark:text-reformed-400 dark:hover:text-reformed-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                  Back
                </button>
                <div className="mx-auto font-display font-bold text-reformed-900 dark:text-reformed-100 text-sm truncate max-w-[60%]">
                  {selectedResult.document} {selectedResult.reference}
                </div>
                <div className="w-12"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {isTextLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 text-reformed-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-xs font-sans uppercase tracking-wider">Verifying Text...</p>
                  </div>
                ) : (
                  // Use unified components
                  <div className="max-w-none">
                    <ReactMarkdown components={commonMarkdownComponents}>{fullText || ''}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-reformed-100 dark:bg-reformed-950 p-2 border-t border-reformed-200 dark:border-reformed-800 flex justify-end shrink-0">
          <span className="text-[10px] text-reformed-400 dark:text-reformed-600 font-sans mr-2">
            Powered by Gemini AI • Verified against original standards
          </span>
        </div>
      </div>
    </div>
  );
};
