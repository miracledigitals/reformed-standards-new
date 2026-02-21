
import React, { useState, useEffect } from 'react';
import { getGeminiClient } from '../services/geminiService';
import { LoadingState } from '../types';
import { Search, Share2, Loader2, Sparkles, Book, Scroll, ChevronRight, Bookmark, Copy, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { commonMarkdownComponents } from './MarkdownComponents';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';
import { ScriptureModal } from './ScriptureModal';

interface CrossRefResult {
  document: string;
  reference: string;
  context: string;
}

export const CrossReferenceVisualizer: React.FC = () => {
  const [verse, setVerse] = useState('Romans 8:28');
  const [results, setResults] = useState<CrossRefResult[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modal state for viewing full context
  const [modalData, setModalData] = useState<{
    reference: string;
    text: string;
    type: 'scripture' | 'confession';
    loading: boolean
  } | null>(null);

  useEffect(() => {
    if (results.length > 0) {
      setIsSaved(isItemSaved(`crossref-${verse}`, 'cross-reference'));
    }
  }, [verse, results]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verse.trim()) return;

    setLoadingState(LoadingState.LOADING);
    setResults([]);

    try {
      const ai = getGeminiClient();
      const prompt = `
        Identify every major Reformed standard (WCF, WSC, WLC, Heidelberg, Belgic, Canons of Dort, 2nd Helvetic, 1689 LBCF, Institutes) that explicitly cites or is primarily grounded in the following Bible verse: "${verse}".
        
        Return a JSON array of objects with this structure:
        [
          {
            "document": "Document Name",
            "reference": "Specific Citation (e.g. Art 1, Q 2, 3.1.1)",
            "context": "15-word summary of how the verse is used here."
          }
        ]
        
        Use the John Allen 1813 translation for any 'Institutes' references found, verified against open-source directories (Project Gutenberg eBook #45001/64392 or equivalent public-domain sources).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          tools: [{ googleSearch: {} }],
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        }
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setResults(data);
      }
    } catch (error) {
      console.error("Cross-Reference Visualizer Error:", error);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleViewContext = async (res: CrossRefResult) => {
    const fullRef = `${res.document} ${res.reference}`;
    setModalData({ reference: fullRef, text: '', type: 'confession', loading: true });

    try {
      const ai = getGeminiClient();
      let prompt = "";
      let tools: any[] | undefined = [{ googleSearch: {} }];

      if (res.document.toLowerCase().includes("institutes")) {
        prompt = `Provide the verbatim text of Calvin's Institutes ${res.reference} using the John Allen Translation (1813). Use Google Search to verify against open-source directories (Project Gutenberg eBook #45001/64392 or equivalent public-domain sources). Output text only.`;
      } else {
        prompt = `Quote the full text of ${res.document} ${res.reference} verbatim. Use Google Search to verify accuracy. Include the Question if it is a Catechism.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          tools: tools,
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        }
      });

      setModalData({
        reference: fullRef,
        text: response.text || "Could not retrieve text.",
        type: 'confession',
        loading: false
      });
    } catch (error) {
      setModalData({
        reference: fullRef,
        text: "Error retrieving content.",
        type: 'confession',
        loading: false
      });
    }
  };

  const handleToggleSave = () => {
    const refId = `crossref-${verse}`;
    if (isSaved) {
      const items = getSavedItems();
      const item = items.find(i => i.refId === refId && i.type === 'cross-reference');
      if (item) removeItem(item.id);
      setIsSaved(false);
    } else {
      saveItem({
        type: 'cross-reference',
        refId: refId,
        title: `Cross-Ref: ${verse}`,
        subtitle: `${results.length} Citations Found`,
        content: JSON.stringify(results),
        userNotes: '',
        tags: ['Visualizer', 'Scripture', verse]
      });
      setIsSaved(true);
    }
  };

  const handleCopy = () => {
    const text = results.map(r => `${r.document} ${r.reference}: ${r.context}`).join('\n');
    navigator.clipboard.writeText(`Reformed Citations for ${verse}:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      {modalData && (
        <ScriptureModal
          reference={modalData.reference}
          text={modalData.text}
          type={modalData.type}
          isLoading={modalData.loading}
          onClose={() => setModalData(null)}
          onReferenceClick={(ref) => {
            const parts = ref.match(/^(.+?)\s+((?:Art\.?|Q\.?|Ch\.?|Head|Lord'?s Day|Canon|Section)[\s\S]*)$/i);
            if (parts) {
              handleViewContext({ document: parts[1].trim(), reference: parts[2].trim(), context: '' });
            } else {
              handleViewContext({ document: ref, reference: '', context: '' });
            }
          }}
        />
      )}

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-reformed-900 text-white rounded-xl mb-6 shadow-lg">
          <Share2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4">
          Scripture Cross-Reference Visualizer
        </h2>
        <p className="text-lg text-reformed-700 dark:text-reformed-200 max-w-2xl mx-auto font-serif">
          See how a specific Bible verse is utilized across the historic Reformed standards.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative group">
          <div className="relative flex items-center bg-white dark:bg-reformed-900 rounded-full shadow-lg border-2 border-transparent focus-within:border-reformed-400 transition-all">
            <div className="pl-6 text-reformed-400">
              <Book className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="Enter verse (e.g. Ephesians 2:8-9)..."
              className="w-full py-5 pl-4 pr-32 bg-transparent border-none focus:ring-0 text-lg font-serif text-reformed-900 dark:text-reformed-100 placeholder-reformed-300"
            />
            <button
              type="submit"
              disabled={loadingState === LoadingState.LOADING || !verse.trim()}
              className="absolute right-2 bg-reformed-800 hover:bg-reformed-700 text-white px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingState === LoadingState.LOADING ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Map It
            </button>
          </div>
        </form>
      </div>

      {loadingState === LoadingState.LOADING && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-reformed-100 dark:border-reformed-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-reformed-600 border-t-transparent rounded-full animate-spin"></div>
            <Share2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-reformed-600" />
          </div>
          <p className="text-reformed-500 font-serif italic">Searching for confessional citations...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-end gap-2 mb-6">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-reformed-800 text-white' : 'text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800'}`}
              title="Bookmark Map"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
              title="Copy Result"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <div className="flex justify-center mb-16 relative z-10">
              <div className="bg-reformed-900 text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-reformed-700 flex flex-col items-center">
                <span className="text-xs uppercase font-bold tracking-widest text-reformed-400 mb-1">Source Verse</span>
                <span className="text-2xl font-display font-bold">{verse}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {results.map((res, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-reformed-900 p-6 rounded-xl border border-reformed-200 dark:border-reformed-800 shadow-sm hover:shadow-xl hover:border-reformed-400 transition-all group flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Scroll className="w-4 h-4 text-reformed-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-reformed-500">{res.document}</span>
                    </div>
                    <span className="bg-reformed-100 dark:bg-reformed-800 text-reformed-800 dark:text-reformed-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      {res.reference}
                    </span>
                  </div>
                  <p className="text-sm font-serif text-reformed-700 dark:text-reformed-300 italic mb-4 flex-grow">
                    "{res.context}"
                  </p>
                  <button
                    onClick={() => handleViewContext(res)}
                    className="w-fit flex items-center text-[10px] font-bold text-reformed-400 uppercase tracking-widest hover:text-reformed-800 dark:hover:text-white transition-colors focus:outline-none"
                  >
                    View Context <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden lg:block absolute top-12 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="400" cy="50" r="10" fill="currentColor" className="text-reformed-900" />
                <line x1="400" y1="60" x2="150" y2="250" stroke="currentColor" strokeWidth="2" className="text-reformed-900" strokeDasharray="5,5" />
                <line x1="400" y1="60" x2="400" y2="250" stroke="currentColor" strokeWidth="2" className="text-reformed-900" strokeDasharray="5,5" />
                <line x1="400" y1="60" x2="650" y2="250" stroke="currentColor" strokeWidth="2" className="text-reformed-900" strokeDasharray="5,5" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
