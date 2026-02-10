
import React, { useEffect, useState, useCallback } from 'react';
import { X, BookOpen, Scroll, Link, Loader2, ExternalLink, Globe, Languages, RotateCcw } from 'lucide-react';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { commonMarkdownComponents } from './MarkdownComponents';
import { BIBLE_APPS } from '../services/bibleLinkService';
import { BIBLE_BOOKS } from '../constants';

interface ReferenceModalProps {
  reference: string;
  text: string;
  type: 'scripture' | 'confession';
  version?: string;
  isLoading: boolean;
  onClose: () => void;
  onReferenceClick?: (reference: string) => void;
}

type ModalTab = 'translation' | 'interlinear' | 'latin';

export const ScriptureModal: React.FC<ReferenceModalProps> = ({ reference, text, type, version, isLoading, onClose, onReferenceClick }) => {
  const [crossRefs, setCrossRefs] = useState<string[]>([]);
  const [refsLoading, setRefsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('translation');
  const [interlinearText, setInterlinearText] = useState<string | null>(null);
  const [latinText, setLatinText] = useState<string | null>(null);
  const [tabLoading, setTabLoading] = useState(false);

  // Helper to determine if OT or NT
  const getTestament = useCallback(() => {
    // Handle multi-word book names like "1 Corinthians 13:4", "Song of Solomon 2:1"
    const match = reference.match(/^(\d?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s/);
    const bookName = match ? match[1].trim() : reference.split(' ')[0];
    const book = BIBLE_BOOKS.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    return book?.testament || 'New';
  }, [reference]);

  useEffect(() => {
    // Only fetch cross-refs for Confessions, not Scripture (unless requested)
    if (type === 'confession' && !isLoading && text && !text.includes("Unable to")) {
      const fetchCrossRefs = async () => {
        setRefsLoading(true);
        setCrossRefs([]);
        try {
          const ai = getGeminiClient();
          const prompt = `
            Analyze the following confession reference: "${reference}".
            Based on its topic, provide 3-5 distinct theological cross-references from OTHER Reformed Standards (e.g., if WCF, link to Heidelberg/Belgic/2nd Helvetic).
            
            Return ONLY a JSON array of strings formatted as valid citations (e.g., ["Heidelberg Q. 27", "Belgic Confession Art. 13", "Canons of Dort Head 1"]).
            Do not include any other text.
          `;

          const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              safetySettings: [...DEFAULT_SAFETY_SETTINGS]
            }
          });

          if (result.text) {
            const data = JSON.parse(result.text);
            if (Array.isArray(data)) {
              setCrossRefs(data);
            }
          }
        } catch (e) {
          console.error("Failed to fetch cross refs", e);
        } finally {
          setRefsLoading(false);
        }
      };

      fetchCrossRefs();
    }
  }, [reference, type, isLoading, text]);

  const fetchTabContent = async (tab: ModalTab) => {
    if (tab === 'translation') {
      setActiveTab(tab);
      return;
    }

    if ((tab === 'interlinear' && interlinearText) || (tab === 'latin' && latinText)) {
      setActiveTab(tab);
      return;
    }

    setTabLoading(true);
    setActiveTab(tab);

    try {
      const ai = getGeminiClient();
      let prompt = "";
      const testament = getTestament();

      if (tab === 'interlinear') {
        const lang = testament === 'Old' ? 'Hebrew' : 'Greek';
        prompt = `Provide a precise Interlinear translation for ${reference}. 
            Format as a Markdown table with the following columns: ${lang} Word, Transliteration, English Gloss, Strong's Concordance. 
            Do not include introductory text. Use internal scholarly knowledge.`;
      } else if (tab === 'latin') {
        prompt = `Provide the verbatim Latin text for ${reference} from the Clementine Vulgate. Return only the verse text.`;
      }

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        }
      });

      if (tab === 'interlinear') setInterlinearText(result.text || "No data.");
      if (tab === 'latin') setLatinText(result.text || "No data.");
    } catch (e) {
      console.error("Tab fetch failed", e);
    } finally {
      setTabLoading(false);
    }
  };

  const activeContent = activeTab === 'translation' ? text : activeTab === 'interlinear' ? interlinearText : latinText;

  // Language Icon Components
  const AlephIcon = () => <span className="font-serif text-xl leading-none">א</span>;
  const OmegaIcon = () => <span className="font-serif text-xl leading-none">Ω</span>;
  const LatinIcon = () => <span className="font-display text-xl leading-none font-bold">L</span>;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-reformed-900 rounded-xl shadow-2xl w-full max-w-2xl border border-reformed-200 dark:border-reformed-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <div className="bg-reformed-900 dark:bg-black px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center text-reformed-50 space-x-2">
              {type === 'scripture' ? <BookOpen className="w-5 h-5" /> : <Scroll className="w-5 h-5" />}
              <span className="font-display font-bold tracking-wide text-lg">{reference}</span>
            </div>
            {version && type === 'scripture' && (
              <span className="text-xs text-reformed-300 font-sans ml-7 tracking-wider">{activeTab === 'translation' ? version : activeTab === 'interlinear' ? 'Interlinear Analysis' : 'Latin Vulgate'}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-reformed-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Multilingual Tabs (Only for Scripture) */}
        {type === 'scripture' && !isLoading && (
          <div className="flex border-b border-reformed-200 dark:border-reformed-800 bg-white dark:bg-reformed-900 transition-colors">
            <button
              onClick={() => fetchTabContent('translation')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'translation' ? 'border-reformed-800 text-reformed-800 dark:border-white dark:text-white' : 'border-transparent text-reformed-400 hover:text-reformed-600 dark:hover:text-reformed-200'}`}
            >
              <Globe className="w-4 h-4" />
              Translation
            </button>
            <button
              onClick={() => fetchTabContent('interlinear')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'interlinear' ? 'border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-400' : 'border-transparent text-reformed-400 hover:text-amber-600'}`}
            >
              {getTestament() === 'Old' ? <AlephIcon /> : <OmegaIcon />}
              {getTestament() === 'Old' ? 'Hebrew' : 'Greek'}
            </button>
            <button
              onClick={() => fetchTabContent('latin')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'latin' ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-reformed-400 hover:text-indigo-600'}`}
            >
              <LatinIcon />
              Latin
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8 bg-reformed-50 dark:bg-reformed-950 flex-1 overflow-y-auto transition-colors custom-scrollbar">
          {(isLoading || tabLoading) ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-8 h-8 border-2 border-reformed-400 border-t-reformed-800 dark:border-t-reformed-200 rounded-full animate-spin"></div>
              <span className="text-xs text-reformed-500 dark:text-reformed-400 font-sans uppercase tracking-wider">
                {isLoading ? 'Consulting Text...' : activeTab === 'interlinear' ? 'Parsing Original Languages...' : 'Retrieving Vulgate...'}
              </span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <ReactMarkdown components={commonMarkdownComponents}>
                  {activeContent || "No data available."}
                </ReactMarkdown>
              </div>

              {/* External App Integrations */}
              {type === 'scripture' && activeTab === 'translation' && (
                <div className="border-t border-reformed-200 dark:border-reformed-800 pt-6 mt-8 mb-4">
                  <div className="flex items-center text-xs font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-wider mb-4">
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    Study in External App
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BIBLE_APPS.map(app => (
                      <a
                        key={app.id}
                        href={app.generateUrl(reference)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-reformed-800 border border-reformed-200 dark:border-reformed-700 rounded-lg text-xs font-bold transition-all hover:shadow-md hover:border-reformed-400"
                        style={{ color: app.color }}
                      >
                        {app.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {type === 'confession' && !text.includes("Unable to") && (
                <div className="border-t border-reformed-200 dark:border-reformed-800 pt-6 mt-8">
                  <div className="flex items-center text-xs font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-wider mb-4">
                    <Link className="w-3 h-3 mr-1.5" />
                    Related Articles
                  </div>
                  {refsLoading ? (
                    <div className="flex items-center text-xs text-reformed-400 dark:text-reformed-500 italic">
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Finding theological connections...
                    </div>
                  ) : crossRefs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {crossRefs.map((ref, idx) => (
                        <button
                          key={idx}
                          onClick={() => onReferenceClick && onReferenceClick(ref)}
                          className="px-3 py-1.5 bg-white dark:bg-reformed-900 border border-reformed-200 dark:border-reformed-700 rounded-md text-xs text-reformed-700 dark:text-reformed-300 hover:bg-reformed-100 dark:hover:bg-reformed-800 hover:text-reformed-900 dark:hover:text-white transition-colors text-left font-medium"
                          title={`Read ${ref}`}
                        >
                          {ref}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-reformed-400 italic">No direct cross-references found.</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-reformed-900 px-6 py-3 border-t border-reformed-200 dark:border-reformed-800 text-center transition-colors shrink-0">
          <p className="text-[10px] text-reformed-400 dark:text-reformed-500 font-sans uppercase tracking-widest">
            {type === 'scripture' ? 'Sacred Text Analysis' : 'Confessional Standard'}
          </p>
        </div>
      </div>
    </div>
  );
};
