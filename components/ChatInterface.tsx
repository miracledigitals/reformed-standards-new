
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Confession, Message, LoadingState, BibleVersion, Hymn, GroundingMetadata } from '../types';
import { createChatSession, getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { Send, BookOpen, RotateCcw, Sparkles, X, Music, Globe, Check, Menu, ChevronLeft, Info, ChevronDown, ChevronUp, List, Scroll, Network } from 'lucide-react';
import { ScriptureModal } from './ScriptureModal';
import { getConfessionNavigation, NavItem, DOCTRINAL_CONNECTIONS } from '../constants';
import { commonMarkdownComponents } from './MarkdownComponents';

interface ChatInterfaceProps {
  activeConfession: Confession | null;
  activeBible: BibleVersion | null;
  activeHymn: Hymn | null;
  defaultBible: BibleVersion | null;
  initialPrompt?: string;
  onClose: () => void;
  onTermClick?: (term: string) => void;
  onViewConnections?: (term: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeConfession, activeBible, activeHymn, defaultBible, initialPrompt, onClose, onTermClick, onViewConnections }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [modalData, setModalData] = useState<{ reference: string; text: string; type: 'scripture' | 'confession'; version?: string; loading: boolean } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Navigation Items for the sidebar
  const navItems = useMemo(() => activeConfession ? getConfessionNavigation(activeConfession) : [], [activeConfession]);
  const hasSidebar = navItems.length > 0;

  // Extract titles from DOCTRINAL_CONNECTIONS for detection
  const connectionTitles = useMemo(() => {
    return Array.from(new Set(DOCTRINAL_CONNECTIONS.flatMap(c => [c.source.title, c.target.title])));
  }, []);

  // Initialize chat session
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();

      if (initialPrompt) {
        handleSendMessage(initialPrompt, true);
      } else if (activeConfession) {
        const initialPrompt = `I am studying the ${activeConfession.title}. Please provide a brief 2-sentence introduction to this document and its historical context.`;
        handleSendMessage(initialPrompt, true);
      } else if (activeBible) {
        const initialPrompt = `I am studying the ${activeBible.title}. Please provide a brief 2-sentence introduction to this translation and its significance to Reformed theology.`;
        handleSendMessage(initialPrompt, true);
      } else if (activeHymn) {
        const initialPrompt = `I want to study the hymn "${activeHymn.title}" by ${activeHymn.author}. Please cross-reference this with https://hymns.countedfaithful.org/numberListing.php if available, or provide the standard text. Provide the lyrics and a brief theological analysis.`;
        handleSendMessage(initialPrompt, true);
      } else {
        setMessages([{
          role: 'model',
          text: 'Greetings. I am ready to assist you with the Reformed Standards. You can ask about any doctrine, compare confessions, search for specific topics, or explore the hymnal.'
        }]);
      }
    } catch (error) {
      console.error("Failed to initialize chat", error);
      setMessages([{ role: 'model', text: 'Error: Could not connect to the knowledge base. Please check your API key configuration.', isError: true }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConfession, activeBible, activeHymn, initialPrompt]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getRetrievalPrompt = (reference: string, type: 'scripture' | 'confession') => {
    let prompt = "";

    if (type === 'scripture') {
      let versionPrompt = "";
      if (activeBible) {
        versionPrompt = `from the ${activeBible.title}`;
      } else if (defaultBible) {
        versionPrompt = `using the **${defaultBible.title}**`;
      } else {
        versionPrompt = "using the **English Standard Version (ESV)**. If ESV is not suitable, use NASB 95, Geneva Bible, or ASV";
      }

      prompt = `Quote ${reference} verbatim ${versionPrompt}. 
        1. Return ONLY the text of the verses.
        2. Do not include introductory phrases.
        3. Double check the verse numbers against the original text.`;
    } else {
      let extraInstruction = "";
      // Detect Institutes specifically
      if (reference.match(/Institutes|Inst/i)) {
        extraInstruction = ` 
            CONTEXT: The user is studying **John Calvin's Institutes of the Christian Religion**.
            SOURCE: You MUST use the **John Allen Translation (1813)** from open-source online directories (Project Gutenberg eBook #45001/64392 or equivalent public-domain sources).
            REFERENCE: ${reference} (Book.Chapter.Section).

            TASK:
            1. Provide the exact text for ${reference} from verified open-source directories.
            2. Adhere strictly to the John Allen translation. Do NOT paraphrase.
            3. Use Google Search to verify the exact section and wording against the open-source source.
            4. Output the text verbatim, including all sub-sections if a chapter is requested.`;
      } else {
        extraInstruction = `
            CRITICAL: You must USE THE GOOGLE SEARCH TOOL to verify that the text you are about to quote MATCHES the citation provided (e.g., WCF 10.1). 
            Search for the specific article or question to ensure verbatim accuracy.`;
      }

      // Add instruction for supplementary material (footnotes/remarks)
      extraInstruction += " IMPORTANT: If the source text contains footnotes, introductory remarks, or concluding remarks that are distinct from the main body, include them at the very end. Format this supplementary content as a blockquote starting with the bold label '**Supplementary Material:**'.";

      prompt = `Quote the full text of ${reference} verbatim.${extraInstruction} Do not add any introduction or conclusion. If it is a Catechism question, include the Answer.`;
    }
    return prompt;
  };

  const handleSendMessage = async (text: string, isSystemInit: boolean = false, displayText?: string) => {
    if (!text.trim() || !chatSessionRef.current) return;

    // UI shows displayText if present, otherwise text
    const messageToShow = displayText || text;
    const userMessage: Message = { role: 'user', text: messageToShow };

    if (!isSystemInit) {
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    }

    setLoadingState(LoadingState.STREAMING);

    try {
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      const result = await chatSessionRef.current.sendMessageStream({ message: text });

      let fullResponse = '';
      let finalMetadata: GroundingMetadata | undefined = undefined;

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullResponse += chunkText;

        if (c.candidates?.[0]?.groundingMetadata) {
          finalMetadata = c.candidates[0].groundingMetadata;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          // Create a new object for the last message to avoid direct mutation of the previous state object
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            text: fullResponse,
            groundingMetadata: finalMetadata
          };
          return newMessages;
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'model' && newMessages[newMessages.length - 1].text === '') {
          newMessages.pop();
        }
        return [...newMessages, { role: 'model', text: 'I encountered an error retrieving that information. Please try again.', isError: true }];
      });
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const fetchReferenceText = async (reference: string, type: 'scripture' | 'confession') => {
    const activeVersionName = activeBible?.title || defaultBible?.title || 'ESV / NASB 95 / Geneva';

    setModalData({ reference, text: '', type, version: type === 'scripture' ? activeVersionName : undefined, loading: true });
    // Close mobile sidebar if open
    setIsMobileSidebarOpen(false);

    try {
      const ai = getGeminiClient();
      const prompt = getRetrievalPrompt(reference, type);

      const tools = [{ googleSearch: {} }];

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          maxOutputTokens: 8192,
          temperature: 0.1, // Low temp for accuracy
          tools: tools,
          safetySettings: [...DEFAULT_SAFETY_SETTINGS]
        }
      });
      const text = response.text || "Could not retrieve text.";
      setModalData({ reference, text, type, version: type === 'scripture' ? activeVersionName : undefined, loading: false });
    } catch (error) {
      setModalData({ reference, text: "Error retrieving content.", type, loading: false });
    }
  };

  const handleTOCNavigation = (reference: string) => {
    setIsMobileSidebarOpen(false);
    const prompt = getRetrievalPrompt(reference, 'confession');
    handleSendMessage(prompt, false, reference);
  };

  // Custom Markdown components to parse scripture and confession refs
  const MarkdownComponents = useMemo(() => ({
    // Inherit the common styles but override p to handle interactive tokens
    ...commonMarkdownComponents,
    p: ({ children }: { children?: React.ReactNode }) => {
      // If children is null or undefined, return null
      if (!children) return null;

      return (
        <p className="font-serif text-base sm:text-lg leading-loose text-reformed-800 dark:text-reformed-300 mb-6 last:mb-0 text-justify">
          {React.Children.map(children, (child) => {
            // We only want to parse strings for regex replacement.
            // If it's an element (like <strong> or <em>), we leave it alone to preserve formatting.
            if (typeof child === 'string') {
              // Combined Global Regex for matching
              // Matches:
              // 1. Scripture (e.g. John 3:16, 1 Peter 1:3, Song of Solomon 1:1, Rom. 8:28, Gen. 1:1, I Cor. 1:1)
              // 2. Confessions (e.g. WCF 1.1, Institutes 3.3.1, Heidelberg Q.1)
              // 3. Theological Terms (e.g. Justification, Sanctification, etc.)
              // 4. Doctrinal Connection Titles

              // Refined Regex for Scripture:
              const scriptureRegex = /\b((?:1|2|3|I|II|III)(?:\.|\s)?)?([A-Za-z]+(?:\.|\s[A-Za-z]+)*)\s+(\d+):(\d+)(?:[–-](\d+))?\b/gi;

              // Refined Regex for Confessions
              const confessionRegex = /\b(WCF|WSC|WLC|Heidelberg|HC|Belgic|BC|Canons of Dort|CD|Second Helvetic|2HC|Formula Consensus Helvetica|Formula Helvetica|FCH|1689 LBCF|LBCF|Institutes|Inst|Westminster Confession(?: of Faith)?|Westminster Shorter Catechism|Westminster Larger Catechism|Heidelberg Catechism|Belgic Confession|Second Helvetic Confession|Formula Consensus Helvetica|The Scots Confession|Scots Confession|1689 Baptist Confession)\s+(?:Q\.?|Quest\.?|Question\s|Art\.?|Article\s|Ch\.?|Chap\.?|Chapter\s|Bk\.?|Book\s|Lord's Day\s|Head\s|Section\s|Sec\.?)?\s*\d+(?:[\.:]\d+)*(?:[\.:]\d+)?\b/gi;

              // Create a case-insensitive regex for connections
              const connectionsRegex = new RegExp(`\\b(${connectionTitles.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

              // Regex for Generic Theological Terms (fallback)
              const termsList = [
                "Justification", "Sanctification", "Election", "Predestination", "Atonement",
                "Covenant", "Trinity", "Providence", "Regeneration", "Adoption",
                "Perseverance", "Glorification", "Propitiation", "Expiation", "Imputation",
                "Sola Scriptura", "Sola Fide", "Sola Gratia", "Solus Christus", "Soli Deo Gloria",
                "Hypostatic Union", "Original Sin", "Total Depravity", "Unconditional Election",
                "Limited Atonement", "Irresistible Grace"
              ];
              const termsRegex = new RegExp(`\\b(${termsList.join('|')})\\b`, 'gi');

              // Combine into one regex for tokenizing
              // Order matters for matching precedence
              const combinedRegex = new RegExp(`(${scriptureRegex.source})|(${confessionRegex.source})|(${connectionsRegex.source})|(${termsRegex.source})`, 'gi');

              const matches = [...child.matchAll(combinedRegex)];

              if (matches.length === 0) return child;

              const elements: React.ReactNode[] = [];
              let lastIndex = 0;

              matches.forEach((match, i) => {
                // Add text before the match
                if (match.index! > lastIndex) {
                  elements.push(child.substring(lastIndex, match.index));
                }

                const ref = match[0];
                // Determine type based on which group matched.
                const isScripture = scriptureRegex.test(ref);
                const isConfession = !isScripture && /\b(WCF|WSC|WLC|Heidelberg|HC|Belgic|BC|Canons of Dort|CD|Second Helvetic|2HC|Formula Consensus Helvetica|Formula Helvetica|FCH|1689 LBCF|LBCF|Institutes|Inst|Westminster Confession|Westminster Shorter|Westminster Larger|Belgic|Second Helvetic|Scots Confession|1689 Baptist)/i.test(ref);

                // Check for connections
                // We need to match exactly against the titles list to be sure, using the same regex logic
                const isConnection = !isScripture && !isConfession && connectionsRegex.test(ref);

                const isTerm = !isScripture && !isConfession && !isConnection && termsRegex.test(ref);

                if (isConnection && onViewConnections) {
                  elements.push(
                    <button
                      key={`${i}-${ref}`}
                      onClick={() => onViewConnections(ref)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors align-baseline"
                      title="View Doctrinal Connections"
                    >
                      <Network className="w-3 h-3" />
                      {ref}
                    </button>
                  );
                } else if (isTerm) {
                  elements.push(
                    <button
                      key={`${i}-${ref}`}
                      onClick={() => onTermClick && onTermClick(ref)}
                      className="font-bold text-reformed-600 dark:text-reformed-400 hover:text-reformed-800 dark:hover:text-reformed-200 decoration-dotted underline underline-offset-4 cursor-pointer transition-colors"
                      title={`Search for "${ref}"`}
                    >
                      {ref}
                    </button>
                  );
                } else if (isScripture || isConfession) {
                  const type = isConfession ? 'confession' : 'scripture';
                  elements.push(
                    <button
                      key={`${i}-${ref}`}
                      onClick={() => fetchReferenceText(ref, type)}
                      className={`inline-flex items-center gap-1 font-bold hover:underline decoration-reformed-400 underline-offset-2 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors text-xs sm:text-sm align-baseline mx-0.5 transform active:scale-95 ${type === 'scripture'
                          ? 'text-reformed-700 dark:text-reformed-300 bg-reformed-100 dark:bg-reformed-800 hover:bg-reformed-200 dark:hover:bg-reformed-700 border border-reformed-200 dark:border-reformed-700'
                          : 'text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/50'
                        }`}
                      title={`Read ${type === 'scripture' ? 'Verse' : 'Section'}`}
                    >
                      {type === 'confession' ? <Scroll className="w-3 h-3 opacity-70" /> : <BookOpen className="w-3 h-3 opacity-70" />}
                      {ref}
                    </button>
                  );
                } else {
                  // Fallback just in case regex matched but logic failed
                  elements.push(ref);
                }
                lastIndex = match.index! + ref.length;
              });

              // Remaining text
              if (lastIndex < child.length) {
                elements.push(child.substring(lastIndex));
              }

              return elements;
            }
            // Return other elements (like <strong>, <em>) as is
            return child;
          })}
        </p>
      );
    }
  }), [activeBible, defaultBible, onTermClick, onViewConnections, connectionTitles]);

  const getHeaderTitle = () => {
    if (initialPrompt?.includes("hymn")) return "Hymn Search";
    if (activeConfession) return activeConfession.title;
    if (activeBible) return activeBible.title;
    if (activeHymn) return activeHymn.title;
    return "Theological Assistant";
  };

  const getHeaderSubtitle = () => {
    if (initialPrompt?.includes("hymn")) return "Extended Library Search";
    if (activeConfession) return `Context: ${activeConfession.date} • ${activeConfession.author} • ${activeConfession.structure}`;
    if (activeBible) return `Translation Date: ${activeBible.date}`;
    if (activeHymn) return `Author: ${activeHymn.author} (${activeHymn.date})`;
    return `Querying all Reformed Standards • Bible: ${defaultBible ? defaultBible.shortTitle : 'ESV'}`;
  };

  const renderDropdownOptions = () => {
    const options: React.ReactNode[] = [];
    let currentGroup: React.ReactNode[] = [];
    let currentGroupLabel = "Section";

    const hasHeaders = navItems.some(i => i.isHeader);

    if (!hasHeaders) {
      return navItems.map((item, idx) => (
        <option key={idx} value={item.reference}>{item.label}</option>
      ));
    }

    navItems.forEach((item, idx) => {
      if (item.isHeader) {
        if (currentGroup.length > 0) {
          options.push(
            <optgroup key={`group-${idx}`} label={currentGroupLabel}>
              {currentGroup}
            </optgroup>
          );
          currentGroup = [];
        }
        currentGroupLabel = item.label;
      } else {
        currentGroup.push(
          <option key={idx} value={item.reference}>
            {item.label}
          </option>
        );
      }
    });

    if (currentGroup.length > 0) {
      options.push(
        <optgroup key="group-last" label={currentGroupLabel}>
          {currentGroup}
        </optgroup>
      );
    }

    return options;
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] max-w-7xl mx-auto bg-white dark:bg-reformed-950 shadow-2xl border-x border-reformed-200 dark:border-reformed-800 relative transition-colors duration-300">
      {/* Scripture/Reference Modal */}
      {modalData && (
        <ScriptureModal
          reference={modalData.reference}
          text={modalData.text}
          type={modalData.type}
          version={modalData.version}
          isLoading={modalData.loading}
          onClose={() => setModalData(null)}
          onReferenceClick={(ref) => fetchReferenceText(ref, 'confession')}
        />
      )}

      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-reformed-200 dark:border-reformed-800 bg-reformed-50 dark:bg-reformed-900 flex justify-between items-center sticky top-0 z-20 transition-colors">
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden flex-1 min-w-0">
          {/* Mobile Menu Button for Sidebar */}
          {hasSidebar && (
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-reformed-500 hover:text-reformed-900 dark:text-reformed-400 dark:hover:text-white rounded-md active:bg-reformed-200 dark:active:bg-reformed-800 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="p-2 bg-reformed-800 dark:bg-reformed-700 rounded-lg text-white shrink-0">
            {initialPrompt?.includes("hymn") ? <Globe className="w-5 h-5" /> : activeConfession ? <BookOpen className="w-5 h-5" /> : activeBible ? <BookOpen className="w-5 h-5" /> : activeHymn ? <Music className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <h3 className="font-display font-bold text-reformed-900 dark:text-reformed-50 truncate text-sm sm:text-base leading-tight">
              {getHeaderTitle()}
            </h3>
            <p className="text-[10px] sm:text-xs text-reformed-600 dark:text-reformed-300 font-sans truncate">
              {getHeaderSubtitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 ml-2">
          {/* Quick Jump Dropdown for Tablets/Mobile (or when sidebar is hidden) */}
          {hasSidebar && (
            <div className="hidden sm:block max-w-[150px] md:max-w-[200px]">
              <select
                className="w-full bg-reformed-100 dark:bg-reformed-800 border-none rounded-lg text-xs font-bold text-reformed-700 dark:text-reformed-300 py-1.5 pl-2 pr-8 focus:ring-2 focus:ring-reformed-400 cursor-pointer truncate appearance-none"
                onChange={(e) => handleTOCNavigation(e.target.value)}
                value=""
                aria-label="Jump to Section"
              >
                <option value="" disabled>Jump to...</option>
                {renderDropdownOptions()}
              </select>
            </div>
          )}

          {/* Desktop Sidebar Toggle */}
          {hasSidebar && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex items-center text-xs font-medium text-reformed-500 hover:text-reformed-800 dark:text-reformed-400 dark:hover:text-reformed-200 px-3 py-1.5 rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-800 transition-colors"
            >
              {isSidebarOpen ? 'Hide Navigation' : 'Show Navigation'}
            </button>
          )}
          <button onClick={onClose} className="p-2 text-reformed-500 dark:text-reformed-400 hover:text-reformed-900 dark:hover:text-white hover:bg-reformed-200 dark:hover:bg-reformed-800 rounded-full transition-colors shrink-0" title="Close Study Session">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar (Desktop) */}
        {hasSidebar && isSidebarOpen && (
          <aside className="hidden lg:block w-64 border-r border-reformed-200 dark:border-reformed-800 bg-reformed-50/50 dark:bg-reformed-950/50 overflow-y-auto shrink-0 transition-all custom-scrollbar">
            <div className="p-4">
              <h4 className="text-xs font-bold text-reformed-400 dark:text-reformed-500 uppercase tracking-wider mb-4 px-2">
                Table of Contents
              </h4>
              <div className="space-y-1 pb-4">
                {navItems.map((item, idx) => (
                  item.isHeader ? (
                    <div key={idx} className="px-3 py-2 mt-4 text-xs font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-wider border-b border-reformed-100 dark:border-reformed-800/50">
                      {item.label}
                    </div>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => handleTOCNavigation(item.reference!)}
                      className="w-full text-left px-3 py-2 text-sm text-reformed-700 dark:text-reformed-300 hover:bg-reformed-200 dark:hover:bg-reformed-800 rounded-md transition-colors font-serif truncate"
                      title={item.label}
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Sidebar (Drawer) */}
        {hasSidebar && isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[60] flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs h-full bg-white dark:bg-reformed-900 shadow-xl flex flex-col animate-in slide-in-from-left duration-200 border-r border-reformed-200 dark:border-reformed-800">
              <div className="p-4 border-b border-reformed-100 dark:border-reformed-800 flex justify-between items-center bg-reformed-50 dark:bg-reformed-950">
                <h3 className="font-display font-bold text-reformed-900 dark:text-reformed-100">
                  Table of Contents
                </h3>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 -mr-2 text-reformed-500 hover:text-reformed-900 dark:text-reformed-400 dark:hover:text-reformed-100 rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item, idx) => (
                  item.isHeader ? (
                    <div key={idx} className="px-3 py-2 mt-4 text-xs font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-wider border-b border-reformed-100 dark:border-reformed-800/50">
                      {item.label}
                    </div>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => handleTOCNavigation(item.reference!)}
                      className="w-full text-left px-3 py-3 text-sm text-reformed-700 dark:text-reformed-300 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-md transition-colors font-serif border-b border-reformed-50 dark:border-reformed-800 last:border-0 active:bg-reformed-200 dark:active:bg-reformed-700"
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-full min-w-0 bg-stone-50/50 dark:bg-black/20">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                        max-w-[95%] sm:max-w-[85%] lg:max-w-[80%] rounded-2xl px-5 py-4 shadow-sm transition-colors
                        ${msg.role === 'user'
                      ? 'bg-reformed-800 text-white rounded-br-none'
                      : 'bg-white dark:bg-reformed-900 border border-reformed-200 dark:border-reformed-800 text-reformed-900 dark:text-reformed-100 rounded-bl-none'}
                        ${msg.isError ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200' : ''}
                    `}
                >
                  {msg.role === 'model' ? (
                    <div className="max-w-none">
                      <ReactMarkdown components={MarkdownComponents}>{msg.text}</ReactMarkdown>
                      {/* Sources Section */}
                      {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-reformed-200 dark:border-reformed-800">
                          <p className="text-[10px] font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-widest mb-3 flex items-center">
                            <Globe className="w-3 h-3 mr-1.5" /> Verified Sources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.groundingMetadata.groundingChunks.map((chunk, i) => (
                              chunk.web ? (
                                <a
                                  key={i}
                                  href={chunk.web.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-xs bg-reformed-50 dark:bg-reformed-950 border border-reformed-200 dark:border-reformed-800 rounded-md px-3 py-1.5 text-reformed-600 dark:text-reformed-300 hover:bg-reformed-100 dark:hover:bg-reformed-800 transition-colors hover:border-reformed-400"
                                >
                                  <Globe className="w-3 h-3 mr-1.5 opacity-50" />
                                  <span className="truncate max-w-[150px]">{chunk.web.title || new URL(chunk.web.uri!).hostname}</span>
                                </a>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-sans whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            {loadingState !== LoadingState.IDLE && (
              <div className="flex justify-start w-full">
                <div className="bg-white dark:bg-reformed-900 border border-reformed-200 dark:border-reformed-800 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm flex items-center space-x-2 transition-colors">
                  <div className="w-2 h-2 bg-reformed-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-reformed-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-reformed-800 dark:bg-reformed-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-reformed-900 border-t border-reformed-200 dark:border-reformed-800 transition-colors z-10">
            <div className="relative max-w-4xl mx-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setMessages([]);
                  chatSessionRef.current = createChatSession();
                  if (initialPrompt) {
                    handleSendMessage(initialPrompt, true);
                  } else if (activeConfession) {
                    const initialPrompt = `I am studying the ${activeConfession.title}. Please provide a brief 2-sentence introduction to this document.`;
                    handleSendMessage(initialPrompt, true);
                  } else if (activeBible) {
                    const initialPrompt = `I am studying the ${activeBible.title}. Please provide a brief introduction.`;
                    handleSendMessage(initialPrompt, true);
                  } else if (activeHymn) {
                    const initialPrompt = `I want to study the hymn "${activeHymn.title}". Please provide the lyrics.`;
                    handleSendMessage(initialPrompt, true);
                  } else {
                    setMessages([{ role: 'model', text: 'Conversation cleared. How can I help you with the Reformed Standards?' }]);
                  }
                }}
                className="p-2 sm:p-3 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors shrink-0"
                title="Reset Chat"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeConfession ? `Ask about...` : "Type your question..."}
                  className="w-full bg-reformed-50 dark:bg-reformed-800 text-reformed-900 dark:text-reformed-100 placeholder-reformed-400 border border-reformed-300 dark:border-reformed-700 rounded-full py-3 pl-4 sm:pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-reformed-500 focus:border-transparent font-sans shadow-inner transition-colors text-base appearance-none"
                  disabled={loadingState !== LoadingState.IDLE}
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || loadingState !== LoadingState.IDLE}
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-2 bg-reformed-800 dark:bg-reformed-700 text-white rounded-full hover:bg-reformed-700 dark:hover:bg-reformed-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] sm:text-xs text-reformed-400 dark:text-reformed-500 font-sans">AI generated responses. Verified against sources.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
